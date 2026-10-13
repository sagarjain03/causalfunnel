"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

const utcFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
});

type LocalTimeProps = {
  iso: string;
  className?: string;
  /** Include the date, not just the time. */
  withDate?: boolean;
};

/**
 * Shows a UTC timestamp in the viewer's local time zone.
 * The server can't know that zone, so the server HTML shows UTC (labelled) and the client switches after hydration.
 */
export function LocalTime({ iso, className, withDate = false }: LocalTimeProps) {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const date = new Date(iso);

  const text = isClient
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: withDate ? "medium" : undefined,
        timeStyle: "medium",
      }).format(date)
    : `${withDate ? `${date.toISOString().slice(0, 10)} ` : ""}${utcFormat.format(date)} UTC`;

  return (
    <time dateTime={iso} title={iso} className={className}>
      {text}
    </time>
  );
}
