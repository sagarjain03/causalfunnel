import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type PageTitleProps = {
  title: string;
  /** One sentence of real data; an async Server Component, streamed behind <Suspense>. */
  summary: ReactNode;
};

/** Page title (24px / 500) with one muted sentence of live numbers under it. */
export function PageTitle({ title, summary }: PageTitleProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
      <Suspense fallback={<Skeleton className="h-5 w-64 max-w-full" />}>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </Suspense>
    </header>
  );
}
