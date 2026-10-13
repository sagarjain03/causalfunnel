import { notFound } from "next/navigation";
import { connection } from "next/server";
import { JourneyView } from "@/components/sessions/journey-view";
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
  return <JourneyView sessionId={parsed.data} events={events} />;
}
