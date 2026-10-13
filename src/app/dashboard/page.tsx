import { Suspense } from "react";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCardSkeleton } from "@/components/dashboard/stat-card-skeleton";

export default function OverviewPage() {
  return (
    <>
      <PageHeader eyebrow="Dashboard" title="Overview" description="Everything the tracker has recorded so far." />
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <OverviewStats />
      </Suspense>
    </>
  );
}
