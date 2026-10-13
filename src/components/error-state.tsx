"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  error: Error & { digest?: string };
  retry: () => void;
  title?: string;
};

/** Shared body for every dashboard error.tsx. The frame and navbar stay visible around it. */
export function ErrorState({ error, retry, title = "Something went wrong" }: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-card border border-line bg-panel px-6 py-16 text-center">
      <div className="flex size-9 items-center justify-center rounded-icon bg-panel-raised">
        <TriangleAlert className="size-4 text-down" aria-hidden />
      </div>
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        The data could not be loaded. Check that the database is reachable, then try again.
      </p>
      {error.digest && <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>}
      <Button variant="outline" className="mt-2 rounded-full" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
