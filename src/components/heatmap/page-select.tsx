"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber, pageLabel, pathOf } from "@/lib/format";
import type { PageSummary } from "@/types";

/** Glass pill select of tracked pages; writes ?page= (and drops ?w=, the new page picks its own default width). */
export function PageSelect({ pages, page }: { pages: PageSummary[]; page: string }) {
  const router = useRouter();
  const known = pages.some((p) => p.page_url === page);

  return (
    <Select
      value={known ? page : undefined}
      onValueChange={(value) => router.push(`/dashboard/heatmap?page=${encodeURIComponent(value)}`, { scroll: false })}
    >
      <SelectTrigger aria-label="Page" className="glass h-9 min-w-44 rounded-full border-0 bg-transparent px-4 text-sm text-foreground">
        <SelectValue placeholder={pageLabel(page)} />
      </SelectTrigger>
      <SelectContent className="rounded-tile border-line bg-panel">
        {pages.map((p) => (
          <SelectItem key={p.page_url} value={p.page_url} title={`${pathOf(p.page_url)} · ${formatNumber(p.clicks)} clicks`}>
            {pageLabel(p.page_url)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
