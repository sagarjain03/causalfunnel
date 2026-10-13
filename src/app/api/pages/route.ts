import { connection } from "next/server";
import { handleError, ok } from "@/server/http";
import { listPages } from "@/server/services/heatmap";

export async function GET() {
  // Reads no request data, so without this it would be prerendered at build time.
  // Kept outside try/catch so Next's prerender bailout is never swallowed.
  await connection();
  try {
    return ok(await listPages());
  } catch (err) {
    return handleError("pages", err);
  }
}
