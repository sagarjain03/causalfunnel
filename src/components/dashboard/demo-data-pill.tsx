import { connection } from "next/server";
import { hasSeedData } from "@/server/services/stats";

/** "Includes demo data" when any seeded event exists (scripts/seed.ts), so seeded numbers are never passed off as real. */
export async function DemoDataPill() {
  await connection();
  if (!(await hasSeedData())) return null;
  return (
    <span
      className="glass inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap text-muted-foreground"
      title="Some of these numbers come from seeded demo journeys (npm run seed). Remove them with npm run seed -- --clear."
    >
      Includes demo data
    </span>
  );
}
