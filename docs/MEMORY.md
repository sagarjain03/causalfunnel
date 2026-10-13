# Memory

> Claude: read this first every session. Update it after every completed task.

## Current status
- **Phase:** 3.5 Step A + demo store + images + docs sync complete (uncommitted). The events collection is **empty** (0 events, 2026-10-13) — heatmaps start fresh on the new demo layout.
- **Working on (file):** none
- **Next step:** Phase 3.5 Step B (ARCHITECTURE §4.1 services, then the bento cards in DESIGN.md §6 "Planned").

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
- [2026-10-13] Redesign spec (docs only): rewrote `DESIGN.md` ("Bento on dark"), RULES §1/§3, ARCHITECTURE (§4.1 Overview services, folder tree), PHASES (new Phase 3.5; Phase 4 adds the replay scrubber; Phase 5 trimmed to the DESIGN §9 motion list). All Aceternity mentions removed.
- [2026-10-13] Phase 3.5 Step A (uncommitted):
  - Onest font, `globals.css` rewritten to the DESIGN §2 tokens + shadcn aliases + `.hatch` + radius tokens (`rounded-icon/tile/card/frame`).
  - Rounded frame + top bar (logo, pill navbar with motion `layoutId`, Live/Idle dot via `getLastEventAt()`, Open demo store), greeting row.
  - `/dashboard/sessions` → `/dashboard/journeys` (list + detail), with `reached_checkout` in `listSessions`. Journey detail: summary tiles + selectable timeline (left), page preview iframe with click dot (right).
  - Overview: totals as 2×2 tiles.
  - Deleted the sidebar, mobile sheet, nav-links, page-header, stat-card(s), brand, `ui/sheet.tsx`.
  - `tsc`, `lint`, `build` pass. Playwright: Live matches the newest event; `reached_checkout` correct; the dot lands on the clicked field; 375px has no overflow anywhere (the journeys table fits without scrolling); 0 console errors on fresh loads.
- [2026-10-13] Demo store redesign (uncommitted, user request): "Northwind", an Amazon-style marketplace with its own brand (the user asked for "exactly like Amazon"; declined because of trademark/impersonation risk on a public repo + deploy, and agreed on "Amazon-style, own brand"). 4 pages (`index`, `products`, new `product`, `checkout`) + shared `public/demo/store.css`; static, no JS except the tracker; no page-level overflow at 1280 and 375. **Images pending from the user** (free-license, Unsplash/Pexels) in `public/demo/img/`: `hero.jpg` 1500×600, `deal-1..4.jpg` 600×600, `p-1..9.jpg` 800×800 (backpack, headphones, sneakers, smartwatch, bottle, desk lamp, t-shirt, sunglasses, mug), `p-1b.jpg`, `p-1c.jpg`. Missing images show a grey tile (CSS background-image) plus a 404 in the console.
- [2026-10-13] Images + layout check + docs sync + screenshots (uncommitted):
  - 16 Unsplash License photos in `public/demo/img/` (exact sizes, 19–92 KB each), credited in `img/CREDITS.md`. The licence was checked via the download endpoint (only free photos redirect to images.unsplash.com). Fetched with curl: Python urllib gets bot-checked. `p-1b`/`p-1c` are different backpacks.
  - The demo pages have no `<img>`: every image is a CSS background on a fixed-size box. Playwright, images blocked vs loaded on all 4 pages at 1280 and 375: 0 element boxes moved.
  - DESIGN.md rewritten to describe the code exactly (Built vs Planned) + new §10 Demo store; RULES §3 rewritten to match.
  - 14 full-page screenshots in `screenshots/` (gitignored), all with `?cf_preview=1` on demo URLs. Event count before and after: 92 (no new events); clean:test dry run found nothing.
- [2026-10-13] Two 375px layout fixes (no design change):
  - Journeys table: the shadcn `table-container` scrolled because the table's min width was 296px in a 292px box (the "Last seen" header was `whitespace-nowrap`). That header may now wrap below `sm` ("Last / seen", still 40px tall); the table fits exactly.
  - `/demo` hero: `.hero .copy` had `left: 6%` and no `right`, so the subtitle ran to the screen edge; added `right: 6%` (desktop unchanged: still 460px max-width at left 6%).
  - Verified with 3 temporary `/__test/` journeys (removed with `clean:test`, count back to 0). Re-took `screenshots/journeys-375.png` and `screenshots/demo-home-375.png`.

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
- **Redesign (2026-10-13):** the user rejected the first dashboard UI as generic. New direction from a reference they like: a dark bento dashboard (rounded app frame, floating pill navbar, mixed-size cards, diagonal hatch-pattern bars, muted sage-teal main color `#9CC5C4`, small orange accent `#F2672E`). DESIGN.md is now the spec. Key rules: honesty (every number from the DB), hatch only on bars/fills, the orange budget, no all-caps, General Sans + Geist Mono for ids only, motion limited to 4 effects. The Phase 3 code still has the old look until Phase 3.5.
- Redesign interpretations (confirm with the user if in doubt):
  - Click events stay orange (the color spec says click = orange) even though orange is otherwise limited to the logo, primary button, live dot and one highlighted bar.
  - The "current" bar is solid sage; the orange highlighted bar is optional, at most one per chart.
  - Nav label "Journeys" → routes move to `/dashboard/journeys`.
  - The live dot = an event in the last 5 min.
  - The click grid covers the last 28 days, in the viewer's time zone via a `cf_tz` cookie (UTC fallback, labelled).
- **Charcoal + glass (2026-10-13, user request mid-Step-A, with a reference image of glossy dark pill buttons):** the background is deep black (`--frame #000`, `--app #0A0A0A`); surfaces are neutral charcoal a step lighter (`--panel #141414`, `--panel-raised #1C1C1C`, `--line #262626`). Glass (`glass` / `glass-shine` utilities, `--glass-*` tokens) is on **controls only** (nav, Live/date pills, buttons, chips, status pills), never on cards. The user chose "controls only". Sage and orange are unchanged. `ui/button.tsx`: default = `glass-shine` on orange, outline = `glass`, and `transition-all` removed.
- - Demo store: one shared stylesheet (`/demo/store.css`) instead of one inline `<style>` per page (4 pages share the header and footer). The hero is static (no auto-carousel) and all products link to one `product.html?id=n`, whose query is stripped by `normalizePageUrl`, so it's one heatmap page. Old `/demo*` click data was recorded on the previous layouts and won't line up with the new ones.
- Turbopack dev cache: after `globals.css` changes the dev server once kept serving the old CSS even after a restart; fixed by stopping it and deleting `.next/dev`.
- **Docs = code (2026-10-13, user request):** DESIGN.md/RULES.md now describe the UI exactly as built. Don't change colors, layout, spacing, fonts, copy or styling unless asked; if code and docs differ, fix the docs or ask. Existing shadcn/sonner motion (skeleton pulse, table-row colour fade, toasts) is documented and kept as-is.
- **Font: Onest, not General Sans.** General Sans' ITF Free Font License v2.0 §02 forbids distributing the files via a "repository" or "publicly accessible servers" (a public GitHub repo). Onest loads through `next/font/google`, so `next build` now needs network access once to fetch it (Phase 0 had avoided that).
- Page preview iframe: `sandbox="allow-scripts"` **without** `allow-same-origin` (opaque origin: the page can't touch our cookies/storage/DOM), `referrerPolicy="no-referrer"`, `pointer-events-none`, `?cf_preview=1`. For a click step it's rendered at the click's own `viewport_w × page_h`, so the dot lands on the clicked element; the card scrolls to it.
- The Live/Idle dot lives in the layout, so it only updates on a full load or refresh (layouts persist across client navigation). No pulse until Phase 5.
- "Open demo store" in the top bar is hidden below `sm` (it doesn't fit next to the logo and Live at 375px); empty states still show it.
- Journeys table below `sm`: id, status, last seen only, with narrow relative time ("4m ago"), so it fits 375px without scrolling.
- shadcn `ui/tooltip.tsx` animations removed and `ui/card.tsx` restyled (`rounded-card`, `bg-panel`, `p-5`, no shadow), because DESIGN §9 allows no other motion.
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
- [Done 2026-10-13, user said yes] Deleted all `/demo*` events (old layouts) incl. sessions `414d002c…` and `ad0e7dc5…`: 92 events, collection now 0.
- The build warns about a stray `D:\pnpm-lock.yaml` outside the repo (harmless; delete it or set `turbopack.root`).
