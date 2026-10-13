import { loadKpis, loadLastEventAt } from "@/components/overview/overview-data";
import { resolveOverviewParams, type OverviewSearchParams } from "@/components/overview/overview-params";
import { formatRelative, plural } from "@/lib/format";

/** "{n} journeys and {m} events in the last 7 days. Last activity {relative time}. (Asia/Kolkata)" */
export async function OverviewSummary({ searchParams }: { searchParams: OverviewSearchParams }) {
  const { days, tz, tzFromViewer, now } = await resolveOverviewParams(await searchParams);
  const [{ current }, lastEventAt] = await Promise.all([loadKpis(days, tz, now), loadLastEventAt()]);
  const activity = lastEventAt ? `Last activity ${formatRelative(lastEventAt.toISOString(), now)}.` : "No activity yet.";
  const zone = tzFromViewer ? tz : "UTC, browser time zone not known yet";
  return `${plural(current.journeys, "journey")} and ${plural(current.events, "event")} in the last ${days} days. ${activity} (${zone})`;
}
