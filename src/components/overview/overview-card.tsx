import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type OverviewCardProps = {
  title: string;
  /** One short line explaining what is counted (definitions live here, not in tooltips only). */
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Card shell shared by every Overview card: 18px title, muted one-line definition, optional corner action. */
export function OverviewCard({ title, description, action, className, children }: OverviewCardProps) {
  return (
    <Card className={cn("min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-lg font-medium">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
