import { notFound } from "next/navigation";
import { connection } from "next/server";
import { EventTimeline } from "@/components/sessions/event-timeline";
import { SessionSummary } from "@/components/sessions/session-summary";
import { sessionIdSchema } from "@/lib/validation";
import { HttpError } from "@/server/http";
import { getSessionEvents } from "@/server/services/sessions";
import type { EventDto } from "@/types";

async function loadEvents(sessionId: string): Promise<EventDto[]> {
  // params alone doesn't stop prerendering when the param value is known (dev validation, prefetch),
  // so make the DB read explicitly request-time.
  await connection();
  try {
    return await getSessionEvents(sessionId);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) notFound();
    throw err;
  }
}

/** Streams behind <Suspense>. Unknown or malformed id → not-found.tsx. */
export async function SessionJourney({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const parsed = sessionIdSchema.safeParse(sessionId);
  if (!parsed.success) notFound();

  const events = await loadEvents(parsed.data);

  return (
    <div className="flex flex-col gap-6">
      <SessionSummary sessionId={parsed.data} events={events} />
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Journey</h2>
        <EventTimeline events={events} />
      </section>
    </div>
  );
}
