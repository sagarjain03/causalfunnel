import Link from "next/link";
import { resolveOverviewParams, type OverviewSearchParams } from "@/components/overview/overview-params";
import { cn } from "@/lib/utils";
import type { RangeDays } from "@/server/services/overview";

const RANGES: RangeDays[] = [7, 14, 28];

/** 7d / 14d / 28d glass segmented pill (heatmap ModeToggle look). Links, so the range lives in a shareable URL. */
export function RangeSelectLinks({ active }: { active: RangeDays | null }) {
  return (
    <nav className="glass flex h-9 shrink-0 items-center rounded-full p-1" aria-label="Date range">
      {RANGES.map((d) => (
        <Link
          key={d}
          href={d === 7 ? "/dashboard" : `/dashboard?range=${d}`}
          scroll={false}
          aria-current={active === d ? "page" : undefined}
          title={`Last ${d} days vs the ${d} days before`}
          className={cn(
            "flex h-7 items-center rounded-full px-3 text-sm",
            active === d ? "glass-shine bg-panel-raised text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {d}d
        </Link>
      ))}
    </nav>
  );
}

export async function RangeSelect({ searchParams }: { searchParams: OverviewSearchParams }) {
  const { days } = await resolveOverviewParams(await searchParams);
  return <RangeSelectLinks active={days} />;
}
