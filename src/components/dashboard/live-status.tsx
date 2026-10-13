import { connection } from "next/server";
import { cn } from "@/lib/utils";
import { getLastEventAt } from "@/server/services/stats";

const LIVE_WINDOW_MS = 5 * 60 * 1000;

/** Newest event time and whether it is recent enough to count as "Live". */
async function loadStatus() {
  await connection();
  const lastEventAt = await getLastEventAt();
  const isLive = lastEventAt !== null && Date.now() - lastEventAt.getTime() < LIVE_WINDOW_MS;
  return { isLive, lastEventAt };
}

/** Live/Idle dot. Streams behind <Suspense>: reads the newest event at request time. */
export async function LiveStatus() {
  const { isLive, lastEventAt } = await loadStatus();
  const title = lastEventAt ? `Newest event: ${lastEventAt.toISOString()}` : "No events yet";

  return (
    <span title={title} className="glass flex h-9 items-center gap-2 rounded-full px-3 text-sm">
      {/* Orange only while live (DESIGN.md §2). Pulse is added in Phase 5. */}
      <span className={cn("size-2 rounded-full", isLive ? "bg-orange" : "bg-muted-foreground")} aria-hidden />
      <span className={isLive ? "text-foreground" : "text-muted-foreground"}>{isLive ? "Live" : "Idle"}</span>
    </span>
  );
}
