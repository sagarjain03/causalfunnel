import type { NextRequest } from "next/server";
import { heatmapQuerySchema } from "@/lib/validation";
import { handleError, ok } from "@/server/http";
import { getHeatmap } from "@/server/services/heatmap";

export async function GET(req: NextRequest) {
  // Request data is read outside try/catch so Next's prerender bailout is never swallowed.
  const pageUrl = req.nextUrl.searchParams.get("page_url") ?? undefined;
  try {
    const { page_url } = heatmapQuerySchema.parse({ page_url: pageUrl });
    return ok(await getHeatmap(page_url));
  } catch (err) {
    return handleError("heatmap", err);
  }
}
