import { eventBatchSchema, eventSchema } from "@/lib/validation";
import { connectDb } from "@/server/db";
import { EventModel } from "@/server/models/event";

/** Validates one event or a batch (max 50) and stores them. */
export async function insertEvents(input: unknown): Promise<{ inserted: number }> {
  const events = Array.isArray(input) ? eventBatchSchema.parse(input) : [eventSchema.parse(input)];

  await connectDb();
  const receivedAt = new Date();
  const docs = await EventModel.insertMany(events.map((event) => ({ ...event, received_at: receivedAt })));
  return { inserted: docs.length };
}
