import { cache } from "react";
import { connection } from "next/server";
import { z } from "zod";
import { getClickWidths, listHeatmapPages } from "@/server/services/heatmap";
import type { ClickWidth, PageSummary } from "@/types";

export type HeatmapSearchParams = Promise<Record<string, string | string[] | undefined>>;

const searchSchema = z.object({
  page: z.string().min(1).optional(),
  w: z.coerce.number().int().positive().optional(),
});

export type HeatmapSelection = {
  pages: PageSummary[];
  /** Selected page_url; null when nothing has been clicked yet. */
  page: string | null;
  widths: ClickWidth[];
  /** Selected exact viewport width; null when the page has no clicks. */
  width: ClickWidth | null;
};

/**
 * Resolves ?page= and ?w= against the database. Defaults: the most-clicked page, then its most-clicked width.
 * An unknown ?page is kept (it shows the empty state); an unknown ?w falls back to the default width.
 * cache(): the title sentence and the heatmap share one resolution per request.
 */
export const resolveHeatmapSelection = cache(async (raw: Record<string, string | string[] | undefined>): Promise<HeatmapSelection> => {
  await connection();
  const parsed = searchSchema.safeParse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    w: typeof raw.w === "string" ? raw.w : undefined,
  });
  const params = parsed.success ? parsed.data : {};

  const pages = await listHeatmapPages();
  const fallbackPage = pages.find((p) => p.clicks > 0)?.page_url ?? null;
  const page = params.page ?? fallbackPage;
  if (!page) return { pages, page: null, widths: [], width: null };

  const widths = await getClickWidths(page);
  const width = widths.find((w) => w.viewport_w === params.w) ?? widths[0] ?? null;
  return { pages, page, widths, width };
});
