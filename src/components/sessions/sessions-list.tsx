import { connection } from "next/server";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SessionsTable } from "@/components/sessions/sessions-table";
import { listSessions } from "@/server/services/sessions";

/** First page of sessions plus the time it was fetched (the reference point for "3 minutes ago"). */
async function loadFirstPage() {
  await connection();
  const page = await listSessions({ limit: 50 });
  return { ...page, fetchedAt: Date.now() };
}

/** Streams behind <Suspense>: first page of sessions, newest first. */
export async function SessionsList() {
  const { sessions, nextCursor, fetchedAt } = await loadFirstPage();

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No sessions yet"
        description="Sessions appear here once the tracker sends events. Open the demo store to create one."
      />
    );
  }

  return <SessionsTable initialSessions={sessions} initialCursor={nextCursor} now={fetchedAt} />;
}
