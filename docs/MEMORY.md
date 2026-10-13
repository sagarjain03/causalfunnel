# Memory

> Claude: read this first every session. Update it after every completed task.

## Current status
- **Phase:** 3 code complete → user runs the manual checklist, then ticks Phase 3 "Done when"
- **Working on (file):** none
- **Next step:** Phase 4, task 1 — the heatmap page selector (`/dashboard/heatmap`). Enable the "Heatmap" nav item in `src/components/dashboard/nav-links.tsx` (currently disabled with a "Soon" badge).

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
- [2026-10-13] Phase 3 code (uncommitted):
  - shadcn: button card table badge skeleton select tabs tooltip separator sonner scroll-area sheet (`sheet` added for the mobile nav).
  - Dashboard shell (`app/dashboard/layout.tsx`, sidebar, mobile sheet nav), overview with 4 stat cards, sessions table with Load more, session journey (summary + timeline), `error.tsx` in each segment, `[sessionId]/not-found.tsx`, `/` → `/dashboard`.
  - Carried-over Phase 2 task 3 is done: every empty state links to `/demo`.
  - `tsc`, `lint`, `build` pass; the 3 dashboard routes build as ◐ (static shell + streamed data). Playwright checks: stats and the table match the API; a row click opens the journey; unknown and malformed ids show not-found; at 375px there's no overflow and the sheet nav works; 0 console errors.
  - Not yet seen in a browser: "Load more" (the DB has 7 sessions, fewer than 50).

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
- **Cache Components pattern for dashboard pages:** the page component is sync (heading in the static shell); the data part is an async component in `src/components/**` behind `<Suspense fallback={Skeleton}>` that calls `await connection()` **before** any DB read. This applies even on `[sessionId]`: `await params` alone doesn't stop prerendering in dev (the param value is known), and mongoose then hits `new Date()` during the prerender.
- No `loading.tsx` files (deviation from PHASES' wording): the Suspense fallbacks are the loading state and keep the headings in the static shell.
- `usePathname` suspends on `[sessionId]` under Cache Components, so `ActiveNavLinks` is always inside `<Suspense fallback={<NavLinks pathname={null} />}>`.
- `notFound()` on the session page runs after streaming starts, so the HTML status is 200 + `noindex` (documented Next behaviour). The API (`/api/sessions/<id>/events`) still returns a real 404.
- shadcn's generated components imported `cn` from a new `cn` npm package; they're repointed to `@/lib/utils` (RULES §1), and `cn` was uninstalled. `ui/sonner.tsx` uses `theme="dark"`, so `next-themes` was uninstalled too. `globals.css` was not touched by shadcn.
- Links to `/demo` use a plain `<a>`, never `next/link`: it's a static file behind a rewrite, not an app route.
- Times in the UI: `<LocalTime>` (client) renders a labelled UTC time on the server and switches to the browser's local time after hydration (`useSyncExternalStore`). Relative "x ago" times use `fetchedAt` from the data loader, so server and client match.
- Load more: the client calls `GET /api/sessions?cursor=`; failures show a sonner toast and keep the existing rows. The response is typed with the shared `SessionsPage` type (our own API), not zod-parsed, to keep zod out of the client bundle.
- Sessions table at <640px hides Clicks and Pages (`hidden sm:table-cell`); `overflow-x-auto` is only a fallback.
- `npm run clean:test` (`scripts/clean-test-data.mjs`) removes **whole test sessions**: any session with at least one event whose `page_url` starts with `https://smoke.example` (followed by `/`, `:` or the end), contains `/__test/`, or ends in `/demo/spa-step` (the Phase 2 Playwright check). All events of those sessions are deleted, so no half-sessions remain. It is a dry run by default (a table per session); it deletes only with `--yes`, using the same session filter. RULES §4: future automated tests must use `/__test/` URLs.
- Smoke test data persists in the DB under `https://smoke.example/<runId>/…` (there's no delete endpoint).

## Known issues / TODO
- ~~Smoke test data stays in the DB and appears in the dashboard.~~ Resolved: run `npm run clean:test` (dry run), then `npm run clean:test -- --yes` to delete.
- The Atlas password was once in `.env.example` (never committed; it now holds placeholders). Rotate it before deploying.
- All manual test clicks so far were made with DevTools docked, at `viewport_w` ≈ 618px, so they fall in the mobile (<768px) bucket. An empty Desktop heatmap in Phase 4 is expected until desktop-width clicks are generated. This is not a bug.
- The build warns about a stray `D:\pnpm-lock.yaml` outside the repo (harmless; delete it or set `turbopack.root`).
