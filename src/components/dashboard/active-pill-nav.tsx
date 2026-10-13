"use client";

import { usePathname } from "next/navigation";
import { PillNav } from "@/components/dashboard/pill-nav";

/**
 * PillNav with the active item from the URL. usePathname suspends on routes with unknown dynamic params
 * (journeys/[sessionId]) under Cache Components, so always render this inside <Suspense>.
 */
export function ActivePillNav() {
  return <PillNav pathname={usePathname()} />;
}
