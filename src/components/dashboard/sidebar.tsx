import { Suspense } from "react";
import { Brand } from "@/components/dashboard/brand";
import { ActiveNavLinks } from "@/components/dashboard/active-nav-links";
import { NavLinks } from "@/components/dashboard/nav-links";

/** Desktop sidebar (md and up). */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r bg-card px-4 py-6 md:flex">
      <div className="px-3">
        <Brand />
      </div>
      <Suspense fallback={<NavLinks pathname={null} />}>
        <ActiveNavLinks />
      </Suspense>
    </aside>
  );
}
