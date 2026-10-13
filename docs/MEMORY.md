# Memory

> Claude: read this first every session. Update it after every completed task.

## Current status
- **Phase:** 1 complete → Phase 2 next
- **Working on (file):** none
- **Next step:** Phase 2, task 1 — `public/tracker.js`

## Completed
- [2026-10-13] Phase 0: Next.js 16.4 + React 19.3 + Tailwind v4 scaffold, shadcn config (manual: components.json, lib/utils.ts), design tokens in globals.css, deps installed, docs/ written, build passes.
- [2026-10-13] Phase 1 code (uncommitted, per user):
  - `src/server/db.ts` (cached connection), `src/server/models/event.ts` (schema + 3 indexes), `src/lib/validation.ts`, `src/server/http.ts` (`ok`/`fail`/`corsHeaders`/`handleError`/`HttpError`), `src/types/index.ts`.
  - Services: `events.ts`, `sessions.ts` (list + journey), `heatmap.ts` (heatmap + pages), `stats.ts` (`getOverviewStats()` via one `$facet`, for the Phase 3 overview).
  - Routes: `api/events` (POST, OPTIONS), `api/sessions`, `api/sessions/[sessionId]/events`, `api/heatmap`, `api/pages`.
  - `scripts/smoke-test.mjs` + `npm run smoke`.
  - `tsc`, `lint`, `build` pass; all `/api/*` routes build as dynamic (ƒ). `npm run smoke` 16/16 ✓ against Atlas; the 3 indexes are confirmed in Atlas.

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
- Smoke test data persists in the DB under `https://smoke.example/<runId>/…` (there's no delete endpoint).

## Known issues / TODO
- Smoke test data (`smoke.example` URLs) stays in the DB and will appear in the dashboard; needs a cleanup script or separate test DB in Phase 6.
- The Atlas password was once in `.env.example` (never committed; it now holds placeholders). Rotate it before deploying.
- The build warns about a stray `D:\pnpm-lock.yaml` outside the repo (harmless; delete it or set `turbopack.root`).
