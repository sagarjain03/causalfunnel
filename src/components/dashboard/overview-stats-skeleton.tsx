import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewStatsSkeleton() {
  return (
    <Card className="lg:col-span-4" aria-busy="true" aria-label="Loading totals">
      <Skeleton className="h-6 w-20" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-tile bg-panel-raised p-4">
            <Skeleton className="h-9 w-24 bg-panel" />
            <Skeleton className="h-10 w-16 bg-panel md:h-12" />
          </div>
        ))}
      </div>
    </Card>
  );
}
