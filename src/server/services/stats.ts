import { connectDb } from "@/server/db";
import { EventModel } from "@/server/models/event";
import type { OverviewStats } from "@/types";

type CountFacet = { n: number }[];

/** Time of the newest event (for the Live/Idle dot), or null if there are none. Uses the { timestamp: -1 } index. */
export async function getLastEventAt(): Promise<Date | null> {
  await connectDb();
  const newest = await EventModel.findOne({}, { _id: 0, timestamp: 1 }).sort({ timestamp: -1 }).lean();
  return newest?.timestamp ?? null;
}

/** Totals for the dashboard overview, computed in a single $facet query. */
export async function getOverviewStats(): Promise<OverviewStats> {
  await connectDb();
  const [result] = await EventModel.aggregate<Record<keyof OverviewStats, CountFacet>>([
    {
      $facet: {
        sessions: [{ $group: { _id: "$session_id" } }, { $count: "n" }],
        events: [{ $count: "n" }],
        clicks: [{ $match: { event_type: "click" } }, { $count: "n" }],
        pages: [{ $group: { _id: "$page_url" } }, { $count: "n" }],
      },
    },
  ]);

  // $count emits no document for an empty input, so a missing entry means 0.
  const count = (facet: CountFacet | undefined) => facet?.[0]?.n ?? 0;
  return {
    sessions: count(result?.sessions),
    events: count(result?.events),
    clicks: count(result?.clicks),
    pages: count(result?.pages),
  };
}
