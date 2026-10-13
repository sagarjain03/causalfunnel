import { Suspense } from "react";
import { PageTitle } from "@/components/dashboard/page-title";
import { HeatmapData } from "@/components/heatmap/heatmap-data";
import { HeatmapSkeleton } from "@/components/heatmap/heatmap-skeleton";
import { HeatmapSummary } from "@/components/heatmap/heatmap-summary";

// Not async: searchParams (?page=, ?w=) is passed down as a Promise so the title stays in the static shell.
export default function HeatmapPage({ searchParams }: PageProps<"/dashboard/heatmap">) {
  return (
    <>
      <PageTitle title="Heatmap" summary={<HeatmapSummary searchParams={searchParams} />} />
      <Suspense fallback={<HeatmapSkeleton />}>
        <HeatmapData searchParams={searchParams} />
      </Suspense>
    </>
  );
}
