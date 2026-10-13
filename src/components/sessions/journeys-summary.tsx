import { connection } from "next/server";
import { formatNumber, plural } from "@/lib/format";
import { getJourneyStats } from "@/server/services/sessions";

/** "{n} journeys, {k} reached checkout." */
export async function JourneysSummary() {
  await connection();
  const { journeys, reachedCheckout } = await getJourneyStats();
  return `${plural(journeys, "journey")}, ${formatNumber(reachedCheckout)} reached checkout.`;
}
