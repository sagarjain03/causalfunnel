import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JourneySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12" aria-busy="true" aria-label="Loading journey">
      <div className="flex flex-col gap-4 lg:col-span-5">
        <Card>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-20 rounded-tile" />
            ))}
          </div>
        </Card>
        <Card>
          <Skeleton className="h-6 w-24" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="h-10 flex-1" />
            </div>
          ))}
        </Card>
      </div>
      <Card className="lg:col-span-7">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="aspect-video w-full rounded-tile" />
      </Card>
    </div>
  );
}
