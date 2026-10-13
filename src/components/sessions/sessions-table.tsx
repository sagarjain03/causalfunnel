"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
      toast.error("Could not load more sessions", { description: "Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Session</TableHead>
              <TableHead className="text-right">Events</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Clicks</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Pages</TableHead>
              <TableHead className="text-right">Last seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              const href = `/dashboard/sessions/${session.session_id}`;
              return (
                // Whole row navigates; the id cell is the real link for keyboard, middle-click and screen readers.
                <TableRow key={session.session_id} onClick={() => router.push(href)} className="cursor-pointer hover:bg-muted">
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={href} onClick={(e) => e.stopPropagation()} className="font-mono text-xs hover:text-primary">
                          {shortId(session.session_id)}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent className="font-mono">{session.session_id}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatNumber(session.event_count)}</TableCell>
                  <TableCell className="hidden text-right font-mono tabular-nums text-event-click sm:table-cell">
                    {formatNumber(session.click_count)}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono tabular-nums sm:table-cell">
                    {formatNumber(session.pages.length)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <time dateTime={session.last_seen} title={session.last_seen}>
                      {formatRelative(session.last_seen, now)}
                    </time>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs text-muted-foreground">
          {formatNumber(sessions.length)} session{sessions.length === 1 ? "" : "s"} shown
        </p>
        {cursor && (
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        )}
      </div>
    </div>
  );
}
