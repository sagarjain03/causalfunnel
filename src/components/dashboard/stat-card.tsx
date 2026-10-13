import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClassName?: string;
};

export function StatCard({ label, value, icon: Icon, iconClassName }: StatCardProps) {
  return (
    <Card className="gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <Icon className={cn("size-4 text-muted-foreground", iconClassName)} aria-hidden />
      </div>
      <span className="font-mono text-3xl font-semibold tabular-nums md:text-4xl">{formatNumber(value)}</span>
    </Card>
  );
}
