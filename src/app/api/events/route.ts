import type { NextRequest } from "next/server";
import { corsHeaders, fail, handleError, HttpError, ok } from "@/server/http";
import { insertEvents } from "@/server/services/events";

const MAX_BODY_BYTES = 64 * 1024;

export function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

// The tracker posts text/plain via sendBeacon (no CORS preflight), so the body is read as text and parsed here.
export async function POST(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));
  try {
    if (Number(req.headers.get("content-length")) > MAX_BODY_BYTES) {
      return fail(413, "payload_too_large", "Body exceeds 64 KB", headers);
    }
    const text = await req.text();
    if (Buffer.byteLength(text) > MAX_BODY_BYTES) {
      return fail(413, "payload_too_large", "Body exceeds 64 KB", headers);
    }

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new HttpError(400, "invalid_json", "Body is not valid JSON");
    }

    return ok(await insertEvents(body), 201, headers);
  } catch (err) {
    return handleError("events", err, headers);
  }
}
