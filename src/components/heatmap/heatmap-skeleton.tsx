import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Loading state in the heatmap's shape: toolbar pill, then the preview card. No numbers. */
export function HeatmapSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading heatmap">
      <Skeleton className="h-12 w-full max-w-xl rounded-full" />
      <Card className="gap-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="aspect-video w-full rounded-tile" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-9 w-full rounded-full" />
      </Card>
    </div>
  );
}
