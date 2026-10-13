import { connectDb } from "@/server/db";
import { EventModel } from "@/server/models/event";

/** True if any event was written by scripts/seed.ts (the dashboard then shows "Includes demo data"). */
export async function hasSeedData(): Promise<boolean> {
  await connectDb();
  return (await EventModel.exists({ source: "seed" })) !== null;
}

/** Time of the newest event (for the Live/Idle dot), or null if there are none. Uses the { timestamp: -1 } index. */
export async function getLastEventAt(): Promise<Date | null> {
  await connectDb();
  const newest = await EventModel.findOne({}, { _id: 0, timestamp: 1 }).sort({ timestamp: -1 }).lean();
  return newest?.timestamp ?? null;
}
