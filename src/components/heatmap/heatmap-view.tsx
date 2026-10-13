"use client";

import { useMemo, useState, type ReactNode } from "react";
import { HeatLegend } from "@/components/heatmap/heat-legend";
import { buildGrid, HeatmapOverlay } from "@/components/heatmap/heatmap-overlay";
import { ModeToggle, type HeatmapMode } from "@/components/heatmap/mode-toggle";
import { PageSelect } from "@/components/heatmap/page-select";
import { ReplayBar } from "@/components/heatmap/replay-bar";
import { WidthChips } from "@/components/heatmap/width-chips";
import { ScaledPageFrame } from "@/components/scaled-page-frame";
import { Card } from "@/components/ui/card";
import { pathOf } from "@/lib/format";
import type { ClickPoint, ClickWidth, PageSummary } from "@/types";

type HeatmapViewProps = {
  pages: PageSummary[];
  page: string;
  widths: ClickWidth[];
  /** Selected exact width; null when this page has no clicks. */
  width: ClickWidth | null;
  /** Clicks on `page` recorded at exactly `width.viewport_w`, oldest first. */
  clicks: ClickPoint[];
  empty: ReactNode;
};

/**
 * Heatmap of one page at one exact window width. The page is rendered in an iframe at the clicks' layout width
 * (render_w) and full height, then scaled to the card; dots/grid share that scaled box, so a click's (x, y) lands on the
 * element it was made on. Mixing widths would misplace dots, because a responsive page lays out differently per width.
 */
export function HeatmapView({ pages, page, widths, width, clicks, empty }: HeatmapViewProps) {
  const [mode, setMode] = useState<HeatmapMode>("dots");
  const times = useMemo(() => clicks.map((c) => new Date(c.timestamp).getTime()), [clicks]);
  const start = times[0] ?? 0;
  const end = times[times.length - 1] ?? 0;
  const [cursor, setCursor] = useState(end);

  const shown = useMemo(() => clicks.filter((_, i) => times[i] <= cursor), [clicks, times, cursor]);
  const cells = useMemo(() => buildGrid(shown), [shown]);
  const counts = cells.map((c) => c.count);
  const maxCount = counts.length ? Math.max(...counts) : 0;
  const minCount = counts.length ? Math.min(...counts) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="glass flex flex-wrap items-center gap-2 rounded-card p-1.5 md:w-fit md:rounded-full">
        <PageSelect pages={pages} page={page} />
        {widths.length > 0 && <WidthChips page={page} widths={widths} selected={width?.viewport_w ?? null} />}
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {!width ? (
        empty
      ) : (
        <Card className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="truncate text-lg font-medium" title={page}>
              {pathOf(page)}
            </h2>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums" title="Rendered at the clicks' layout width">
              {width.render_w}×{width.page_h}
            </span>
          </div>
          <ScaledPageFrame
            pageUrl={page}
            width={width.render_w}
            height={width.page_h}
            // No scripts: the preview only needs layout. Same-origin keeps the demo's CSS and images loading normally.
            sandbox="allow-same-origin"
          >
            {(scale) => <HeatmapOverlay mode={mode} clicks={shown} cells={cells} maxCount={maxCount} scale={scale} />}
          </ScaledPageFrame>
          <HeatLegend mode={mode} shown={shown.length} minCount={minCount} maxCount={maxCount} />
          <ReplayBar start={start} end={end} value={cursor} onChange={setCursor} />
        </Card>
      )}
    </div>
  );
}
