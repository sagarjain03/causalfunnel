import { connection } from "next/server";
import { formatRelative, plural } from "@/lib/format";
import { getLastEventAt, getOverviewStats } from "@/server/services/stats";

/** Totals and the newest event time, plus when they were fetched (the reference point for "5 minutes ago"). */
async function loadSummary() {
  await connection();
  const [stats, lastEventAt] = await Promise.all([getOverviewStats(), getLastEventAt()]);
  return { stats, lastEventAt, fetchedAt: Date.now() };
}

/** "{n} journeys and {m} events. Last activity {relative time}." */
export async function OverviewSummary() {
  const { stats, lastEventAt, fetchedAt } = await loadSummary();
  const activity = lastEventAt
    ? `Last activity ${formatRelative(lastEventAt.toISOString(), fetchedAt)}.`
    : "No activity yet.";
  return `${plural(stats.sessions, "journey")} and ${plural(stats.events, "event")}. ${activity}`;
}
