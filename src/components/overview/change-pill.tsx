import { cn } from "@/lib/utils";

type ChangePillProps = {
  current: number;
  previous: number;
  /** "percent": relative change (counts, durations). "points": difference of two rates in percentage points. */
  kind: "percent" | "points";
  /** true when a rise is bad (bounce rate), so up is red and down is green. */
  inverse?: boolean;
};

/** Change vs the previous period: ↑ 12% / ↓ 0.8 pp, green when good, red when bad, "New" if previous was 0. */
export function ChangePill({ current, previous, kind, inverse = false }: ChangePillProps) {
  if (kind === "percent" && previous === 0) {
    return <span className={cn(pill, "bg-panel-raised text-muted-foreground")}>{current === 0 ? "No data" : "New"}</span>;
  }
  const delta = kind === "percent" ? ((current - previous) / previous) * 100 : (current - previous) * 100;
  const rounded = Math.round(delta * 10) / 10;
  if (rounded === 0) return <span className={cn(pill, "bg-panel-raised text-muted-foreground")}>No change</span>;
  const up = rounded > 0;
  const good = inverse ? !up : up;
  return (
    <span
      className={cn(pill, good ? "bg-up/12 text-up" : "bg-down/12 text-down")}
      title={`Previous period: ${kind === "points" ? `${(previous * 100).toFixed(1)}%` : previous.toLocaleString("en")}`}
    >
      {up ? "↑" : "↓"} {Math.abs(rounded).toLocaleString("en", { maximumFractionDigits: 1 })}
      {kind === "points" ? " pp" : "%"}
    </span>
  );
}

const pill = "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs tabular-nums whitespace-nowrap";
