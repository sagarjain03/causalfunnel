import { Suspense, type ReactNode } from "react";
import { DemoDataPill } from "@/components/dashboard/demo-data-pill";
import { Skeleton } from "@/components/ui/skeleton";

type PageTitleProps = {
  title: string;
  /** One sentence of real data; an async Server Component, streamed behind <Suspense>. */
  summary: ReactNode;
  /** Optional control on the right (desktop) / under the title (mobile), e.g. the Overview range pill. */
  action?: ReactNode;
};

/** Page title (24px / 500) with one muted sentence of live numbers under it. */
export function PageTitle({ title, summary, action }: PageTitleProps) {
  const heading = (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        <Suspense fallback={null}>
          <DemoDataPill />
        </Suspense>
      </div>
      <Suspense fallback={<Skeleton className="h-5 w-64 max-w-full" />}>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </Suspense>
    </div>
  );
  if (!action) return <header>{heading}</header>;
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      {heading}
      {action}
    </header>
  );
}
