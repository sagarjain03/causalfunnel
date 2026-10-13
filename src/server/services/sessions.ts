import type { PipelineStage } from "mongoose";
import { connectDb } from "@/server/db";
import { HttpError } from "@/server/http";
import { EventModel } from "@/server/models/event";
import type { EventDto, EventType, SessionSummary, SessionsPage } from "@/types";

type Cursor = { lastSeen: Date; sessionId: string };

type SessionRow = Omit<SessionSummary, "first_seen" | "last_seen"> & {
  first_seen: Date;
  last_seen: Date;
};

function encodeCursor(row: SessionRow): string {
  return Buffer.from(JSON.stringify({ t: row.last_seen.toISOString(), s: row.session_id })).toString("base64url");
}

function decodeCursor(cursor: string): Cursor {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (typeof parsed === "object" && parsed !== null && "t" in parsed && "s" in parsed) {
      const { t, s } = parsed;
      const lastSeen = typeof t === "string" ? new Date(t) : null;
      if (lastSeen && !Number.isNaN(lastSeen.getTime()) && typeof s === "string") {
        return { lastSeen, sessionId: s };
      }
    }
  } catch {
    // fall through to the 400 below
  }
  throw new HttpError(400, "invalid_cursor", "cursor is invalid");
}

/** Drops consecutive duplicates (a reload or SPA re-render of the same page is one step): [a, a, b, a] → [a, b, a]. */
function collapseRepeats(urls: string[]): string[] {
  return urls.filter((url, i) => url !== urls[i - 1]);
}

/** Number of journeys and how many of them reached a page ending in /checkout.html. */
export async function getJourneyStats(): Promise<{ journeys: number; reachedCheckout: number }> {
  await connectDb();
  const [row] = await EventModel.aggregate<{ journeys: number; reachedCheckout: number }>([
    {
      $group: {
        _id: "$session_id",
        reached: { $max: { $regexMatch: { input: "$page_url", regex: /\/checkout\.html$/ } } },
      },
    },
    {
      $group: {
        _id: null,
        journeys: { $sum: 1 },
        reachedCheckout: { $sum: { $cond: ["$reached", 1, 0] } },
      },
    },
    { $project: { _id: 0, journeys: 1, reachedCheckout: 1 } },
  ]);
  return row ?? { journeys: 0, reachedCheckout: 0 };
}

/** Sessions derived from events, newest activity first, keyset-paginated on (last_seen, session_id). */
export async function listSessions({ limit, cursor }: { limit: number; cursor?: string }): Promise<SessionsPage> {
  const after = cursor ? decodeCursor(cursor) : null;

  const pipeline: PipelineStage[] = [
    // Time order first, so $push below builds each session's path in visit order.
    { $sort: { timestamp: 1, _id: 1 } },
    {
      $group: {
        _id: "$session_id",
        event_count: { $sum: 1 },
        click_count: { $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] } },
        page_view_count: { $sum: { $cond: [{ $eq: ["$event_type", "page_view"] }, 1, 0] } },
        first_seen: { $min: "$timestamp" },
        last_seen: { $max: "$timestamp" },
        pages: { $addToSet: "$page_url" },
        // true if any event is on the checkout page ($max over booleans: true > false)
        reached_checkout: { $max: { $regexMatch: { input: "$page_url", regex: /\/checkout\.html$/ } } },
        // page_url of every page_view in time order (null for clicks, filtered out below)
        path: { $push: { $cond: [{ $eq: ["$event_type", "page_view"] }, "$page_url", null] } },
      },
    },
    {
      $project: {
        _id: 0,
        session_id: "$_id",
        event_count: 1,
        click_count: 1,
        page_view_count: 1,
        first_seen: 1,
        last_seen: 1,
        pages: 1,
        reached_checkout: 1,
        path: { $filter: { input: "$path", cond: { $ne: ["$$this", null] } } },
      },
    },
  ];
  if (after) {
    pipeline.push({
      $match: {
        $or: [
          { last_seen: { $lt: after.lastSeen } },
          { last_seen: after.lastSeen, session_id: { $lt: after.sessionId } },
        ],
      },
    });
  }
  pipeline.push({ $sort: { last_seen: -1, session_id: -1 } }, { $limit: limit + 1 });

  await connectDb();
  const rows = await EventModel.aggregate<SessionRow>(pipeline);

  const page = rows.slice(0, limit);
  const last = page.at(-1);
  return {
    sessions: page.map((row) => ({
      ...row,
      path: collapseRepeats(row.path),
      first_seen: row.first_seen.toISOString(),
      last_seen: row.last_seen.toISOString(),
    })),
    nextCursor: rows.length > limit && last ? encodeCursor(last) : null,
  };
}

/** All events of one session in time order. Throws 404 if the session has no events. */
export async function getSessionEvents(sessionId: string): Promise<EventDto[]> {
  await connectDb();
  const docs = await EventModel.find({ session_id: sessionId }).sort({ timestamp: 1, _id: 1 }).lean();
  if (docs.length === 0) throw new HttpError(404, "not_found", "Session not found");

  return docs.map((doc) => ({
    id: doc._id.toString(),
    session_id: doc.session_id,
    event_type: doc.event_type as EventType,
    page_url: doc.page_url,
    timestamp: doc.timestamp.toISOString(),
    received_at: doc.received_at.toISOString(),
    x: doc.x ?? undefined,
    y: doc.y ?? undefined,
    viewport_w: doc.viewport_w ?? undefined,
    viewport_h: doc.viewport_h ?? undefined,
    page_h: doc.page_h ?? undefined,
    referrer: doc.referrer ?? undefined,
    user_agent: doc.user_agent ?? undefined,
  }));
}
