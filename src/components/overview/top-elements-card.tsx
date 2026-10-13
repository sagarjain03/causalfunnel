import Link from "next/link";
import { CardEmpty } from "@/components/overview/card-empty";
import { loadTopTargets } from "@/components/overview/overview-data";
import { OverviewCard } from "@/components/overview/overview-card";
import { resolveOverviewParams, type OverviewSearchParams } from "@/components/overview/overview-params";
import { formatNumber, pageLabel } from "@/lib/format";

/** Row 3: the 6 most clicked elements (page + target), hatched bars, rows link to that page's heatmap. */
export async function TopElementsCard({ searchParams }: { searchParams: OverviewSearchParams }) {
  const { days, tz, now } = await resolveOverviewParams(await searchParams);
  const { rows, withoutTarget } = await loadTopTargets(days, tz, now);
  const max = Math.max(1, ...rows.map((r) => r.clicks));

  return (
    <OverviewCard title="Top clicked elements" description="By clicks in the period." className="lg:col-span-4">
      {rows.length === 0 ? (
        <CardEmpty message={`No clicked elements in the last ${days} days.`} />
      ) : (
        <ol className="flex flex-col gap-1">
          {rows.map((r) => (
            <li key={`${r.pageUrl}-${r.target}`}>
              <Link
                href={`/dashboard/heatmap?page=${encodeURIComponent(r.pageUrl)}`}
                className="flex flex-col gap-1 rounded-tile px-2 py-1.5 hover:bg-panel-raised"
                title={`${r.target} on ${r.pageUrl}`}
              >
                <span className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{r.target}</span>
                  <span className="glass shrink-0 rounded-full px-2 py-0.5 text-xs">{pageLabel(r.pageUrl)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 flex-1 overflow-hidden rounded-r-md">
                    <span className="hatch block h-full rounded-r-md border border-line" style={{ width: `${(r.clicks / max) * 100}%` }} />
                  </span>
                  <span className="w-10 text-right text-xs tabular-nums">{formatNumber(r.clicks)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      {withoutTarget > 0 && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatNumber(withoutTarget)} older clicks have no element description and aren&apos;t ranked.
        </p>
      )}
    </OverviewCard>
  );
}
