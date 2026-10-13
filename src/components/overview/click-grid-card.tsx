import { heatClass } from "@/components/heatmap/heatmap-overlay";
import { CardEmpty } from "@/components/overview/card-empty";
import { loadClickGrid } from "@/components/overview/overview-data";
import { OverviewCard } from "@/components/overview/overview-card";
import { resolveOverviewParams, type OverviewSearchParams } from "@/components/overview/overview-params";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BUCKETS = Array.from({ length: 12 }, (_, i) => i);
const hh = (h: number) => String(h).padStart(2, "0");

/** Row 4: clicks by ISO weekday × 2-hour block in the viewer's time zone, heat ramp with real min/max. */
export async function ClickGridCard({ searchParams }: { searchParams: OverviewSearchParams }) {
  const { days, tz, now } = await resolveOverviewParams(await searchParams);
  const grid = await loadClickGrid(days, tz, now);
  const count = new Map(grid.cells.map((c) => [`${c.day}-${c.bucket}`, c.clicks]));

  return (
    <OverviewCard title="Clicks by day and hour" description={`2-hour blocks, ${tz}.`} className="lg:col-span-8">
      {grid.total === 0 ? (
        <CardEmpty message={`No clicks in the last ${days} days.`} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-panel" />
                  {BUCKETS.map((b) => (
                    <th key={b} className="font-normal text-muted-foreground tabular-nums">
                      {hh(b * 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((label, d) => (
                  <tr key={label}>
                    <th className="sticky left-0 bg-panel pr-2 text-left font-normal text-muted-foreground">{label}</th>
                    {BUCKETS.map((b) => {
                      const clicks = count.get(`${d + 1}-${b}`) ?? 0;
                      return (
                        <td
                          key={b}
                          title={`${label} ${hh(b * 2)}–${hh(b * 2 + 2)}: ${formatNumber(clicks)} click${clicks === 1 ? "" : "s"}`}
                          className={cn("h-7 rounded-[4px] border border-line", clicks > 0 && heatClass(clicks / grid.max))}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
            <span>{formatNumber(grid.min)}</span>
            <span
              className="h-2 w-32 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--heat-1), var(--heat-2), var(--heat-3), var(--heat-4))" }}
              aria-hidden
            />
            <span>{formatNumber(grid.max)}</span>
            <span>clicks per block · empty = 0</span>
          </div>
        </>
      )}
    </OverviewCard>
  );
}
