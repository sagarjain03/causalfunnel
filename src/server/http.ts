import { ZodError } from "zod";

/** Thrown from services for expected failures (404 unknown session, 400 bad cursor, ...). */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function ok<T>(data: T, status = 200, headers?: HeadersInit): Response {
  return Response.json({ data }, { status, headers });
}

export function fail(status: number, code: string, message: string, headers?: HeadersInit): Response {
  return Response.json({ error: { code, message } }, { status, headers });
}

/** CORS headers for the public tracker endpoint. `ALLOWED_ORIGINS` is a comma-separated list or "*". */
export function corsHeaders(origin: string | null): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  });
  const allowed = (process.env.ALLOWED_ORIGINS ?? "*").split(",").map((o) => o.trim());

  if (allowed.includes("*")) {
    headers.set("Access-Control-Allow-Origin", "*");
  } else if (origin && allowed.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return headers;
}

export function handleError(route: string, err: unknown, headers?: HeadersInit): Response {
  if (err instanceof ZodError) {
    const issue = err.issues[0];
    const path = issue?.path.join(".");
    const message = issue ? (path ? `${path}: ${issue.message}` : issue.message) : "Invalid input";
    return fail(400, "validation_error", message, headers);
  }
  if (err instanceof HttpError) {
    return fail(err.status, err.code, err.message, headers);
  }
  console.error(`[api/${route}]`, err);
  return fail(500, "internal_error", "Something went wrong", headers);
}
