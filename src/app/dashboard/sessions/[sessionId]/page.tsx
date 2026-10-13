import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { JourneySkeleton } from "@/components/sessions/journey-skeleton";
import { SessionJourney } from "@/components/sessions/session-journey";

// Not async: params is passed down as a Promise so the header stays in the static shell.
export default function SessionPage({ params }: PageProps<"/dashboard/sessions/[sessionId]">) {
  return (
    <>
      <Link
        href="/dashboard/sessions"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All sessions
      </Link>
      <PageHeader eyebrow="Session" title="User journey" description="Every event in this session, in the order it happened." />
      <Suspense fallback={<JourneySkeleton />}>
        <SessionJourney params={params} />
      </Suspense>
    </>
  );
}
