"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { JourneyPath } from "@/components/sessions/journey-path";
import { StatusPill } from "@/components/sessions/status-pill";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber, formatRelative, shortId } from "@/lib/format";
import type { SessionSummary, SessionsPage } from "@/types";

const PAGE_SIZE = 50;

type SessionsTableProps = {
  initialSessions: SessionSummary[];
  initialCursor: string | null;
  /** Server render time, so relative times match between server HTML and hydration. */
  now: number;
};

export function SessionsTable({ initialSessions, initialCursor, now }: SessionsTableProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`);
      if (!res.ok) throw new Error(`GET /api/sessions failed with ${res.status}`);
      // Our own API's envelope (src/server/http.ts), typed by the shared SessionsPage type.
      const { data } = (await res.json()) as { data: SessionsPage };
      setSessions((prev) => [...prev, ...data.sessions]);
      setCursor(data.nextCursor);
    } catch (err) {
      console.error(err);
      toast.error("Could not load more journeys", { description: "Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* overflow-x-auto is only a fallback: below sm the table shows just id, status and last seen; Path needs md. */}
      <div className="-mx-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Journey</TableHead>
              <TableHead className="hidden text-right text-muted-foreground sm:table-cell">Events</TableHead>
              <TableHead className="hidden text-right text-muted-foreground sm:table-cell">Clicks</TableHead>
              <TableHead className="hidden text-muted-foreground md:table-cell">Path</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              {/* Below sm the header may wrap ("Last / seen"), so the 3 visible columns fit 375px without a scrollbar. */}
              <TableHead className="text-right whitespace-normal text-muted-foreground sm:whitespace-nowrap">Last seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              const href = `/dashboard/journeys/${session.session_id}`;
              return (
                // Whole row navigates; the id cell is the real link for keyboard, middle-click and screen readers.
                <TableRow
                  key={session.session_id}
                  onClick={() => router.push(href)}
                  className="cursor-pointer border-line hover:bg-panel-raised"
                >
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={href} onClick={(e) => e.stopPropagation()} className="font-mono text-xs hover:text-sage">
                          {shortId(session.session_id)}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent className="font-mono">{session.session_id}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">
                    {formatNumber(session.event_count)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">
                    {formatNumber(session.click_count)}
                  </TableCell>
                  <TableCell className="hidden whitespace-normal md:table-cell">
                    <JourneyPath path={session.path} />
                  </TableCell>
                  <TableCell>
                    <StatusPill reachedCheckout={session.reached_checkout} />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                    {/* Narrow form below sm so id + status + last seen fit 375px without scrolling. */}
                    <time dateTime={session.last_seen} title={session.last_seen}>
                      <span className="sm:hidden">{formatRelative(session.last_seen, now, "narrow")}</span>
                      <span className="hidden sm:inline">{formatRelative(session.last_seen, now)}</span>
                    </time>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatNumber(sessions.length)} journey{sessions.length === 1 ? "" : "s"} shown
        </p>
        {cursor && (
          <Button variant="outline" className="rounded-full" onClick={loadMore} disabled={loading}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        )}
      </div>
    </div>
  );
}
