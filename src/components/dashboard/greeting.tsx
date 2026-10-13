"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

function timeOfDay(hour: number): string {
  if (hour < 12) return "good morning";
  if (hour < 17) return "good afternoon";
  return "good evening";
}

/** Client snapshot as one primitive string (stable between calls), e.g. "good evening|Mon, 13 Oct". */
function readLocalNow(): string {
  const now = new Date();
  const date = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }).format(now);
  return `${timeOfDay(now.getHours())}|${date}`;
}

/**
 * "Hello, good evening" + today's date, in the viewer's local time.
 * The server doesn't know the viewer's clock, so it renders "Hello" and an empty pill;
 * the client fills them in after hydration. The pill has a fixed width, so nothing shifts.
 */
export function Greeting() {
  const snapshot = useSyncExternalStore(noopSubscribe, readLocalNow, () => null);
  const [part, date] = snapshot ? snapshot.split("|") : [null, null];

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-[32px] leading-tight font-light tracking-tight md:text-[40px]">
        Hello
        {part && <span className="text-muted-foreground">, {part}</span>}
      </h1>
      <span className="flex h-9 w-32 shrink-0 items-center justify-center glass rounded-full text-sm text-muted-foreground tabular-nums">
        {date}
      </span>
    </div>
  );
}
