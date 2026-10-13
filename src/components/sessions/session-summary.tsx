import { LocalTime } from "@/components/local-time";
import { CopySessionId } from "@/components/sessions/copy-session-id";
import { Card } from "@/components/ui/card";
import { formatDuration, formatNumber, pathOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventDto } from "@/types";

/** Totals for one journey, derived from its (sorted, non-empty) events. */
export function SessionSummary({ sessionId, events }: { sessionId: string; events: EventDto[] }) {
  const first = events[0];
  const last = events[events.length - 1];
  const clicks = events.filter((e) => e.event_type === "click").length;
  const pages = [...new Set(events.map((e) => pathOf(e.page_url)))];
  const duration = new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime();

  const tiles = [
    { label: "Duration", value: formatDuration(duration) },
    { label: "Events", value: formatNumber(events.length) },
    { label: "Clicks", value: formatNumber(clicks), dot: "bg-event-click" },
    { label: "Page views", value: formatNumber(events.length - clicks), dot: "bg-event-pageview" },
  ];

  return (
    <Card>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">Journey summary</h2>
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs break-all text-muted-foreground">{sessionId}</span>
          <CopySessionId sessionId={sessionId} />
        </span>
        <span className="text-xs text-muted-foreground">
          Started <LocalTime iso={first.timestamp} withDate />
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="flex flex-col gap-2 rounded-tile bg-panel-raised p-4">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              {tile.dot && <span className={cn("size-2 rounded-full", tile.dot)} aria-hidden />}
              {tile.label}
            </dt>
            <dd className="text-[32px] leading-none font-light tabular-nums">{tile.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">
          Pages visited <span className="tabular-nums">({formatNumber(pages.length)})</span>
        </span>
        <ul className="flex flex-wrap gap-2">
          {pages.map((path) => (
            <li key={path} className="glass rounded-full px-2.5 py-1 text-xs">
              {path}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
