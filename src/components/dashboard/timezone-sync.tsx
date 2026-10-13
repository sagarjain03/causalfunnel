"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const COOKIE = "cf_tz";

/**
 * Stores the browser's IANA time zone in the cf_tz cookie so the server can group days and hours in the viewer's
 * time zone. Renders nothing; refreshes server data once when the cookie is new or changed (until then: UTC).
 */
export function TimezoneSync() {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const current = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    if (current && decodeURIComponent(current) === tz) return;
    document.cookie = `${COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);
  return null;
}
