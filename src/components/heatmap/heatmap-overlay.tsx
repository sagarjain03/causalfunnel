import type { HeatmapMode } from "@/components/heatmap/mode-toggle";
import { cn } from "@/lib/utils";
import type { ClickPoint } from "@/types";

/** Grid cell size in PAGE pixels (scaled with the preview). */
export const CELL = 24;
const DOT = 10;

export type GridCell = { cx: number; cy: number; count: number };

/** Clicks bucketed into CELL×CELL page-pixel cells. */
export function buildGrid(clicks: ClickPoint[]): GridCell[] {
  const counts = new Map<string, GridCell>();
  for (const c of clicks) {
    const cx = Math.floor(c.x / CELL);
    const cy = Math.floor(c.y / CELL);
    const key = `${cx},${cy}`;
    const cell = counts.get(key);
    if (cell) cell.count++;
    else counts.set(key, { cx, cy, count: 1 });
  }
  return [...counts.values()];
}

/** Heat ramp step for count / maxCount (empty cells are never rendered, so they stay transparent). */
function heatClass(ratio: number): string {
  if (ratio <= 0.25) return "bg-heat-1";
  if (ratio <= 0.5) return "bg-heat-2";
  if (ratio <= 0.75) return "bg-heat-3";
  return "bg-heat-4";
}

type HeatmapOverlayProps = {
  mode: HeatmapMode;
  clicks: ClickPoint[];
  cells: GridCell[];
  maxCount: number;
  /** Screen pixels per page pixel (from ScaledPageFrame). */
  scale: number;
};

/** Dots or grid drawn in the same scaled box as the page iframe: page (x, y) → screen (x, y) × scale. */
export function HeatmapOverlay({ mode, clicks, cells, maxCount, scale }: HeatmapOverlayProps) {
  if (mode === "grid") {
    const size = CELL * scale;
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {cells.map((cell) => (
          <span
            key={`${cell.cx},${cell.cy}`}
            className={cn("absolute opacity-70", heatClass(cell.count / maxCount))}
            style={{ left: cell.cx * size, top: cell.cy * size, width: size, height: size }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {clicks.map((c, i) => (
        // Semi-transparent with screen blending, so overlapping clicks glow brighter.
        <span
          key={`${c.timestamp}-${i}`}
          className="absolute rounded-full bg-event-click opacity-55 mix-blend-screen"
          style={{ left: c.x * scale - DOT / 2, top: c.y * scale - DOT / 2, width: DOT, height: DOT }}
        />
      ))}
    </div>
  );
}
