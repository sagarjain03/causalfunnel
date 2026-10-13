import { Suspense } from "react";
import { SessionsList } from "@/components/sessions/sessions-list";
import { SessionsTableSkeleton } from "@/components/sessions/sessions-table-skeleton";
import { Card } from "@/components/ui/card";

export default function JourneysPage() {
  return (
    <Card>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">Journeys</h2>
        <p className="text-sm text-muted-foreground">Every visitor session, most recent activity first.</p>
      </div>
      <Suspense fallback={<SessionsTableSkeleton />}>
        <SessionsList />
      </Suspense>
    </Card>
  );
}
