import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { SessionsList } from "@/components/sessions/sessions-list";
import { SessionsTableSkeleton } from "@/components/sessions/sessions-table-skeleton";

export default function SessionsPage() {
  return (
    <>
      <PageHeader eyebrow="Dashboard" title="Sessions" description="Every visitor session, most recent activity first." />
      <Suspense fallback={<SessionsTableSkeleton />}>
        <SessionsList />
      </Suspense>
    </>
  );
}
