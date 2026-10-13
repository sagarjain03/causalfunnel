/** "2026-10-13" → "Oct 13" (short) or "Mon, Oct 13" (long). The key is already a calendar day in the viewer's zone. */
export function dayLabel(key: string, style: "short" | "long" = "short"): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(style === "long" ? { weekday: "short" } : {}),
  }).format(Date.UTC(y, m - 1, d));
}
