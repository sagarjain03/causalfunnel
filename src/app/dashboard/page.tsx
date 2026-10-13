import { Suspense } from "react";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { OverviewStatsSkeleton } from "@/components/dashboard/overview-stats-skeleton";

// 12-column bento grid (DESIGN.md §6). Step A has only the totals card; Step B fills the rest.
export default function OverviewPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <Suspense fallback={<OverviewStatsSkeleton />}>
        <OverviewStats />
      </Suspense>
    </div>
  );
}
