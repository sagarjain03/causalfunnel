import { Skeleton } from "@/components/ui/skeleton";

export function SessionsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-lg border bg-card" aria-busy="true" aria-label="Loading sessions">
      <div className="border-b px-2 py-3">
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 border-b px-2 py-3 last:border-b-0">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="hidden h-4 w-10 sm:block" />
          <Skeleton className="hidden h-4 w-10 sm:block" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
