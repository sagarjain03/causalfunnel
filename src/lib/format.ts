// Display formatting. Intl only (RULES §1: no date library).

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const relativeFormats = {
  long: new Intl.RelativeTimeFormat("en", { numeric: "auto" }),
  narrow: new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" }),
};
const numberFormat = new Intl.NumberFormat("en");

/** First 8 chars of a session id. */
export function shortId(id: string): string {
  return id.slice(0, 8);
}

/** Path part of a stored (already normalized) page URL. */
export function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/** "3 minutes ago" (or "3m ago" with style "narrow"), relative to `now` (passed in so server and client render the same text). */
export function formatRelative(iso: string, now: number, style: keyof typeof relativeFormats = "long"): string {
  const relativeFormat = relativeFormats[style];
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  if (abs < MINUTE) return relativeFormat.format(Math.round(diff / SECOND), "second");
  if (abs < HOUR) return relativeFormat.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY) return relativeFormat.format(Math.round(diff / HOUR), "hour");
  return relativeFormat.format(Math.round(diff / DAY), "day");
}

/** "4m 12s", "1h 3m", "8s". */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / SECOND));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Gap between two timeline steps: "+12s". */
export function formatGap(ms: number): string {
  return `+${formatDuration(ms)}`;
}

export function formatNumber(n: number): string {
  return numberFormat.format(n);
}

const PAGE_LABELS: Record<string, string> = {
  "products.html": "Products",
  "product.html": "Product",
  "checkout.html": "Checkout",
};

/** Friendly page name: /demo or /demo/ → Home, …/products.html → Products, else the last segment without .html. */
export function pageLabel(url: string): string {
  const path = pathOf(url).replace(/\/+$/, "");
  if (path === "/demo") return "Home"; // exactly /demo (and /demo/ after the trim); test URLs must not shape labels
  const last = path.split("/").pop() ?? "";
  return PAGE_LABELS[last] ?? (last.replace(/\.html$/, "") || "/");
}

/** "1 journey" / "3 journeys". */
export function plural(n: number, word: string): string {
  return `${formatNumber(n)} ${word}${n === 1 ? "" : "s"}`;
}
