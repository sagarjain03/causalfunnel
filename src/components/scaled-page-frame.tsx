"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { pathOf } from "@/lib/format";

/** Preview URL: ?cf_preview=1 tells tracker.js not to record the dashboard's own view. */
function previewUrl(pageUrl: string): string {
  const url = new URL(pageUrl);
  url.searchParams.set("cf_preview", "1");
  return url.href;
}

type ScaledPageFrameProps = {
  pageUrl: string;
  /** Width the page is laid out at, in page pixels. Must be the width the clicks were recorded at. */
  width: number;
  /** Height of the rendered page, in page pixels. */
  height: number;
  sandbox: string;
  /** Page-pixel y to scroll into view (centred) whenever scrollKey changes. */
  scrollToY?: number;
  scrollKey?: string;
  /** Overlay in screen pixels; positions are page pixels × scale, so they land on the same spot as in the page. */
  children?: (scale: number) => ReactNode;
};

/**
 * A page rendered at an exact width and height inside an iframe, scaled down to the container width with a CSS
 * transform. Overlays (dots, grid) share the same scaled box, so a point at page (x, y) is drawn at (x, y) × scale.
 * Used by the journey preview and the heatmap.
 */
export function ScaledPageFrame({ pageUrl, width, height, sandbox, scrollToY, scrollKey, children }: ScaledPageFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const scale = containerWidth > 0 ? containerWidth / width : 0;

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll our container (not the iframe), so this works for any origin.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !scale) return;
    const target = scrollToY !== undefined ? scrollToY * scale - scroller.clientHeight / 2 : 0;
    scroller.scrollTo({ top: Math.max(0, target) });
  }, [scrollKey, scrollToY, scale]);

  return (
    <div ref={scrollRef} className="max-h-[70vh] overflow-y-auto rounded-tile border border-line bg-app">
      <div ref={frameRef} className="relative w-full overflow-hidden" style={{ height: height * scale }}>
        {scale > 0 && (
          <iframe
            key={`${pageUrl}-${width}-${height}`}
            src={previewUrl(pageUrl)}
            title={`Preview of ${pathOf(pageUrl)}`}
            sandbox={sandbox}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
            style={{ width, height, transform: `scale(${scale})` }}
          />
        )}
        {scale > 0 && children?.(scale)}
      </div>
    </div>
  );
}
