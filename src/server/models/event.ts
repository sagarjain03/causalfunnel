import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const eventSchema = new Schema(
  {
    session_id: { type: String, required: true },
    event_type: { type: String, required: true, enum: ["page_view", "click"] },
    page_url: { type: String, required: true },
    timestamp: { type: Date, required: true },
    received_at: { type: Date, required: true },
    // click only
    x: Number,
    y: Number,
    viewport_w: Number,
    viewport_h: Number,
    page_h: Number,
    // optional context
    referrer: String,
    user_agent: String,
  },
  { collection: "events", versionKey: false },
);

// Session journey: filter + sort in one index.
eventSchema.index({ session_id: 1, timestamp: 1 });
// Heatmap query and pages list.
eventSchema.index({ page_url: 1, event_type: 1 });
// Sessions list sorted by recency.
eventSchema.index({ timestamp: -1 });

export type EventDoc = InferSchemaType<typeof eventSchema>;

export const EventModel: Model<EventDoc> =
  (models.Event as Model<EventDoc> | undefined) ?? model<EventDoc>("Event", eventSchema);
