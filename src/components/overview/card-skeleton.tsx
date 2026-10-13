import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Loading state in the card's shape: title line + a body of the card's real height. No numbers. */
export function CardSkeleton({ className, bodyClassName }: { className?: string; bodyClassName: string }) {
  return (
    <Card className={cn("min-w-0", className)} aria-busy="true">
      <Skeleton className="h-6 w-40" />
      <Skeleton className={cn("w-full rounded-tile", bodyClassName)} />
    </Card>
  );
}
