import Link from "next/link";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClickWidth } from "@/types";

/**
 * One chip per exact window width the page was clicked at ("1536px · 42"), writing ?w=.
 * Exact widths, not desktop/mobile buckets: x/y only match the layout at the width they were recorded at.
 */
export function WidthChips({ page, widths, selected }: { page: string; widths: ClickWidth[]; selected: number | null }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto" role="group" aria-label="Screen width">
      {widths.map((w) => {
        const active = w.viewport_w === selected;
        return (
          <Link
            key={w.viewport_w}
            href={`/dashboard/heatmap?page=${encodeURIComponent(page)}&w=${w.viewport_w}`}
            scroll={false}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex h-9 shrink-0 items-center rounded-full px-3 text-sm whitespace-nowrap tabular-nums",
              active ? "glass-shine bg-panel-raised text-foreground" : "glass text-muted-foreground hover:text-foreground",
            )}
          >
            {w.viewport_w}px · {formatNumber(w.clicks)}
          </Link>
        );
      })}
    </div>
  );
}
