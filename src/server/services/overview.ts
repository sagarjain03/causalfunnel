import { connectDb } from "@/server/db";
import { EventModel } from "@/server/models/event";

/**
 * Overview dashboard metrics. All counting/grouping happens in MongoDB aggregations; JavaScript only fills days
 * that had no data with 0 and shapes the result.
 *
 * Definitions:
 * - A journey (session) belongs to the period its FIRST event falls in.
 * - Current period: the last `days` calendar days in `tz`, today included up to now.
 * - Previous period: the `days` days before that, cut at the same time of day, so both cover the same elapsed time.
 */

export type RangeDays = 7 | 14 | 28;
export type OverviewQuery = { days: RangeDays; tz: string; now?: number };

const DAY = 86_400_000;

/** Demo store funnel, in order. `pattern` matches the end of the normalized page_url. */
export const FUNNEL_STEPS = [
  { key: "home", label: "Home", pattern: /\/demo$/ },
  { key: "products", label: "Products", pattern: /\/demo\/products\.html$/ },
  { key: "product", label: "Product", pattern: /\/demo\/product\.html$/ },
  { key: "checkout", label: "Checkout", pattern: /\/demo\/checkout\.html$/ },
] as const;
const CHECKOUT = /\/checkout\.html$/;

// --- period helpers -------------------------------------------------------------------------------------------------

/** "YYYY-MM-DD" of an instant in a time zone. */
export function dayKey(ms: number, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(ms);
}

/** Offset (ms) of `tz` from UTC at instant `ms`. */
function tzOffset(ms: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(ms);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** UTC instant of local midnight (in `tz`) of the day containing `ms`. */
function startOfDay(ms: number, tz: string): number {
  const [y, m, d] = dayKey(ms, tz).split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d);
  const first = guess - tzOffset(guess, tz);
  return guess - tzOffset(first, tz); // second pass handles DST changes near midnight
}

export function periodBounds({ days, tz, now = Date.now() }: OverviewQuery) {
  const curStart = startOfDay(now - (days - 1) * DAY, tz);
  const prevStart = curStart - days * DAY;
  const prevEnd = now - days * DAY;
  // Day keys of the current period, oldest first (noon-based stepping avoids DST edge cases).
  const keys = Array.from({ length: days }, (_, i) => dayKey(curStart + 12 * 3_600_000 + i * DAY, tz));
  return { now, curStart, prevStart, prevEnd, keys };
}

type Bounds = ReturnType<typeof periodBounds>;

/** Expression: "cur" | "prev" | "out" for a Date field. */
function periodOf(field: string, b: Bounds) {
  return {
    $switch: {
      branches: [
        { case: { $and: [{ $gte: [field, new Date(b.curStart)] }, { $lt: [field, new Date(b.now)] }] }, then: "cur" },
        { case: { $and: [{ $gte: [field, new Date(b.prevStart)] }, { $lt: [field, new Date(b.prevEnd)] }] }, then: "prev" },
      ],
      default: "out",
    },
  };
}

/** Events that can belong to either period (1h margin so sessions started just before prevStart are seen whole). */
function eventsWindow(b: Bounds) {
  return { $match: { timestamp: { $gte: new Date(b.prevStart - 3_600_000), $lt: new Date(b.now) } } };
}

/** One row per session (apply after eventsWindow): first/last event, page views, checkout, widest click, steps. */
function sessionGroup(b: Bounds) {
  return [
    {
      $group: {
        _id: "$session_id",
        first: { $min: "$timestamp" },
        last: { $max: "$timestamp" },
        pageViews: { $sum: { $cond: [{ $eq: ["$event_type", "page_view"] }, 1, 0] } },
        checkout: { $max: { $regexMatch: { input: "$page_url", regex: CHECKOUT } } },
        width: { $max: "$viewport_w" },
        ...Object.fromEntries(FUNNEL_STEPS.map((s) => [s.key, { $max: { $regexMatch: { input: "$page_url", regex: s.pattern } } }])),
      },
    },
    { $addFields: { period: periodOf("$first", b) } },
    { $match: { period: { $in: ["cur", "prev"] } } },
  ];
}

const dayOf = (field: string, tz: string) => ({ $dateToString: { format: "%Y-%m-%d", date: field, timezone: tz } });

// --- KPIs + daily series ------------------------------------------------------------------------------------------

export type PeriodTotals = { journeys: number; conversions: number; bounces: number; durationMs: number; clicks: number; events: number };
export type DailyPoint = PeriodTotals & { day: string };
export type OverviewKpis = { current: PeriodTotals; previous: PeriodTotals; daily: DailyPoint[] };

type GroupKey = { period: "cur" | "prev"; day: string | null };
type SessionAgg = { _id: GroupKey; journeys: number; conversions: number; bounces: number; durationMs: number };
type EventAgg = { _id: GroupKey; clicks: number; events: number };

const ZERO: PeriodTotals = { journeys: 0, conversions: 0, bounces: 0, durationMs: 0, clicks: 0, events: 0 };

/** Journeys, conversions, bounces, total duration, clicks and events for both periods, plus the current daily series. */
export async function getOverviewKpis(q: OverviewQuery): Promise<OverviewKpis> {
  const b = periodBounds(q);
  await connectDb();
  const [result] = await EventModel.aggregate<{ sessions: SessionAgg[]; events: EventAgg[] }>([
    eventsWindow(b),
    {
      $facet: {
        sessions: [
          ...sessionGroup(b),
          {
            $group: {
              _id: { period: "$period", day: { $cond: [{ $eq: ["$period", "cur"] }, dayOf("$first", q.tz), null] } },
              journeys: { $sum: 1 },
              conversions: { $sum: { $cond: ["$checkout", 1, 0] } },
              bounces: { $sum: { $cond: [{ $eq: ["$pageViews", 1] }, 1, 0] } },
              durationMs: { $sum: { $subtract: ["$last", "$first"] } },
            },
          },
        ],
        events: [
          { $addFields: { period: periodOf("$timestamp", b) } },
          { $match: { period: { $in: ["cur", "prev"] } } },
          {
            $group: {
              _id: { period: "$period", day: { $cond: [{ $eq: ["$period", "cur"] }, dayOf("$timestamp", q.tz), null] } },
              clicks: { $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] } },
              events: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const current = { ...ZERO };
  const previous = { ...ZERO };
  const byDay = new Map<string, DailyPoint>(b.keys.map((day) => [day, { day, ...ZERO }]));
  const add = (target: PeriodTotals, row: Partial<PeriodTotals>) => {
    for (const k of Object.keys(row) as (keyof PeriodTotals)[]) target[k] += row[k] ?? 0;
  };
  for (const r of [...(result?.sessions ?? []), ...(result?.events ?? [])]) {
    const { _id, ...values } = r;
    add(_id.period === "cur" ? current : previous, values);
    if (_id.period === "cur" && _id.day) {
      const point = byDay.get(_id.day);
      if (point) add(point, values);
    }
  }
  return { current, previous, daily: [...byDay.values()] };
}

// --- funnel, devices ---------------------------------------------------------------------------------------------

export type FunnelStep = { key: string; label: string; journeys: number; pageUrl: string | null };

/** Journeys started in the current period that visited each funnel step (any order), plus the step's page URL. */
export async function getFunnel(q: OverviewQuery): Promise<FunnelStep[]> {
  const b = periodBounds(q);
  await connectDb();
  const [result] = await EventModel.aggregate<{ counts: Record<string, number>[]; urls: { _id: string; n: number }[] }>([
    eventsWindow(b),
    {
      $facet: {
        counts: [
          ...sessionGroup(b),
          { $match: { period: "cur" } },
          {
            $group: {
              _id: null,
              ...Object.fromEntries(FUNNEL_STEPS.map((s) => [s.key, { $sum: { $cond: [`$${s.key}`, 1, 0] } }])),
            },
          },
        ],
        // Most common full URL per step path (for the heatmap link), from the current period's page views.
        urls: [
          { $match: { event_type: "page_view", timestamp: { $gte: new Date(b.curStart) } } },
          { $group: { _id: "$page_url", n: { $sum: 1 } } },
          { $sort: { n: -1 } },
        ],
      },
    },
  ]);
  const counts = result?.counts[0] ?? {};
  return FUNNEL_STEPS.map((s) => ({
    key: s.key,
    label: s.label,
    journeys: counts[s.key] ?? 0,
    pageUrl: result?.urls.find((u) => s.pattern.test(u._id))?._id ?? null,
  }));
}

export type DeviceSplit = {
  desktop: { journeys: number; conversions: number };
  mobile: { journeys: number; conversions: number };
  unknown: number;
};

/** Current-period journeys by widest click viewport: desktop ≥ 768px, mobile < 768px, unknown = no clicks. */
export async function getDeviceSplit(q: OverviewQuery): Promise<DeviceSplit> {
  const b = periodBounds(q);
  await connectDb();
  const rows = await EventModel.aggregate<{ _id: "desktop" | "mobile" | "unknown"; journeys: number; conversions: number }>([
    eventsWindow(b),
    ...sessionGroup(b),
    { $match: { period: "cur" } },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $gte: ["$width", 768] }, then: "desktop" },
              { case: { $gt: ["$width", 0] }, then: "mobile" },
            ],
            default: "unknown",
          },
        },
        journeys: { $sum: 1 },
        conversions: { $sum: { $cond: ["$checkout", 1, 0] } },
      },
    },
  ]);
  const get = (k: string) => rows.find((r) => r._id === k) ?? { journeys: 0, conversions: 0 };
  return {
    desktop: { journeys: get("desktop").journeys, conversions: get("desktop").conversions },
    mobile: { journeys: get("mobile").journeys, conversions: get("mobile").conversions },
    unknown: get("unknown").journeys,
  };
}

// --- clicks: top targets, grid -------------------------------------------------------------------------------------

export type TopTarget = { target: string; pageUrl: string; clicks: number };
export type TopTargets = { rows: TopTarget[]; withoutTarget: number };

/** Top (page, target) pairs by clicks in the current period; clicks recorded before `target` existed are counted apart. */
export async function getTopTargets(q: OverviewQuery, limit = 6): Promise<TopTargets> {
  const b = periodBounds(q);
  await connectDb();
  const [result] = await EventModel.aggregate<{ rows: { _id: { page_url: string; target: string }; clicks: number }[]; without: { n: number }[] }>([
    { $match: { event_type: "click", timestamp: { $gte: new Date(b.curStart), $lt: new Date(b.now) } } },
    {
      $facet: {
        rows: [
          { $match: { target: { $type: "string", $ne: "" } } },
          { $group: { _id: { page_url: "$page_url", target: "$target" }, clicks: { $sum: 1 } } },
          { $sort: { clicks: -1, "_id.target": 1 } },
          { $limit: limit },
        ],
        without: [{ $match: { $or: [{ target: { $exists: false } }, { target: "" }] } }, { $count: "n" }],
      },
    },
  ]);
  return {
    rows: (result?.rows ?? []).map((r) => ({ target: r._id.target, pageUrl: r._id.page_url, clicks: r.clicks })),
    withoutTarget: result?.without[0]?.n ?? 0,
  };
}

export type ClickGrid = { cells: { day: number; bucket: number; clicks: number }[]; min: number; max: number; total: number };

/** Current-period clicks by ISO weekday (1 = Mon) × 2-hour bucket (0–11), in the viewer's time zone. */
export async function getClickGrid(q: OverviewQuery): Promise<ClickGrid> {
  const b = periodBounds(q);
  await connectDb();
  const cells = await EventModel.aggregate<{ _id: { day: number; bucket: number }; clicks: number }>([
    { $match: { event_type: "click", timestamp: { $gte: new Date(b.curStart), $lt: new Date(b.now) } } },
    {
      $group: {
        _id: {
          day: { $isoDayOfWeek: { date: "$timestamp", timezone: q.tz } },
          bucket: { $floor: { $divide: [{ $hour: { date: "$timestamp", timezone: q.tz } }, 2] } },
        },
        clicks: { $sum: 1 },
      },
    },
  ]);
  const values = cells.map((c) => c.clicks);
  return {
    cells: cells.map((c) => ({ day: c._id.day, bucket: c._id.bucket, clicks: c.clicks })),
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0,
    total: values.reduce((s, v) => s + v, 0),
  };
}
