import type { NextRequest } from "next/server";
import { sessionIdSchema } from "@/lib/validation";
import { handleError, ok } from "@/server/http";
import { getSessionEvents } from "@/server/services/sessions";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/sessions/[sessionId]/events">) {
  // Request data is read outside try/catch so Next's prerender bailout is never swallowed.
  const { sessionId } = await ctx.params;
  try {
    return ok(await getSessionEvents(sessionIdSchema.parse(sessionId)));
  } catch (err) {
    return handleError("sessions/events", err);
  }
}
