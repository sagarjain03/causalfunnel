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
2. `public/demo/index.html`, `products.html`, `checkout.html` — simple but realistic store pages (header, product cards, buttons) with different layouts so heatmaps differ.
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

## Phase 4 — Heatmap view
**Goal:** the required Heatmap feature, accurate across screen sizes.

Tasks:
1. Page selector (shadcn `Select`) fed by `/api/pages`, selection stored in `?page=` search param.
2. `heatmap-canvas.tsx` — scaled iframe preview of the page + absolutely positioned dots using normalized coordinates (ARCHITECTURE.md §5).
3. Dots / Grid toggle; Desktop / Mobile filter.
4. Legend with heat ramp + click count.

Done when:
- [ ] A click on a known button appears on that button in the heatmap
- [ ] Clicks from a 375px viewport are not mixed with desktop by default
- [ ] Empty page → empty state, not a blank box

---

## Phase 5 — UI polish & animation
**Goal:** "awesome" UI without hurting readability or performance.

Tasks:
1. Aceternity: one background effect (e.g. Spotlight or Background Beams) on the overview header; one for empty states. Nothing behind data.
2. motion: page transitions, table row stagger on first load, timeline items slide in, hover lift on cards.
3. anime.js: heatmap dots stagger in by timestamp; stat card numbers count up.
4. "Live" pulse indicator + auto-refresh every 10s on sessions page (optional).
5. Lighthouse check: performance ≥ 90 on dashboard.

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
