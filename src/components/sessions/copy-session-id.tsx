"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Copies the full session id. The copy itself has no visible result, so it confirms with a toast. */
export function CopySessionId({ sessionId }: { sessionId: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(sessionId);
      toast.success("Session id copied");
    } catch (err) {
      console.error(err);
      toast.error("Could not copy the session id", { description: "Your browser blocked clipboard access. Select the id and copy it manually." });
    }
  }

  return (
    <Button variant="outline" size="icon" className="size-7 shrink-0 rounded-full" onClick={copy} aria-label="Copy session id" title="Copy session id">
      <Copy className="size-3.5" aria-hidden />
    </Button>
  );
}
