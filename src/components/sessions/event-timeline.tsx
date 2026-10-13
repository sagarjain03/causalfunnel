import { LocalTime } from "@/components/local-time";
import { formatGap, pathOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventDto } from "@/types";

const eventLabel = { page_view: "Page view", click: "Click" } as const;

type EventTimelineProps = {
  /** Sorted by timestamp asc. */
  events: EventDto[];
  selectedId?: string;
  onSelect?: (id: string) => void;
};

/** Vertical journey: dots joined by a line (orange = click, sage = page view), time on the right. */
export function EventTimeline({ events, selectedId, onSelect }: EventTimelineProps) {
  return (
    <ol className="flex flex-col">
      {events.map((event, i) => {
        const prev = events[i - 1];
        const gap = prev ? new Date(event.timestamp).getTime() - new Date(prev.timestamp).getTime() : null;
        const isClick = event.event_type === "click";
        const isLast = i === events.length - 1;

        return (
          <li key={event.id} className="flex flex-col">
            {gap !== null && (
              <div className="flex h-7 items-center gap-3 pl-1">
                <span className="flex w-4 justify-center self-stretch" aria-hidden>
                  <span className="w-px bg-sage-dim" />
                </span>
                <span className="rounded-full bg-panel-raised px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums">
                  {formatGap(gap)}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => onSelect?.(event.id)}
              aria-pressed={selectedId === event.id}
              className={cn(
                "flex w-full items-start gap-3 rounded-tile px-1 py-2 text-left hover:bg-panel-raised",
                selectedId === event.id && "bg-panel-raised",
              )}
            >
              <span className="relative flex w-4 shrink-0 justify-center self-stretch" aria-hidden>
                <span className={cn("mt-1.5 size-2.5 rounded-full", isClick ? "bg-event-click" : "bg-event-pageview")} />
                {!isLast && <span className="absolute top-5 bottom-[-0.5rem] w-px bg-sage-dim" />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm">{eventLabel[event.event_type]}</span>
                <span className="truncate text-xs text-muted-foreground" title={event.page_url}>
                  {pathOf(event.page_url)}
                </span>
                {isClick && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    x {event.x}, y {event.y}
                    {event.viewport_w && event.viewport_h ? ` · ${event.viewport_w}×${event.viewport_h}` : ""}
                  </span>
                )}
              </span>
              <LocalTime iso={event.timestamp} className="shrink-0 pr-1 text-xs text-muted-foreground tabular-nums" />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
