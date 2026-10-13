import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JourneyNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-panel px-6 py-16 text-center">
      <div className="flex size-9 items-center justify-center rounded-icon bg-panel-raised">
        <SearchX className="size-4 text-foreground" aria-hidden />
      </div>
      <h2 className="text-lg font-medium">Journey not found</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        No events exist for this session id. It may be mistyped, or the session was never recorded.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/journeys">Back to journeys</Link>
        </Button>
        {/* Plain <a>: /demo is a static file behind a rewrite, not an app route. */}
        <Button asChild className="rounded-full">
          <a href="/demo">Open demo store</a>
        </Button>
      </div>
    </div>
  );
}
