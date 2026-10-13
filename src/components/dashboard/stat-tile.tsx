import type { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/format";

type StatTileProps = {
  label: string;
  value: number;
  icon: LucideIcon;
};

/** Inner bento tile: icon square, big light number, small label (DESIGN.md §4–5). */
export function StatTile({ label, value, icon: Icon }: StatTileProps) {
  return (
    <div className="flex flex-col gap-4 rounded-tile bg-panel-raised p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-icon bg-panel" aria-hidden>
          <Icon className="size-4 text-foreground" />
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-[40px] leading-none font-light tabular-nums md:text-[48px]">{formatNumber(value)}</span>
    </div>
  );
}
