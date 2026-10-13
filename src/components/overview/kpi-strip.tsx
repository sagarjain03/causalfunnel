import { CardEmpty } from "@/components/overview/card-empty";
import { ChangePill } from "@/components/overview/change-pill";
import { dayLabel } from "@/components/overview/day-label";
import { loadKpis } from "@/components/overview/overview-data";
import { resolveOverviewParams, type OverviewSearchParams } from "@/components/overview/overview-params";
import { Sparkline } from "@/components/overview/sparkline";
import { Card } from "@/components/ui/card";
import { formatDuration, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DailyPoint, PeriodTotals } from "@/server/services/overview";

type Kpi = {
  label: string;
  hint: string;
  value: (t: PeriodTotals) => number;
  display: (v: number) => string;
  kind: "percent" | "points";
  format: "count" | "percent" | "duration";
  inverse?: boolean;
};

const ratio = (a: number, b: number) => (b > 0 ? a / b : 0);

const KPIS: Kpi[] = [
  { label: "Journeys", hint: "Sessions started in the period", value: (t) => t.journeys, display: formatNumber, kind: "percent", format: "count" },
  {
    label: "Conversion rate",
    hint: "Journeys that reached /checkout.html ÷ journeys",
    value: (t) => ratio(t.conversions, t.journeys),
    display: (v) => `${(v * 100).toFixed(1)}%`,
    kind: "points",
    format: "percent",
  },
  {
    label: "Avg journey duration",
    hint: "Last − first event, bounces count as 0s",
    value: (t) => ratio(t.durationMs, t.journeys),
    display: (v) => formatDuration(v),
    kind: "percent",
    format: "duration",
  },
  {
    label: "Bounce rate",
    hint: "Journeys with only one page view",
    value: (t) => ratio(t.bounces, t.journeys),
    display: (v) => `${(v * 100).toFixed(1)}%`,
    kind: "points",
    format: "percent",
    inverse: true,
  },
  { label: "Clicks", hint: "Click events in the period", value: (t) => t.clicks, display: formatNumber, kind: "percent", format: "count" },
];

/** Row 1: five KPI tiles with change vs the previous period and a daily sparkline. */
export async function KpiStrip({ searchParams }: { searchParams: OverviewSearchParams }) {
  const { days, tz, now } = await resolveOverviewParams(await searchParams);
  const { current, previous, daily } = await loadKpis(days, tz, now);

  if (current.journeys === 0 && previous.journeys === 0 && current.clicks === 0) {
    return (
      <Card className="lg:col-span-12">
        <CardEmpty message={`No journeys in the last ${days} days.`} />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:col-span-12 lg:grid-cols-5">
      {KPIS.map((kpi, i) => (
        <KpiTile key={kpi.label} kpi={kpi} current={current} previous={previous} daily={daily} className={cn(i === KPIS.length - 1 && "col-span-2 lg:col-span-1")} />
      ))}
    </div>
  );
}

function KpiTile({ kpi, current, previous, daily, className }: { kpi: Kpi; current: PeriodTotals; previous: PeriodTotals; daily: DailyPoint[]; className?: string }) {
  const now = kpi.value(current);
  // Rates have no previous value when the previous period had no journeys: show "New" instead of a fake 0%.
  const prevMissing = kpi.kind === "points" && previous.journeys === 0;
  return (
    <Card className={cn("min-w-0 gap-3", className)} title={kpi.hint}>
      <span className="text-sm text-muted-foreground">{kpi.label}</span>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="text-[28px] leading-none font-light whitespace-nowrap tabular-nums sm:text-[32px] md:text-[40px]">{kpi.display(now)}</span>
        <ChangePill current={now} previous={prevMissing ? 0 : kpi.value(previous)} kind={prevMissing ? "percent" : kpi.kind} inverse={kpi.inverse} />
      </div>
      <Sparkline
        label={kpi.label}
        format={kpi.format}
        points={daily.map((d) => ({ day: d.day, label: dayLabel(d.day, "long"), value: kpi.value(d) }))}
      />
    </Card>
  );
}
