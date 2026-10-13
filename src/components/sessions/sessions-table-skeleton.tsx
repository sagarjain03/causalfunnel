import { Skeleton } from "@/components/ui/skeleton";

export function SessionsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col" aria-busy="true" aria-label="Loading journeys">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="hidden h-4 w-10 sm:block" />
          <Skeleton className="hidden h-4 w-10 sm:block" />
          <Skeleton className="hidden h-4 w-10 sm:block" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
