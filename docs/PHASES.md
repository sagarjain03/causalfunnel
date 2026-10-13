# Phases

Work one phase at a time. A phase is done only when every "Done when" box is true and `npm run build` passes. Update `MEMORY.md` at the end of each task.

---

## Phase 0 — Setup ✅
- [x] Next.js 16 + TypeScript + Tailwind v4 + App Router + `src/`
- [x] shadcn configured (`components.json`, `cn()`), design tokens in `globals.css`
- [x] Installed: mongoose, zod, motion, animejs, lucide-react, clsx, tailwind-merge, cva, tw-animate-css
- [x] `docs/`, `CLAUDE.md`, `.env.example`

---

## Phase 1 — Database & API
**Goal:** all endpoints work, testable with curl before any UI exists.

Tasks:
1. `src/server/db.ts` — cached mongoose connection reading `MONGODB_URI`.
2. `src/server/models/event.ts` — schema + 3 indexes from ARCHITECTURE.md §3.
3. `src/lib/validation.ts` — zod schemas for event / batch / query params.
4. `src/server/http.ts` — `ok()`, `fail()`, CORS headers, `handleError()`.
5. Services: `events.ts` (insert), `sessions.ts` (list aggregate, events by session), `heatmap.ts` (clicks by page, pages list).
6. Route handlers: `events`, `sessions`, `sessions/[sessionId]/events`, `heatmap`, `pages`.

Done when:
- [x] `curl -X POST /api/events` with a valid event → `201`; invalid → `400` with message
- [x] Batch of 3 events inserts 3 docs
- [x] `/api/sessions` returns counts that match the raw documents
- [x] `/api/sessions/<id>/events` is sorted by time; unknown id → `404`
- [x] `/api/heatmap?page_url=...` returns only clicks for that page
- [x] Indexes visible in Atlas

---

## Phase 2 — Tracker & demo site
**Goal:** real data flows from a browser into MongoDB.

Tasks:
1. `public/tracker.js` — IIFE, session handling with 30-min expiry, `page_view`, `click`, SPA navigation, sendBeacon fallback, `data-endpoint`, try/catch everywhere.
2. `public/demo/index.html`, `products.html`, `checkout.html` — simple but realistic store pages (header, product cards, buttons) with different layouts so heatmaps differ. (Redesigned later as the Amazon-style "Northwind" store with a 4th page, `product.html`; see MEMORY.)
3. Link to `/demo` from the dashboard empty states.

Done when:
- [x] Opening `/demo` and clicking creates documents with correct fields
- [x] Reload keeps the same `session_id`; clearing localStorage creates a new one
- [x] Network tab shows events still sent when navigating away (beacon)
- [x] Forcing an API error does not log errors on the demo page

---

## Phase 3 — Dashboard shell & Sessions view
**Goal:** the required Sessions feature, functional before pretty.

Tasks:
1. `npx shadcn@latest add button card table badge skeleton select tabs tooltip separator sonner scroll-area`
2. `dashboard/layout.tsx` — sidebar (Overview, Sessions, Heatmap), header, mobile sheet nav.
3. `dashboard/page.tsx` — 4 stat cards.
4. `dashboard/sessions/page.tsx` — table: short session id, events, clicks, pages, last seen.
5. `dashboard/sessions/[sessionId]/page.tsx` — vertical timeline of events (icon per type, page, relative time, coordinates for clicks, time gap between steps).
6. `loading.tsx`, `error.tsx`, empty state for each route.
7. `src/app/page.tsx` → redirect to `/dashboard`.

Done when:
- [ ] Sessions list matches DB; clicking a row opens its journey in order
- [ ] Loading, empty, error states all visible and correct
- [ ] Works at 375px width

---

## Phase 3.5 — Redesign
**Goal:** replace the generic first UI with the "Bento on dark" design (DESIGN.md). Every number stays real (honesty rule).

Tasks:
1. **Fonts:** Onest (300, 400, 500, 600) via `next/font/google`, and keep Geist Mono for session ids only. (General Sans was dropped: its license forbids a public repo.)
2. **Tokens:** rewrite `globals.css` with the DESIGN.md §2 palette, the shadcn aliases, the heat ramp, and the `.hatch` utility.
3. **Frame + top bar:** the rounded app frame, logo, floating pill navbar (Overview / Journeys / Heatmap) with the sliding active pill (motion `layoutId`), live dot, "Open demo store" button, and greeting row (client-computed time of day and date). Remove the sidebar and the mobile sheet nav.
4. **New services** (ARCHITECTURE.md §4.1): `getWeeklyActivity`, `getStatsWithChange`, `getClickGrid`, `getLatestJourney`, `getTopPages`, and `reached_checkout` in `listSessions`. Also the `cf_tz` time-zone cookie.
5. **Overview bento:** activity, tiles, top pages, heatmap preview + latest journey, click heat grid, recent journeys, plus the mobile order and the empty-database card.
6. **Restyle Journeys:** move `/dashboard/sessions` → `/dashboard/journeys` (list) and `/dashboard/journeys/[sessionId]` (timeline left, page preview right). Keep the loading, empty, error and not-found states.

Done when:
- [ ] Onest renders (no fallback font visible after load, no layout shift)
- [ ] `grep -rn "uppercase" src/` finds nothing outside `components/ui`; no hex in components
- [ ] Every Overview number matches the database (cross-check against the API, `clean:test` dry run counts, or Atlas)
- [ ] "New this week" shows when the previous 7 days are empty
- [ ] Orange appears only in the places DESIGN.md §2 allows
- [ ] At 375px: single column, in the DESIGN.md §6 order, no page-level horizontal scroll
- [ ] `npm run build` passes with no Suspense / blocking-route errors

---

## Phase 4 — Heatmap view
**Goal:** the required Heatmap feature, accurate across screen sizes.

Built in the Phase 3.5 style (DESIGN.md §7): a large preview card with a floating pill toolbar.

Tasks:
1. Page selector (shadcn `Select`, styled as a pill) fed by `/api/pages`, selection stored in the `?page=` search param.
2. `heatmap-canvas.tsx`: a scaled iframe preview of the page (`?cf_preview=1`) + absolutely positioned dots using normalized coordinates (ARCHITECTURE.md §5).
3. Dots / Grid toggle; Desktop / Mobile filter (in the floating toolbar).
4. Legend with the heat ramp + real click counts.
5. **Replay scrubber** at the bottom of the card: play/pause + a range slider over the click time span. Only clicks up to the scrubber time are shown; on play, dots appear in timestamp order (anime.js).
6. Enable the Heatmap item in the pill navbar.

Done when:
- [ ] A click on a known button appears on that button in the heatmap
- [ ] Clicks from a 375px viewport are not mixed with desktop by default
- [ ] Empty page → empty state, not a blank box
- [ ] Scrubbing to the start shows no dots; scrubbing to the end shows all of them

---

## Phase 5 — UI polish & animation
**Goal:** the motion in DESIGN.md §9, and nothing more, without hurting readability or performance.

Tasks:
1. anime.js: big numbers count up once on load; bars grow from 0 once with a 40ms stagger.
2. Verify the nav pill slide (Phase 3.5) and the heatmap replay (Phase 4) match DESIGN.md §9 timings.
3. Live dot pulse only while "Live"; optional auto-refresh every 10s on the Journeys page.
4. Lighthouse check: performance ≥ 90 on the dashboard.

Done when:
- [ ] Reduced-motion users see no movement
- [ ] No layout shift on load (CLS ≈ 0)
- [ ] No hex colors in components (grep check)

---

## Phase 6 — Seed, README, deploy
Tasks:
1. `scripts/seed.ts` — ~40 sessions across demo pages with realistic click clusters. `npm run seed`.
2. README: what it is, screenshots/GIF, setup steps, tech stack, API table, **assumptions & trade-offs** (localStorage sessions, single collection + aggregation, no auth/rate limit, coordinate normalization, Next.js as Node backend).
3. Deploy to Vercel; set `MONGODB_URI`; allow Vercel IPs (or 0.0.0.0/0) in Atlas.
4. Test the deployed tracker from the deployed `/demo`.

Done when:
- [ ] Fresh clone → running with data in under 5 minutes using README only
- [ ] Live URL works; GitHub repo is public
