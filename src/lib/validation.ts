import { z } from "zod";

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_BATCH = 50;

/** origin + pathname, no query/hash, no trailing slash except for the root path. */
export function normalizePageUrl(raw: string): string {
  const url = new URL(raw);
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  return url.origin + (path || "/");
}

const pageUrl = z.url({ protocol: /^https?$/, error: "page_url must be an http(s) URL" }).transform(normalizePageUrl);

const timestamp = z
  .union([z.iso.datetime({ offset: true }), z.number().int().nonnegative()], {
    error: "timestamp must be an ISO date string or epoch milliseconds",
  })
  .transform((value) => new Date(value))
  .refine((date) => date.getTime() <= Date.now() + DAY_MS, {
    error: "timestamp is more than 24h in the future",
  });

const baseEvent = {
  session_id: z.uuid({ error: "session_id must be a UUID" }),
  page_url: pageUrl,
  timestamp,
  referrer: z.string().max(2048).optional(),
  user_agent: z.string().max(512).optional(),
};

const coordinate = z.number().nonnegative();
const dimension = z.number().int().positive();

export const eventSchema = z.discriminatedUnion(
  "event_type",
  [
    z.object({ ...baseEvent, event_type: z.literal("page_view") }),
    z.object({
      ...baseEvent,
      event_type: z.literal("click"),
      x: coordinate,
      y: coordinate,
      viewport_w: dimension,
      viewport_h: dimension,
      page_h: dimension,
    }),
  ],
  { error: "event_type must be page_view or click" },
);

export const eventBatchSchema = z
  .array(eventSchema)
  .min(1, { error: "batch must contain at least 1 event" })
  .max(MAX_BATCH, { error: `batch can contain at most ${MAX_BATCH} events` });

export type EventInput = z.infer<typeof eventSchema>;

export const sessionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().min(1).optional(),
});

export const sessionIdSchema = z.uuid({ error: "sessionId must be a UUID" });

export const heatmapQuerySchema = z.object({
  page_url: z.string({ error: "page_url is required" }).pipe(pageUrl),
});
