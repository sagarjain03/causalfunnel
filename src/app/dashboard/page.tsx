import { Suspense } from "react";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { OverviewStatsSkeleton } from "@/components/dashboard/overview-stats-skeleton";
import { OverviewSummary } from "@/components/dashboard/overview-summary";
import { PageTitle } from "@/components/dashboard/page-title";

// 12-column bento grid (DESIGN.md §6). Step A has only the totals card; Step B fills the rest.
export default function OverviewPage() {
  return (
    <>
      <PageTitle title="Overview" summary={<OverviewSummary />} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Suspense fallback={<OverviewStatsSkeleton />}>
          <OverviewStats />
        </Suspense>
      </div>
    </>
  );
}
