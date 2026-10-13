import { connection } from "next/server";
import { Activity, Eye, FileText, MousePointerClick, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { getOverviewStats } from "@/server/services/stats";

/** Streams behind <Suspense>: reads the DB at request time. */
export async function OverviewStats() {
  await connection();
  const stats = await getOverviewStats();

  if (stats.events === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No events yet"
        description="Open the demo store and click around. Stats appear here as soon as the first event arrives."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Sessions" value={stats.sessions} icon={Users} />
      <StatCard label="Events" value={stats.events} icon={Eye} iconClassName="text-event-pageview" />
      <StatCard label="Clicks" value={stats.clicks} icon={MousePointerClick} iconClassName="text-event-click" />
      <StatCard label="Pages tracked" value={stats.pages} icon={FileText} />
    </div>
  );
}
