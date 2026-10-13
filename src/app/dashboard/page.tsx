import { Suspense } from "react";
import { OverviewSummary } from "@/components/dashboard/overview-summary";
import { PageTitle } from "@/components/dashboard/page-title";
import { ActivityCard } from "@/components/overview/activity-card";
import { CardErrorBoundary } from "@/components/overview/card-error-boundary";
import { CardSkeleton } from "@/components/overview/card-skeleton";
import { ClickGridCard } from "@/components/overview/click-grid-card";
import { DeviceCard } from "@/components/overview/device-card";
import { FunnelCard } from "@/components/overview/funnel-card";
import { KpiStrip } from "@/components/overview/kpi-strip";
import { RangeSelect, RangeSelectLinks } from "@/components/overview/range-select";
import { RecentJourneysCard } from "@/components/overview/recent-journeys-card";
import { TopElementsCard } from "@/components/overview/top-elements-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:col-span-12 lg:grid-cols-5" aria-busy="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Card key={i} className={i === 4 ? "col-span-2 gap-3 lg:col-span-1" : "gap-3"}>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-full" />
        </Card>
      ))}
    </div>
  );
}

// 12-column bento (DESIGN.md §6). The page stays sync: ?range and the cf_tz cookie are read inside each Suspense child,
// and every card has its own error boundary + skeleton so one failing query never blanks the page.
export default function OverviewPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <>
      <PageTitle
        title="Overview"
        summary={<OverviewSummary searchParams={searchParams} />}
        action={
          <Suspense fallback={<RangeSelectLinks active={null} />}>
            <RangeSelect searchParams={searchParams} />
          </Suspense>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <CardErrorBoundary title="KPIs" className="lg:col-span-12">
          <Suspense fallback={<KpiSkeleton />}>
            <KpiStrip searchParams={searchParams} />
          </Suspense>
        </CardErrorBoundary>
        <CardErrorBoundary title="Funnel" className="lg:col-span-8">
          <Suspense fallback={<CardSkeleton className="lg:col-span-8" bodyClassName="h-72" />}>
            <FunnelCard searchParams={searchParams} />
          </Suspense>
        </CardErrorBoundary>
        <CardErrorBoundary title="Devices" className="lg:col-span-4">
          <Suspense fallback={<CardSkeleton className="lg:col-span-4" bodyClassName="h-72" />}>
            <DeviceCard searchParams={searchParams} />
          </Suspense>
        </CardErrorBoundary>
        <CardErrorBoundary title="Activity" className="lg:col-span-8">
          <Suspense fallback={<CardSkeleton className="lg:col-span-8" bodyClassName="h-60" />}>
            <ActivityCard searchParams={searchParams} />
          </Suspense>
        </CardErrorBoundary>
        <CardErrorBoundary title="Top clicked elements" className="lg:col-span-4">
          <Suspense fallback={<CardSkeleton className="lg:col-span-4" bodyClassName="h-60" />}>
            <TopElementsCard searchParams={searchParams} />
          </Suspense>
        </CardErrorBoundary>
        <CardErrorBoundary title="Clicks by day and hour" className="lg:col-span-8">
          <Suspense fallback={<CardSkeleton className="lg:col-span-8" bodyClassName="h-64" />}>
            <ClickGridCard searchParams={searchParams} />
          </Suspense>
        </CardErrorBoundary>
        <CardErrorBoundary title="Recent journeys" className="lg:col-span-4">
          <Suspense fallback={<CardSkeleton className="lg:col-span-4" bodyClassName="h-64" />}>
            <RecentJourneysCard searchParams={searchParams} />
          </Suspense>
        </CardErrorBoundary>
      </div>
    </>
  );
}
