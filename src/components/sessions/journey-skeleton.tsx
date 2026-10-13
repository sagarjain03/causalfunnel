import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JourneySkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading session">
      <Card className="gap-5 p-5">
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </Card>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-16 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
