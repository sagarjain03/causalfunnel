"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  error: Error & { digest?: string };
  retry: () => void;
  title?: string;
};

/** Shared body for every dashboard error.tsx. */
export function ErrorState({ error, retry, title = "Something went wrong" }: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-card px-6 py-16 text-center">
      <TriangleAlert className="size-6 text-destructive" aria-hidden />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        The data could not be loaded. Check that the database is reachable, then try again.
      </p>
      {error.digest && <p className="font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>}
      <Button variant="outline" className="mt-2" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
