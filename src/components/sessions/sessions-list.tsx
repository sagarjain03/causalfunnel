import { connection } from "next/server";
import { Route } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SessionsTable } from "@/components/sessions/sessions-table";
import { listSessions } from "@/server/services/sessions";

/** First page of sessions plus the time it was fetched (the reference point for "3 minutes ago"). */
async function loadFirstPage() {
  await connection();
  const page = await listSessions({ limit: 50 });
  return { ...page, fetchedAt: Date.now() };
}

/** Streams behind <Suspense>: first page of journeys, newest first. */
export async function SessionsList() {
  const { sessions, nextCursor, fetchedAt } = await loadFirstPage();

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Route}
        title="No journeys yet"
        description="Journeys appear here once the tracker sends events. Open the demo store to create one."
        className="border-0 bg-transparent py-10"
      />
    );
  }

  return <SessionsTable initialSessions={sessions} initialCursor={nextCursor} now={fetchedAt} />;
}
