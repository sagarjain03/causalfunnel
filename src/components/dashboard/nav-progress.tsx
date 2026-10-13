"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const START_EVENT = "cf:nav-start";
/** Navigations that finish faster than this never show the bar (no flash on prefetched routes). */
const DELAY_MS = 80;
/** Safety net: a cancelled or failed navigation never leaves the bar stuck. */
const TIMEOUT_MS = 10_000;

const currentUrl = () => `${location.pathname}?${new URLSearchParams(location.search).toString()}`;

/** For programmatic navigation (router.push): call right before it. Link clicks are detected automatically. */
export function startNavProgress() {
  window.dispatchEvent(new Event(START_EVENT));
}

/**
 * Thin sage bar at the top of the window while a dashboard route loads after a click. It starts on an internal
 * /dashboard link click (or startNavProgress()) and disappears as soon as the URL changes. No dependency.
 */
export function NavProgress() {
  const url = `${usePathname()}?${useSearchParams().toString()}`;
  // URL the pending navigation started from; the bar shows while we're still on it.
  const [from, setFrom] = useState<string | null>(null);
  const [seenUrl, setSeenUrl] = useState(url);
  if (seenUrl !== url) {
    // The navigation landed (or the URL changed some other way): reset during render, no effect needed.
    setSeenUrl(url);
    setFrom(null);
  }

  useEffect(() => {
    let delay: number | undefined;
    let timeout: number | undefined;
    const start = () => {
      const at = currentUrl();
      window.clearTimeout(delay);
      window.clearTimeout(timeout);
      delay = window.setTimeout(() => {
        if (currentUrl() === at) setFrom(at);
      }, DELAY_MS);
      timeout = window.setTimeout(() => setFrom(null), TIMEOUT_MS);
    };
    const onClick = (e: MouseEvent) => {
      // Capture phase: next/link calls preventDefault() on the bubbling click, so don't check defaultPrevented.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const to = new URL(a.href, location.href);
      if (to.origin !== location.origin || !to.pathname.startsWith("/dashboard")) return;
      if (`${to.pathname}?${to.searchParams.toString()}` === currentUrl()) return;
      start();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener(START_EVENT, start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(START_EVENT, start);
      window.clearTimeout(delay);
      window.clearTimeout(timeout);
    };
  }, []);

  const active = from !== null && from === url;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
      <div className={cn("h-full bg-sage", active ? "animate-nav-progress" : "w-full opacity-0 transition-opacity duration-200")} />
    </div>
  );
}
