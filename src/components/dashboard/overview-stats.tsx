import { connection } from "next/server";
import { Activity, FileText, MousePointerClick, MousePointer2, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { StatTile } from "@/components/dashboard/stat-tile";
import { Card } from "@/components/ui/card";
import { getOverviewStats } from "@/server/services/stats";

/** Streams behind <Suspense>: all-time totals as 2×2 tiles. Change pills come in Phase 3.5 Step B. */
export async function OverviewStats() {
  await connection();
  const stats = await getOverviewStats();

  if (stats.events === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No events yet"
        description="Open the demo store and click around. Numbers appear here as soon as the first event arrives."
      />
    );
  }

  return (
    <Card className="lg:col-span-4">
      <h2 className="text-lg font-medium">Totals</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Sessions" value={stats.sessions} icon={Users} />
        <StatTile label="Events" value={stats.events} icon={MousePointer2} />
        <StatTile label="Clicks" value={stats.clicks} icon={MousePointerClick} />
        <StatTile label="Pages tracked" value={stats.pages} icon={FileText} />
      </div>
    </Card>
  );
}
