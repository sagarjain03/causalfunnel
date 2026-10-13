import { MousePointerClick } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { HeatmapView } from "@/components/heatmap/heatmap-view";
import { resolveHeatmapSelection, type HeatmapSearchParams } from "@/components/heatmap/heatmap-selection";
import { getHeatmap } from "@/server/services/heatmap";

/** Streams behind <Suspense>: the selected page's clicks at the selected exact width. */
export async function HeatmapData({ searchParams }: { searchParams: HeatmapSearchParams }) {
  const { pages, page, widths, width } = await resolveHeatmapSelection(await searchParams);

  const empty = (
    <EmptyState
      icon={MousePointerClick}
      title="No clicks on this page yet"
      description="Open the demo store and click around. Every click shows up here on the exact layout it was made on."
    />
  );
  if (!page) return empty;

  // Only clicks recorded at exactly this window width: x/y match the layout only at the width they were recorded at.
  const clicks = width ? (await getHeatmap(page, width.viewport_w)).clicks : [];
  return (
    <HeatmapView
      key={`${page}-${width?.viewport_w ?? "none"}`}
      pages={pages}
      page={page}
      widths={widths}
      width={width}
      clicks={clicks}
      empty={empty}
    />
  );
}
