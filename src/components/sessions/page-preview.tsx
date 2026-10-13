"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { pathOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventDto } from "@/types";

const DEFAULT_SIZE = { width: 1280, height: 800 };
const DOT_SIZE = 14;

/** Preview URL: ?cf_preview=1 tells tracker.js not to record the dashboard's own view. */
function previewUrl(pageUrl: string): string {
  const url = new URL(pageUrl);
  url.searchParams.set("cf_preview", "1");
  return url.href;
}

type PagePreviewProps = {
  event: EventDto;
  className?: string;
};

/**
 * Scaled iframe of the selected step's page. For a click, the page is laid out at the visitor's own viewport width
 * and full page height, so the dot at (x, y) lands on the element they clicked.
 */
export function PagePreview({ event, className }: PagePreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const isClick = event.event_type === "click" && event.x !== undefined && event.y !== undefined;
  const width = isClick && event.viewport_w ? event.viewport_w : DEFAULT_SIZE.width;
  const height = isClick && event.page_h ? event.page_h : DEFAULT_SIZE.height;
  const scale = containerWidth > 0 ? containerWidth / width : 0;

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Bring the click dot into view inside the card (works for any origin: we scroll our container, not the iframe).
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !scale) return;
    const target = isClick && event.y !== undefined ? event.y * scale - scroller.clientHeight / 2 : 0;
    scroller.scrollTo({ top: Math.max(0, target) });
  }, [event.id, event.y, isClick, scale]);

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
      <div ref={scrollRef} className="max-h-[70vh] overflow-y-auto rounded-tile border border-line bg-app">
        <div ref={frameRef} className="relative w-full overflow-hidden" style={{ height: height * scale }}>
          {scale > 0 && (
            <iframe
              key={`${event.page_url}-${width}-${height}`}
              src={previewUrl(event.page_url)}
              title={`Preview of ${pathOf(event.page_url)}`}
              // page_url comes from public event input. allow-scripts WITHOUT allow-same-origin runs the page in an
              // opaque origin: it can't read our cookies/storage/DOM, navigate us or open popups.
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              loading="lazy"
              className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
              style={{ width, height, transform: `scale(${scale})` }}
            />
          )}
          {isClick && scale > 0 && event.x !== undefined && event.y !== undefined && (
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
          )}
        </div>
      </div>
    </Card>
  );
}
