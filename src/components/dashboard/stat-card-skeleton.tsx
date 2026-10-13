import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card className="gap-3 p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-20 md:h-10" />
    </Card>
  );
}
