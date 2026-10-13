# Memory

> Claude: read this first every session. Update it after every completed task.

## Current status
- **Phase:** 2 complete → Phase 3 next
- **Working on (file):** none
- **Next step:** Phase 3, task 1 — `npx shadcn@latest add …`. Carry over Phase 2 task 3: the dashboard empty states must link to `/demo`.

## Completed
- [2026-10-13] Phase 0: Next.js 16.4 + React 19.3 + Tailwind v4 scaffold, shadcn config (manual: components.json, lib/utils.ts), design tokens in globals.css, deps installed, docs/ written, build passes.
- [2026-10-13] Phase 1 (committed by user):
  - `src/server/db.ts` (cached connection), `src/server/models/event.ts` (schema + 3 indexes), `src/lib/validation.ts`, `src/server/http.ts` (`ok`/`fail`/`corsHeaders`/`handleError`/`HttpError`), `src/types/index.ts`.
  - Services: `events.ts`, `sessions.ts` (list + journey), `heatmap.ts` (heatmap + pages), `stats.ts` (`getOverviewStats()` via one `$facet`, for the Phase 3 overview).
  - Routes: `api/events` (POST, OPTIONS), `api/sessions`, `api/sessions/[sessionId]/events`, `api/heatmap`, `api/pages`.
  - `scripts/smoke-test.mjs` + `npm run smoke`.
  - `tsc`, `lint`, `build` pass; all `/api/*` routes build as dynamic (ƒ). `npm run smoke` 16/16 ✓ against Atlas; the 3 indexes are confirmed in Atlas.
- [2026-10-13] Phase 2 (uncommitted; the user ran the manual DevTools checklist and every item passed):
  - `public/tracker.js` (3.6 KB raw / 1.6 KB gzip), `public/demo/{index,products,checkout}.html` (Northwind demo store), a `/demo` → `/demo/index.html` rewrite in `next.config.ts`, an ESLint override for `tracker.js`.
  - Verified in Playwright: page_view + clicks stored; the capture listener still records clicks when host code calls `stopPropagation`; query/hash history changes don't create page views; loading the script twice doesn't double-count; `?cf_preview=1` disables tracking; 0 console errors or warnings.
  - Task 3 (link to `/demo` from the dashboard empty states) is deferred to Phase 3, because the dashboard doesn't exist yet.

## Decisions & deviations from docs
- shadcn was configured manually (registry unreachable during setup). `npx shadcn@latest add <component>` works normally on a dev machine.
- Fonts load from the `geist` npm package instead of `next/font/google`, so builds never depend on network access.
- `POST /api/events` reads `req.text()` + `JSON.parse` (the tracker sends `text/plain` via sendBeacon to skip the CORS preflight). Bodies over 64 KB → 413; this is checked via `content-length` and again on the actual byte length.
- `page_url` is normalized to origin + pathname (no query/hash, no trailing slash except root) by `normalizePageUrl` in `validation.ts`. Both the event schema and the heatmap query use it.
- `timestamp` accepts an ISO datetime string or epoch ms.
- A malformed session id → 400; a well-formed but unknown id → 404 (`HttpError` thrown from the service).
- Sessions list: `$group` → keyset `$match` → `$sort {last_seen:-1, session_id:-1}`. The cursor is base64url JSON `{t, s}`; a bad cursor → 400. `$group` scans the whole collection (documented trade-off).
- ZodError → 400 with the first issue's message, prefixed with its field path (e.g. `x: Invalid input…`).
- CORS headers are only on `/api/events`; the dashboard is same-origin.
- In route handlers, request data (`searchParams`, `params`, `connection()`) is read **outside** `try/catch`, so Next's prerender bailout is never swallowed by `handleError`.
- **Phase 4 must load heatmap preview iframes with `?cf_preview=1`.** The tracker skips ALL tracking when `cf_preview=1` is in `location.search`, so the dashboard's preview doesn't record fake page views.
- Tracker page_view rule: one on load, then on `pushState` / `replaceState` / `popstate` only when `location.pathname` differs from the last tracked pathname (query/hash changes are ignored).
- Tracker returns immediately if `window.CausalFunnel` already exists (no double-counting if included twice). `window.CausalFunnel.sessionId()` is read-only and doesn't extend the session.
- The tracker endpoint defaults to `/api/events` on the origin of `tracker.js` itself (from `document.currentScript.src`), not the host page; `data-endpoint` overrides it.
- Demo links always use `/demo` (never `/demo/index.html`), so the home page is one heatmap page, not two.
- Demo pages use DESIGN.md hex values as CSS variables in an inline `<style>`; the "no hex in components" rule applies to `src/`.
- `tracker.js` is ES2017 (no optional catch binding), so ESLint's `caughtErrors` check is off for that file only.
- Smoke test data persists in the DB under `https://smoke.example/<runId>/…` (there's no delete endpoint).

## Known issues / TODO
- Smoke test data (`smoke.example` URLs) stays in the DB and will appear in the dashboard; needs a cleanup script or separate test DB in Phase 6.
- The Atlas password was once in `.env.example` (never committed; it now holds placeholders). Rotate it before deploying.
- All manual test clicks so far were made with DevTools docked, at `viewport_w` ≈ 618px, so they fall in the mobile (<768px) bucket. An empty Desktop heatmap in Phase 4 is expected until desktop-width clicks are generated. This is not a bug.
- The build warns about a stray `D:\pnpm-lock.yaml` outside the repo (harmless; delete it or set `turbopack.root`).
