import { Eye, MousePointerClick } from "lucide-react";
import { LocalTime } from "@/components/local-time";
import { formatGap, pathOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventDto } from "@/types";

const eventMeta = {
  page_view: { label: "Page view", icon: Eye, className: "text-event-pageview border-event-pageview/40" },
  click: { label: "Click", icon: MousePointerClick, className: "text-event-click border-event-click/40" },
} as const;

/** Vertical journey, events already sorted by timestamp asc. */
export function EventTimeline({ events }: { events: EventDto[] }) {
  return (
    <ol className="flex flex-col">
      {events.map((event, i) => {
        const meta = eventMeta[event.event_type];
        const Icon = meta.icon;
        const prev = events[i - 1];
        const gap = prev ? new Date(event.timestamp).getTime() - new Date(prev.timestamp).getTime() : null;

        return (
          <li key={event.id} className="flex flex-col">
            {gap !== null && (
              <div className="flex h-8 items-center gap-3">
                <span className="flex w-9 justify-center" aria-hidden>
                  <span className="h-full w-px bg-border" />
                </span>
                <span className="rounded-full border bg-muted px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {formatGap(gap)}
                </span>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full border bg-card", meta.className)}>
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border bg-card px-4 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-sm font-medium">{meta.label}</span>
                  <LocalTime iso={event.timestamp} className="font-mono text-xs tabular-nums text-muted-foreground" />
                </div>
                <span className="truncate font-mono text-xs text-muted-foreground" title={event.page_url}>
                  {pathOf(event.page_url)}
                </span>
                {event.event_type === "click" && (
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    x {event.x}, y {event.y}
                    {event.viewport_w && event.viewport_h ? ` · viewport ${event.viewport_w}×${event.viewport_h}` : ""}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
