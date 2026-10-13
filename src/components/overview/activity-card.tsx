import { ActivityChart } from "@/components/overview/activity-chart";
import { CardEmpty } from "@/components/overview/card-empty";
import { dayLabel } from "@/components/overview/day-label";
import { loadKpis } from "@/components/overview/overview-data";
import { OverviewCard } from "@/components/overview/overview-card";
import { resolveOverviewParams, type OverviewSearchParams } from "@/components/overview/overview-params";

/** Row 3: daily journeys (bars) and events (line) for the range, in the viewer's time zone. */
export async function ActivityCard({ searchParams }: { searchParams: OverviewSearchParams }) {
  const { days, tz, now } = await resolveOverviewParams(await searchParams);
  const { daily, current } = await loadKpis(days, tz, now);

  return (
    <OverviewCard title="Activity" description={`Journeys started (bars) and events (line) per day, ${tz}.`} className="lg:col-span-8">
      {current.events === 0 ? (
        <CardEmpty message={`No events in the last ${days} days.`} />
      ) : (
        <ActivityChart points={daily.map((d) => ({ day: d.day, label: dayLabel(d.day), journeys: d.journeys, events: d.events }))} />
      )}
    </OverviewCard>
  );
}
