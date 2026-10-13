import { cn } from "@/lib/utils";

/** "Reached checkout" (sage) or "Browsing" (muted), from SessionSummary.reached_checkout. */
export function StatusPill({ reachedCheckout }: { reachedCheckout: boolean }) {
  return (
    <span
      className={cn(
        "glass inline-flex rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap",
        reachedCheckout ? "text-sage" : "text-muted-foreground",
      )}
    >
      {reachedCheckout ? "Reached checkout" : "Browsing"}
    </span>
  );
}
