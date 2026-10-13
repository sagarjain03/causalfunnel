import { Suspense } from "react";
import { PageTitle } from "@/components/dashboard/page-title";
import { JourneysSummary } from "@/components/sessions/journeys-summary";
import { SessionsList } from "@/components/sessions/sessions-list";
import { SessionsTableSkeleton } from "@/components/sessions/sessions-table-skeleton";
import { Card } from "@/components/ui/card";

export default function JourneysPage() {
  return (
    <>
      <PageTitle title="Journeys" summary={<JourneysSummary />} />
      <Card>
        <Suspense fallback={<SessionsTableSkeleton />}>
          <SessionsList />
        </Suspense>
      </Card>
    </>
  );
}
