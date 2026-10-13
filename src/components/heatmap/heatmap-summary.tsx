import { resolveHeatmapSelection, type HeatmapSearchParams } from "@/components/heatmap/heatmap-selection";
import { pageLabel, plural } from "@/lib/format";

/** "{n} clicks on {page} at {width}px." — n = clicks for the selected page AND exact width. */
export async function HeatmapSummary({ searchParams }: { searchParams: HeatmapSearchParams }) {
  const { page, width } = await resolveHeatmapSelection(await searchParams);
  if (!page) return "No clicks recorded yet.";
  if (!width) return `No clicks on ${pageLabel(page)} yet.`;
  return `${plural(width.clicks, "click")} on ${pageLabel(page)} at ${width.viewport_w}px.`;
}
