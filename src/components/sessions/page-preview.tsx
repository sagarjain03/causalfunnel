"use client";

import { ScaledPageFrame } from "@/components/scaled-page-frame";
import { Card } from "@/components/ui/card";
import { pathOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventDto } from "@/types";

const DEFAULT_SIZE = { width: 1280, height: 800 };
const DOT_SIZE = 14;

type PagePreviewProps = {
  event: EventDto;
  className?: string;
};

/**
 * Scaled iframe of the selected step's page. For a click, the page is laid out at the visitor's own viewport width
 * and full page height, so the dot at (x, y) lands on the element they clicked.
 */
export function PagePreview({ event, className }: PagePreviewProps) {
  const isClick = event.event_type === "click" && event.x !== undefined && event.y !== undefined;
  const width = isClick && event.viewport_w ? event.viewport_w : DEFAULT_SIZE.width;
  const height = isClick && event.page_h ? event.page_h : DEFAULT_SIZE.height;

  return (
    <Card className={cn("gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="truncate text-lg font-medium" title={event.page_url}>
          {pathOf(event.page_url)}
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {width}×{height}
        </span>
      </div>
      <ScaledPageFrame
        pageUrl={event.page_url}
        width={width}
        height={height}
        // page_url comes from public event input. allow-scripts WITHOUT allow-same-origin runs the page in an
        // opaque origin: it can't read our cookies/storage/DOM, navigate us or open popups.
        sandbox="allow-scripts"
        scrollToY={isClick ? event.y : undefined}
        scrollKey={event.id}
      >
        {(scale) =>
          isClick &&
          event.x !== undefined &&
          event.y !== undefined && (
            <span
              className="absolute rounded-full border-2 border-app bg-event-click"
              style={{
                width: DOT_SIZE,
                height: DOT_SIZE,
                left: event.x * scale - DOT_SIZE / 2,
                top: event.y * scale - DOT_SIZE / 2,
              }}
              aria-label={`Click at x ${event.x}, y ${event.y}`}
            />
          )
        }
      </ScaledPageFrame>
    </Card>
  );
}
