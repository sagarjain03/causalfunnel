import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { RangeDays } from "@/server/services/overview";

export type OverviewSearchParams = Promise<Record<string, string | string[] | undefined>>;
export type OverviewParams = { days: RangeDays; tz: string; tzFromViewer: boolean; now: number };

const RANGES: RangeDays[] = [7, 14, 28];
export const TZ_COOKIE = "cf_tz";

function validTimeZone(tz: string | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Request time, shared by every card so all of them use identical period bounds. */
const requestNow = cache(() => Date.now());

/**
 * ?range (7 | 14 | 28, default 7) and the viewer's IANA time zone from the cf_tz cookie (set by TimezoneSync),
 * falling back to UTC. cache(): every card on the page resolves the same values once per request.
 */
export const resolveOverviewParams = cache(async (raw: Record<string, string | string[] | undefined>): Promise<OverviewParams> => {
  await connection();
  const range = Number(typeof raw.range === "string" ? raw.range : NaN);
  const days = RANGES.includes(range as RangeDays) ? (range as RangeDays) : 7;
  const cookieTz = (await cookies()).get(TZ_COOKIE)?.value;
  const tzFromViewer = validTimeZone(cookieTz);
  return { days, tz: tzFromViewer ? cookieTz : "UTC", tzFromViewer, now: requestNow() };
});
