import type { HeatmapMode } from "@/components/heatmap/mode-toggle";
import { formatNumber, plural } from "@/lib/format";

type HeatLegendProps = {
  mode: HeatmapMode;
  shown: number;
  /** Real min / max clicks per grid cell among the shown clicks. */
  minCount: number;
  maxCount: number;
};

/** Grid: the heat ramp with the real min and max clicks per cell. Dots: one dot per click and how many are shown. */
export function HeatLegend({ mode, shown, minCount, maxCount }: HeatLegendProps) {
  if (mode === "dots") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-2.5 rounded-full bg-event-click opacity-55" aria-hidden />
        <span>1 dot = 1 click · {plural(shown, "click")} shown</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
      <span>{formatNumber(minCount)}</span>
      <span
        className="h-2 w-32 rounded-full"
        style={{ background: "linear-gradient(90deg, var(--heat-1), var(--heat-2), var(--heat-3), var(--heat-4))" }}
        aria-hidden
      />
      <span>{formatNumber(maxCount)}</span>
      <span>clicks per 24px cell</span>
    </div>
  );
}
