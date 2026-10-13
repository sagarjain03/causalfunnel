import { connectDb } from "@/server/db";
import { EventModel } from "@/server/models/event";
import type { ClickPoint, HeatmapData, PageSummary } from "@/types";

/** Click points for one (already normalized) page URL. */
export async function getHeatmap(pageUrl: string): Promise<HeatmapData> {
  await connectDb();
  const clicks = await EventModel.find(
    { page_url: pageUrl, event_type: "click" },
    { _id: 0, x: 1, y: 1, viewport_w: 1, page_h: 1 },
  )
    .sort({ timestamp: 1 })
    .lean<ClickPoint[]>();

  return { page_url: pageUrl, clicks };
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
