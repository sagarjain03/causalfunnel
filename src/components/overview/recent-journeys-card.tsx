import Link from "next/link";
import { CardEmpty } from "@/components/overview/card-empty";
import { loadRecent } from "@/components/overview/overview-data";
import { OverviewCard } from "@/components/overview/overview-card";
import { resolveOverviewParams, type OverviewSearchParams } from "@/components/overview/overview-params";
import { JourneyPath } from "@/components/sessions/journey-path";
import { StatusPill } from "@/components/sessions/status-pill";
import { formatRelative, shortId } from "@/lib/format";

/** Row 4: the newest 6 journeys overall (not limited to the range), linking to their detail page. */
export async function RecentJourneysCard({ searchParams }: { searchParams: OverviewSearchParams }) {
  const { now } = await resolveOverviewParams(await searchParams);
  const { sessions } = await loadRecent();

  return (
    <OverviewCard
      title="Recent journeys"
      description="Newest activity first."
      action={
        <Link href="/dashboard/journeys" className="shrink-0 text-xs text-sage hover:underline">
          All journeys
        </Link>
      }
      className="lg:col-span-4"
    >
      {sessions.length === 0 ? (
        <CardEmpty message="No journeys yet." />
      ) : (
        <ol className="flex flex-col gap-1">
          {sessions.map((s) => (
            <li key={s.session_id}>
              <Link href={`/dashboard/journeys/${s.session_id}`} className="flex flex-col gap-1.5 rounded-tile px-2 py-2 hover:bg-panel-raised">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs">{shortId(s.session_id)}</span>
                  <span className="text-xs text-muted-foreground" title={s.last_seen}>
                    {formatRelative(s.last_seen, now, "narrow")}
                  </span>
                </span>
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <JourneyPath path={s.path} max={3} />
                  <StatusPill reachedCheckout={s.reached_checkout} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </OverviewCard>
  );
}
