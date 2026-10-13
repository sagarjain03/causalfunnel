import { Suspense } from "react";
import { ActivePillNav } from "@/components/dashboard/active-pill-nav";
import { LiveStatus } from "@/components/dashboard/live-status";
import { Logo } from "@/components/dashboard/logo";
import { PillNav } from "@/components/dashboard/pill-nav";
import { TimezoneSync } from "@/components/dashboard/timezone-sync";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Static shell: frame (with the faint app-glow background behind the glass controls), top bar. Only the Live dot and the active nav pill stream (each in its own Suspense).
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <TooltipProvider>
      <div className="m-4 flex min-h-[calc(100dvh-2rem)] flex-col gap-6 app-glow rounded-frame border border-line bg-app p-3 md:p-6">
        <header className="grid grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
          <Logo />
          <div className="col-span-2 row-start-2 md:col-span-1 md:row-start-1 md:col-start-2">
            <Suspense fallback={<PillNav pathname={null} />}>
              <ActivePillNav />
            </Suspense>
          </div>
          <div className="flex items-center justify-end gap-2 md:col-start-3">
            <Suspense fallback={<Skeleton className="h-9 w-20 rounded-full" />}>
              <LiveStatus />
            </Suspense>
            {/* Plain <a>: /demo is a static file behind a rewrite, not an app route. */}
            <Button asChild className="hidden h-9 rounded-full px-4 sm:inline-flex">
              <a href="/demo">Open demo store</a>
            </Button>
          </div>
        </header>
        <main className="flex flex-col gap-4">{children}</main>
      </div>
      <Toaster />
      <TimezoneSync />
    </TooltipProvider>
  );
}
