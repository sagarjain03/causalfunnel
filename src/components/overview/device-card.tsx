import { CardEmpty } from "@/components/overview/card-empty";
import { loadDevices } from "@/components/overview/overview-data";
import { OverviewCard } from "@/components/overview/overview-card";
import { resolveOverviewParams, type OverviewSearchParams } from "@/components/overview/overview-params";
import { formatNumber } from "@/lib/format";

/** Row 2: desktop (≥768px) vs mobile journeys and their conversion rate; journeys without clicks are "unknown". */
export async function DeviceCard({ searchParams }: { searchParams: OverviewSearchParams }) {
  const { days, tz, now } = await resolveOverviewParams(await searchParams);
  const split = await loadDevices(days, tz, now);
  const rows = [
    { label: "Desktop", hint: "≥ 768px", ...split.desktop },
    { label: "Mobile", hint: "< 768px", ...split.mobile },
  ];
  const max = Math.max(1, ...rows.map((r) => r.journeys));
  const total = split.desktop.journeys + split.mobile.journeys + split.unknown;

  return (
    <OverviewCard title="Devices" description="By screen width of the journey's clicks." className="lg:col-span-4">
      {total === 0 ? (
        <CardEmpty message={`No journeys in the last ${days} days.`} />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span>
                  {r.label} <span className="text-xs text-muted-foreground">{r.hint}</span>
                </span>
                <span className="tabular-nums">{formatNumber(r.journeys)} journeys</span>
              </div>
              <span className="h-5 overflow-hidden rounded-r-md">
                <span className="hatch block h-full rounded-r-md border border-line" style={{ width: `${(r.journeys / max) * 100}%` }} />
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                Conversion {r.journeys > 0 ? `${((r.conversions / r.journeys) * 100).toFixed(1)}%` : "—"}
                {r.journeys > 0 && ` (${formatNumber(r.conversions)} reached checkout)`}
              </span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground tabular-nums">
            Unknown (no clicks): {formatNumber(split.unknown)} journeys. Page views carry no screen width.
          </p>
        </div>
      )}
    </OverviewCard>
  );
}
