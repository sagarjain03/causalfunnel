# PRD — CausalFunnel User Analytics

## 1. What we are building

A small full-stack analytics product with three parts:

1. **Tracker** — a plain JavaScript file any website can include with one `<script>` tag. It records `page_view` and `click` events and sends them to our API.
2. **API + database** — Next.js Route Handlers (Node.js runtime) that receive events, store them in MongoDB, and serve aggregated data.
3. **Dashboard** — a Next.js UI that shows every session's journey and a click heatmap per page.

This is a hiring assignment for the Full Stack Engineer role at CausalFunnel. Reviewers judge three things: does it work, is the code clean, and does the README show engineering judgment (trade-offs). A beautiful UI is a bonus, not a substitute for those.

## 2. Target users

| User | Who | What they need |
|---|---|---|
| **Store owner / marketer** (primary) | Runs an e-commerce site, non-technical | "What did visitors do? Where do they click? Which buttons are ignored?" |
| **Developer integrating the tracker** | Adds our script to their site | One script tag, no build step, never breaks their site |
| **Hiring reviewer** (real audience) | CausalFunnel engineer | Clone, run in under 5 minutes, see data immediately, read clear trade-offs |

## 3. Features

### 3.1 Tracker (must have)
- Generates a `session_id` (UUID) and stores it in `localStorage`; reuses it on later visits.
- Session expires after **30 minutes of inactivity** → new `session_id` (documented trade-off).
- Sends `page_view` on load, including SPA navigations (`pushState` / `popstate`).
- Sends `click` with `x`, `y` (page coordinates), plus `viewport_w`, `viewport_h`, `page_h` so the heatmap can normalize across screen sizes.
- Every event: `session_id`, `event_type`, `page_url`, `timestamp`.
- Uses `navigator.sendBeacon` when available, falls back to `fetch(..., { keepalive: true })`.
- Fails silently. A tracker error must never throw on the host page.
- Configurable endpoint via `data-endpoint` attribute on the script tag.

### 3.2 Demo site (must have)
- 2–3 static HTML pages (e.g. Home, Products, Checkout) in `public/demo/` with the tracker included, so reviewers can generate data instantly.

### 3.3 API (must have)
- `POST /api/events` — receive one event or a batch, validate, store.
- `GET /api/sessions` — sessions with event counts, first/last seen, pages visited.
- `GET /api/sessions/[sessionId]/events` — all events of a session ordered by time.
- `GET /api/heatmap?page_url=...` — click points for a page.
- `GET /api/pages` — distinct tracked page URLs (feeds the heatmap dropdown).

### 3.4 Dashboard (must have)
- **Overview** — stat cards: total sessions, total events, total clicks, pages tracked.
- **Sessions view** — table of sessions with total events; click a row → ordered event timeline (the user journey).
- **Heatmap view** — select a page URL → click positions drawn as dots / density over a live preview of the page.

### 3.5 Nice to have (only after must-haves work)
- Seed script that generates realistic fake sessions.
- Auto-refresh / "live" indicator on the dashboard.
- Filter heatmap by viewport type (mobile / desktop).
- Toggle heatmap between dots and grid density.

## 4. Out of scope
- Authentication / multi-tenant accounts.
- Scroll depth, rage clicks, session replay.
- Rate limiting and bot filtering (mentioned as trade-offs in README).

## 5. Success criteria
- Fresh clone → `npm install` → add `MONGODB_URI` → `npm run dev` → click around `/demo` → data visible in dashboard. Under 5 minutes.
- All 4 required APIs return correct data and handle bad input with 4xx, not 500.
- Heatmap dots land in the right place on both mobile and desktop widths.
- README has setup, tech stack, and honest trade-offs.
- Deployed on Vercel + MongoDB Atlas.
