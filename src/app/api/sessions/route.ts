import type { NextRequest } from "next/server";
import { sessionsQuerySchema } from "@/lib/validation";
import { handleError, ok } from "@/server/http";
import { listSessions } from "@/server/services/sessions";

export async function GET(req: NextRequest) {
  // Request data is read outside try/catch so Next's prerender bailout is never swallowed.
  const params = Object.fromEntries(req.nextUrl.searchParams);
  try {
    const query = sessionsQuerySchema.parse(params);
    return ok(await listSessions(query));
  } catch (err) {
    return handleError("sessions", err);
  }
}
