import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SessionNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold">Session not found</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        No events exist for this session id. It may be mistyped, or the session was never recorded.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/sessions">Back to sessions</Link>
        </Button>
        {/* Plain <a>: /demo is a static file behind a rewrite, not an app route. */}
        <Button asChild>
          <a href="/demo">Open demo site →</a>
        </Button>
      </div>
    </div>
  );
}
