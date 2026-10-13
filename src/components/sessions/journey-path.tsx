import { Fragment } from "react";
import { pageLabel } from "@/lib/format";

const MAX_CHIPS = 4;

/** A journey's page sequence as small glass chips joined by "→", e.g. Home → Products → Checkout, then "+n". */
export function JourneyPath({ path, max = MAX_CHIPS }: { path: string[]; max?: number }) {
  const shown = path.slice(0, max);
  const rest = path.length - shown.length;

  if (path.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <span className="flex flex-wrap items-center gap-1" title={path.join(" → ")}>
      {shown.map((url, i) => (
        <Fragment key={`${url}-${i}`}>
          {i > 0 && (
            <span className="text-xs text-muted-foreground" aria-hidden>
              →
            </span>
          )}
          <span className="glass rounded-full px-2 py-0.5 text-xs">{pageLabel(url)}</span>
        </Fragment>
      ))}
      {rest > 0 && <span className="text-xs text-muted-foreground tabular-nums">+{rest}</span>}
    </span>
  );
}
