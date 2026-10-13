import { connectDb } from "@/server/db";
import { EventModel } from "@/server/models/event";
import type { ClickPoint, ClickWidth, HeatmapData, PageSummary } from "@/types";

type ClickDoc = {
  x: number;
  y: number;
  viewport_w: number;
  page_h: number;
  layout_w?: number;
  target?: string;
  timestamp: Date;
};

/**
 * Click points for one (already normalized) page URL, oldest first.
 * With `viewportW`, only clicks recorded at exactly that window width (see getClickWidths for why).
 */
export async function getHeatmap(pageUrl: string, viewportW?: number): Promise<HeatmapData> {
  await connectDb();
  const filter = { page_url: pageUrl, event_type: "click" as const, ...(viewportW ? { viewport_w: viewportW } : {}) };
  const docs = await EventModel.find(filter, { _id: 0, x: 1, y: 1, viewport_w: 1, page_h: 1, layout_w: 1, target: 1, timestamp: 1 })
    .sort({ timestamp: 1, _id: 1 })
    .lean<ClickDoc[]>();

  const clicks: ClickPoint[] = docs.map((d) => ({
    x: d.x,
    y: d.y,
    viewport_w: d.viewport_w,
    page_h: d.page_h,
    ...(d.layout_w ? { layout_w: d.layout_w } : {}),
    ...(d.target ? { target: d.target } : {}),
    timestamp: d.timestamp.toISOString(),
  }));
  return { page_url: pageUrl, clicks };
}

/**
 * The exact window widths a page was clicked at, most clicks first.
 *
 * Why exact widths, not desktop/mobile buckets: a responsive page lays out differently at 1280px and 1536px, so a click's
 * (x, y) only lands on the right element when the page is rendered at the width it was recorded at. Mixing widths would
 * put dots on the wrong elements, so the heatmap shows one width at a time.
 *
 * render_w is the layout width to render the preview at: the most common layout_w (viewport minus scrollbar) in the
 * group, falling back to viewport_w for clicks recorded before the tracker sent layout_w.
 */
export async function getClickWidths(pageUrl: string): Promise<ClickWidth[]> {
  await connectDb();
  return EventModel.aggregate<ClickWidth>([
    { $match: { page_url: pageUrl, event_type: "click" } },
    {
      $group: {
        _id: { viewport_w: "$viewport_w", layout_w: "$layout_w" },
        clicks: { $sum: 1 },
        page_h: { $max: "$page_h" },
      },
    },
    // Within each width, prefer groups that have a layout_w, then the most clicks.
    { $addFields: { hasLayout: { $cond: [{ $gt: ["$_id.layout_w", 0] }, 1, 0] } } },
    { $sort: { hasLayout: -1, clicks: -1 } },
    {
      $group: {
        _id: "$_id.viewport_w",
        clicks: { $sum: "$clicks" },
        page_h: { $max: "$page_h" },
        layout_w: { $first: "$_id.layout_w" },
      },
    },
    {
      $project: {
        _id: 0,
        viewport_w: "$_id",
        clicks: 1,
        page_h: 1,
        render_w: { $ifNull: ["$layout_w", "$_id"] },
      },
    },
    { $sort: { clicks: -1, viewport_w: -1 } },
  ]);
}

/** Every tracked page with its click and view counts, most viewed first. */
export async function listPages(): Promise<PageSummary[]> {
  await connectDb();
  return EventModel.aggregate<PageSummary>([
    {
      $group: {
        _id: "$page_url",
        clicks: { $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] } },
        views: { $sum: { $cond: [{ $eq: ["$event_type", "page_view"] }, 1, 0] } },
      },
    },
    { $project: { _id: 0, page_url: "$_id", clicks: 1, views: 1 } },
    { $sort: { views: -1, page_url: 1 } },
  ]);
}

/** Pages for the heatmap selector: like listPages, without /__test/ URLs, most clicked first. */
export async function listHeatmapPages(): Promise<PageSummary[]> {
  await connectDb();
  return EventModel.aggregate<PageSummary>([
    { $match: { page_url: { $not: /\/__test\// } } },
    {
      $group: {
        _id: "$page_url",
        clicks: { $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] } },
        views: { $sum: { $cond: [{ $eq: ["$event_type", "page_view"] }, 1, 0] } },
      },
    },
    { $project: { _id: 0, page_url: "$_id", clicks: 1, views: 1 } },
    { $sort: { clicks: -1, views: -1, page_url: 1 } },
  ]);
}
