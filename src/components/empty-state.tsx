import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "col-span-full flex flex-col items-center gap-3 rounded-card border border-line bg-panel px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-icon bg-panel-raised">
        <Icon className="size-4 text-foreground" aria-hidden />
      </div>
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {/* Plain <a>: /demo is a static file behind a rewrite, not an app route, so client navigation would fail. */}
      <Button asChild className="mt-2 rounded-full">
        <a href="/demo">Open demo store</a>
      </Button>
    </div>
  );
}
