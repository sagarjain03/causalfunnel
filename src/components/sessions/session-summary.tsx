import { LocalTime } from "@/components/local-time";
import { Card } from "@/components/ui/card";
import { formatDuration, formatNumber, pathOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventDto } from "@/types";

/** Totals for one session, derived from its (sorted, non-empty) events. */
export function SessionSummary({ sessionId, events }: { sessionId: string; events: EventDto[] }) {
  const first = events[0];
  const last = events[events.length - 1];
  const clicks = events.filter((e) => e.event_type === "click").length;
  const pages = [...new Set(events.map((e) => pathOf(e.page_url)))];
  const duration = new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime();

  const stats = [
    { label: "Duration", value: formatDuration(duration) },
    { label: "Events", value: formatNumber(events.length) },
    { label: "Clicks", value: formatNumber(clicks), className: "text-event-click" },
    { label: "Page views", value: formatNumber(events.length - clicks), className: "text-event-pageview" },
  ];

  return (
    <Card className="gap-5 p-5">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Session ID</span>
        <span className="break-all font-mono text-sm">{sessionId}</span>
        <span className="text-xs text-muted-foreground">
          Started <LocalTime iso={first.timestamp} withDate />
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className={cn("font-mono text-xl font-semibold tabular-nums", stat.className)}>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">
          Pages visited <span className="font-mono tabular-nums">({formatNumber(pages.length)})</span>
        </span>
        <ul className="flex flex-wrap gap-2">
          {pages.map((path) => (
            <li key={path} className="rounded-md border bg-muted px-2 py-1 font-mono text-xs">
              {path}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
