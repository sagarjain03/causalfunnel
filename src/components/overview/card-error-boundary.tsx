"use client";

import { catchError, type ErrorInfo } from "next/error";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Error state of ONE Overview card (Next's catchError): the other cards keep working. */
function CardError({ title, className }: { title: string; className?: string }, { error, retry }: ErrorInfo) {
  console.error(`[overview/${title}]`, error);
  return (
    <Card className={cn("min-h-40 items-center justify-center gap-2 text-center", className)} role="alert">
      <TriangleAlert className="size-4 text-down" aria-hidden />
      <p className="text-sm">Couldn&apos;t load {title.toLowerCase()}</p>
      <Button variant="outline" size="sm" className="rounded-full" onClick={() => retry()}>
        Try again
      </Button>
    </Card>
  );
}

export const CardErrorBoundary = catchError(CardError);
