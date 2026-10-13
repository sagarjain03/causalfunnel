import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoDataPill } from "@/components/dashboard/demo-data-pill";
import { JourneySkeleton } from "@/components/sessions/journey-skeleton";
import { SessionJourney } from "@/components/sessions/session-journey";

// Not async: params is passed down as a Promise so the back link stays in the static shell.
export default function JourneyPage({ params }: PageProps<"/dashboard/journeys/[sessionId]">) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          href="/dashboard/journeys"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All journeys
        </Link>
        <Suspense fallback={null}>
          <DemoDataPill />
        </Suspense>
      </div>
      <Suspense fallback={<JourneySkeleton />}>
        <SessionJourney params={params} />
      </Suspense>
    </>
  );
}
