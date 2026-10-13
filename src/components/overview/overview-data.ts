import { cache } from "react";
import { listSessions } from "@/server/services/sessions";
import { getLastEventAt } from "@/server/services/stats";
import {
  getClickGrid,
  getDeviceSplit,
  getFunnel,
  getOverviewKpis,
  getTopTargets,
  type OverviewQuery,
  type RangeDays,
} from "@/server/services/overview";

// Per-request memoised loaders (primitive args, so React cache can match calls from different cards).
const q = (days: RangeDays, tz: string, now: number): OverviewQuery => ({ days, tz, now });

export const loadKpis = cache((days: RangeDays, tz: string, now: number) => getOverviewKpis(q(days, tz, now)));
export const loadFunnel = cache((days: RangeDays, tz: string, now: number) => getFunnel(q(days, tz, now)));
export const loadDevices = cache((days: RangeDays, tz: string, now: number) => getDeviceSplit(q(days, tz, now)));
export const loadTopTargets = cache((days: RangeDays, tz: string, now: number) => getTopTargets(q(days, tz, now)));
export const loadClickGrid = cache((days: RangeDays, tz: string, now: number) => getClickGrid(q(days, tz, now)));
export const loadRecent = cache(() => listSessions({ limit: 6 }));
export const loadLastEventAt = cache(() => getLastEventAt());
