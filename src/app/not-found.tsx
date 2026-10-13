import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/dashboard/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found · CausalFunnel Analytics" };

// Global 404 for every unmatched URL (/anything, /dashboard/anything). It renders in the root layout only, so it draws
// the dashboard frame itself. Unknown journey ids keep their own journeys/[sessionId]/not-found.tsx.
export default function NotFound() {
  return (
    <div className="m-4 flex min-h-[calc(100dvh-2rem)] flex-col gap-6 app-glow rounded-frame border border-line bg-app p-3 md:p-6">
      <header className="flex items-center">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-card border border-line bg-panel px-6 py-16 text-center">
          <div className="flex size-9 items-center justify-center rounded-icon bg-panel-raised">
            <Compass className="size-4 text-foreground" aria-hidden />
          </div>
          <h1 className="text-lg font-medium">Page not found</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            This address doesn&apos;t match any page. It may be mistyped, or the page has moved.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard">Go to overview</Link>
            </Button>
            {/* Plain <a>: /demo is a static file behind a rewrite, not an app route. */}
            <Button asChild className="rounded-full">
              <a href="/demo">Open demo store</a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
