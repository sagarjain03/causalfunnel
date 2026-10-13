"use client";

import { usePathname } from "next/navigation";
import { NavLinks } from "@/components/dashboard/nav-links";

/**
 * NavLinks with the active item from the URL. usePathname suspends on routes with unknown dynamic params
 * (sessions/[sessionId]) under Cache Components, so always render this inside <Suspense>.
 */
export function ActiveNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return <NavLinks pathname={usePathname()} onNavigate={onNavigate} />;
}
