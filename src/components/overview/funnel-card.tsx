import { Fragment } from "react";
import Link from "next/link";
import { CardEmpty } from "@/components/overview/card-empty";
import { loadFunnel } from "@/components/overview/overview-data";
import { OverviewCard } from "@/components/overview/overview-card";
import { resolveOverviewParams, type OverviewSearchParams } from "@/components/overview/overview-params";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/** Row 2: Home → Products → Product → Checkout, hatched bars, drop-off between steps, rows link to the heatmap. */
export async function FunnelCard({ searchParams }: { searchParams: OverviewSearchParams }) {
  const { days, tz, now } = await resolveOverviewParams(await searchParams);
  const steps = await loadFunnel(days, tz, now);
  const first = steps[0]?.journeys ?? 0;
  const max = Math.max(1, ...steps.map((s) => s.journeys));

  return (
    <OverviewCard
      title="Funnel"
      description="Journeys started in the period that visited each page (in any order)."
      className="lg:col-span-8"
    >
      {first === 0 && steps.every((s) => s.journeys === 0) ? (
        <CardEmpty message={`No journeys in the last ${days} days.`} />
      ) : (
        <ol className="flex flex-col">
          {steps.map((step, i) => {
            const next = steps[i + 1];
            const row = (
              <div className="grid grid-cols-[4.5rem_1fr_auto] sm:grid-cols-[5.5rem_1fr_auto] items-center gap-3 rounded-tile px-2 py-2 hover:bg-panel-raised">
                <span className="text-sm">{step.label}</span>
                <span className="h-6 overflow-hidden rounded-r-md">
                  <span
                    className={cn("block h-full rounded-r-md border border-line", i === steps.length - 1 ? "bg-sage" : "hatch")}
                    style={{ width: `${(step.journeys / max) * 100}%` }}
                  />
                </span>
                <span className="flex w-14 flex-col items-end text-sm tabular-nums sm:w-28 sm:flex-row sm:justify-end sm:gap-2">
                  {formatNumber(step.journeys)}
                  <span className="text-xs text-muted-foreground sm:text-sm">{first > 0 ? pct(step.journeys / first) : "—"}</span>
                </span>
              </div>
            );
            return (
              <Fragment key={step.key}>
                <li>
                  {step.pageUrl ? (
                    <Link href={`/dashboard/heatmap?page=${encodeURIComponent(step.pageUrl)}`} title={`Open the ${step.label} heatmap`}>
                      {row}
                    </Link>
                  ) : (
                    row
                  )}
                </li>
                {next && (
                  <li className="pl-[5.25rem] text-xs sm:pl-[6.25rem] text-muted-foreground tabular-nums" aria-label={`Drop-off from ${step.label} to ${next.label}`}>
                    ↓ {step.journeys > 0 ? pct(1 - next.journeys / step.journeys) : "—"} drop-off
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      )}
    </OverviewCard>
  );
}
