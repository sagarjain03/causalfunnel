# Architecture

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | One repo, one deploy. Route Handlers are our Node.js backend. |
| Language | **TypeScript** (strict) | Shared types between API and UI. |
| UI | **React 19**, **Tailwind CSS v4**, **shadcn/ui** | Accessible primitives we own as source code. |
| Fonts | **Onest** (`next/font/google`, weights 300–600) + **Geist Mono** for session ids | See DESIGN.md §4. General Sans was dropped: its ITF Free Font License §02 forbids distributing the font files through a public repository. |
| Animation | **motion** for the navbar pill slide only, **anime.js v4** for the heatmap replay | See DESIGN.md §9 and RULES.md §3. |
| Charts | **Recharts 3** via shadcn `ui/chart.tsx` | Overview sparklines and the activity chart only; other bars and grids are plain HTML + the `hatch` utility. |
| Icons | **lucide-react** | Default for shadcn. |
| Validation | **zod** v4 | Validate every API input at the boundary. |
| Database | **MongoDB Atlas** + **mongoose** | Required by assignment. |
| Hosting | **Vercel** (app) + **MongoDB Atlas** free tier (DB) | Zero-config for Next.js. |

> **Trade-off to state in README:** the assignment says "Node.js backend". Next.js Route Handlers run on the Node.js runtime, so this satisfies it with one deploy instead of two. If a reviewer wants a standalone Express server, the `src/server/` layer is framework-agnostic and can be lifted out.

## 2. App flow

```
┌────────────────────────┐      POST /api/events       ┌──────────────────────────┐
│ Any website / demo page│  ─────────────────────────▶ │ Route Handler (Node)     │
│ <script src=tracker.js>│   sendBeacon / fetch        │ zod validate → service   │
└────────────────────────┘                             └────────────┬─────────────┘
                                                                    │ insertMany
                                                                    ▼
┌────────────────────────┐   GET /api/sessions …       ┌──────────────────────────┐
│ Dashboard (React)      │ ◀────────────────────────── │ MongoDB `events`         │
│ Sessions / Heatmap     │   aggregate & find          │ (single collection)      │
└────────────────────────┘                             └──────────────────────────┘
```

### Step by step
1. Page loads → `tracker.js` reads/creates `session_id` in `localStorage` (`cf_session = { id, lastSeen }`). If `lastSeen` is older than 30 min, a new id is created.
2. Tracker sends `page_view`. On every click it sends `click` with coordinates and viewport/page size.
3. `POST /api/events` validates with zod, normalizes `page_url` (origin + pathname, no query/hash), adds `received_at`, inserts.
4. Dashboard pages are **Server Components** that call the service layer directly (no HTTP round-trip to our own API). Interactive parts (row selection, page dropdown, heatmap canvas) are Client Components that call the public API.

## 3. Data model

One collection: `events`.

```ts
{
  _id: ObjectId,
  session_id: string,          // UUID v4
  event_type: "page_view" | "click",
  page_url: string,            // normalized: "https://site.com/products"
  timestamp: Date,             // client time (when it happened)
  received_at: Date,           // server time (when we got it)
  // click only:
  x?: number,                  // e.pageX (px from document left)
  y?: number,                  // e.pageY (px from document top)
  viewport_w?: number,         // window.innerWidth
  viewport_h?: number,         // window.innerHeight
  page_h?: number,             // document.documentElement.scrollHeight
  layout_w?: number,           // document.documentElement.clientWidth: viewport minus scrollbar (added in Phase 4; older clicks lack it)
  target?: string,             // clicked element (tracker v3+): form fields "Kind: label/aria-label/placeholder" (v4+), else tag + #id/.class + ≤ 60 chars of visible text; never form values
  source?: "seed",             // only on events written by scripts/seed.ts; not accepted by the API. Sparse index { source: 1 }
  // optional context:
  referrer?: string,
  user_agent?: string
}
```

### Indexes
| Index | Serves |
|---|---|
| `{ session_id: 1, timestamp: 1 }` | Session journey (filter + sort in one index) |
| `{ page_url: 1, event_type: 1 }` | Heatmap query, pages list |
| `{ timestamp: -1 }` | Sessions list sorted by recency |

**Why no `sessions` collection?** Session stats are derived with an aggregation (`$group` by `session_id`). Simpler writes, no consistency bugs. Trade-off: slower at millions of events; fix would be a pre-aggregated `sessions` collection updated on insert.

## 4. API contract

All responses use one envelope:
```ts
{ data: T }                                  // success
{ error: { code: string, message: string } } // failure
```

| Method | Route | Input | Output |
|---|---|---|---|
| `POST` | `/api/events` | Event or `Event[]` (max 50) | `201 { data: { inserted: n } }` |
| `OPTIONS` | `/api/events` | — | CORS preflight `204` |
| `GET` | `/api/sessions?limit=50&cursor=` | — | `{ data: { sessions: SessionSummary[], nextCursor } }` |
| `GET` | `/api/sessions/[sessionId]/events` | — | `{ data: Event[] }` sorted by `timestamp` asc |
| `GET` | `/api/heatmap?page_url=` | `page_url` required | `{ data: { page_url, clicks: ClickPoint[] } }` |
| `GET` | `/api/pages` | — | `{ data: { page_url, clicks, views }[] }` |

```ts
type SessionSummary = { session_id; event_count; click_count; page_view_count; first_seen; last_seen; pages: string[]; reached_checkout: boolean; path: string[] }
// path: page_url of each page_view in time order (pipeline starts with $sort { timestamp: 1 }, then $push in $group), consecutive duplicates collapsed in the service
type ClickPoint = { x; y; viewport_w; page_h }
```

Status codes: `400` validation, `404` unknown session, `405` wrong method, `500` unexpected (logged, generic message to client).

### 4.1 Overview services (Built)

The Overview (DESIGN.md §6) is rendered by Server Components that call these functions directly; there are no new public API routes. Counting and grouping happen **only in MongoDB aggregations**; JavaScript fills days with no data with 0 and shapes results.

The range functions live in `src/server/services/overview.ts` and take `{ days: 7 | 14 | 28, tz, now? }`.

**Periods** (`periodBounds()`):
- `curStart` = local midnight (in `tz`, DST-safe) of the day `days − 1` days before today; the current period is `[curStart, now)`.
- The previous period is `[curStart − days·24h, now − days·24h)`: the same elapsed time, cut at the same time of day.
- A journey (session) belongs to the period of its **first** event. Events are read from `prevStart − 1h` (index on `timestamp`) so sessions are seen whole.
- `keys` = the N day keys (`YYYY-MM-DD` in `tz`) of the current period, for daily series.

| Function | Returns | How |
|---|---|---|
| `getOverviewKpis(q)` | `{ current, previous, daily[] }`; totals = journeys, conversions, bounces, durationMs, clicks, events | `$match` window → `$facet`: (a) `$group` per session (first, last, page views, checkout `$regexMatch`) → period via `$switch` → totals per period and per first-event day (`$dateToString` with `timezone`); (b) events and clicks per period and per day. |
| `getFunnel(q)` | `FunnelStep[]` (`key, label, journeys, pageUrl`) for `FUNNEL_STEPS` | Per-session `$max` of each step's `$regexMatch`, current period only, then sums. `pageUrl` = the most common `page_url` per step (for the heatmap link). |
| `getDeviceSplit(q)` | `{ desktop, mobile: { journeys, conversions }, unknown }` | Per-session `$max: viewport_w` (only clicks carry it); ≥ 768 desktop, < 768 mobile, null unknown. |
| `getTopTargets(q, limit = 6)` | `{ rows: { target, pageUrl, clicks }[], withoutTarget }` | Clicks in the current period, `$facet`: `$group` by `{ page_url, target }` sorted + limited; count of clicks without `target`. |
| `getClickGrid(q)` | `{ cells: { day: 1..7, bucket: 0..11, clicks }[], min, max, total }` | Clicks in the current period, `$group` by `$isoDayOfWeek` and `$floor($hour / 2)`, both with `timezone`. |
| `getJourneyStats()` | `{ journeys, reachedCheckout }` (`sessions.ts`, Journeys sentence) | Two `$group` stages. |
| `getLastEventAt()` | Newest event time (`stats.ts`; Live pill, Overview sentence) | `findOne().sort({ timestamp: -1 })`. |

"Recent journeys" reuses `listSessions({ limit: 6 })` (newest overall, not range-bound).

**Request wiring** (`src/components/overview/`):
- `overview-params.ts`: `resolveOverviewParams` (React `cache`) awaits `connection()`, parses `?range`, reads and validates `cf_tz`, and fixes one request `now` so every card uses identical bounds.
- `overview-data.ts`: `cache()`d loaders with primitive args, so cards that need the same data (KPI strip, Activity, title sentence) share one query per request.
- The page stays synchronous and passes the `searchParams` promise into each card inside `<Suspense>` + `CardErrorBoundary` (`catchError`).

**Time zone (`cf_tz`).**
- `components/dashboard/timezone-sync.tsx` (client, in the dashboard layout) writes the browser's IANA zone to a `cf_tz` cookie (path `/`, 1 year, `SameSite=Lax`) when it's missing or different, then calls `router.refresh()`.
- The server validates it with `new Intl.DateTimeFormat("en", { timeZone })` and falls back to `"UTC"`; the title sentence says so while falling back.

## 5. Heatmap rendering (Built, Phase 4)

**One exact width at a time.** A responsive page lays out differently at every window width (1280px vs 1536px, not just desktop vs mobile), so a click's `(x, y)` (`pageX`/`pageY`) only lands on the right element when the page is rendered at the width it was recorded at. Mixing widths, or bucketing them, puts dots on the wrong elements.

**Data** (`src/server/services/heatmap.ts`):
- `getClickWidths(page)` groups a page's clicks by exact `viewport_w`.
- For each width it returns the click count, `page_h` (the tallest) and `render_w`: the most common `layout_w` in the group, else `viewport_w`.
- `getHeatmap(page, viewport_w)` returns only that width's clicks, oldest first, with timestamps.

**Rendering** (`ScaledPageFrame`, shared with the journey preview):
- An `<iframe>` of `page_url?cf_preview=1` at exactly `render_w × page_h` CSS pixels, so the page lays out as the visitor saw it and needs no inner scrollbar.
- It's scaled to the card width with `transform: scale(containerWidth / render_w)`.
- Dots and grid are drawn in the same box at `(x, y) × scale`.

**Why `layout_w`:**
- `viewport_w` is `innerWidth`, which **includes** the visitor's vertical scrollbar (about 15px on Windows). The page actually laid out at `clientWidth`.
- The tracker sends `layout_w = document.documentElement.clientWidth` from Phase 4 on. Clicks recorded before that fall back to `viewport_w`, and can be off by up to the scrollbar width (about 7px for centred content).

**Modes:**
- **Dots:** every click.
- **Grid:** 24×24 page-pixel cells colored by count / maxCount through `--heat-1…4`.
- **Replay:** filters both modes by time (anime.js).

**Remaining limits** (README trade-offs):
- The viewer's system fonts can wrap text differently from the visitor's.
- Dynamic content that differs between visit and preview isn't reproduced.

## 6. Folder structure

```
causalfunnel/
├── CLAUDE.md                     # tells Claude to read docs/ first
├── docs/                         # PRD, ARCHITECTURE, RULES, PHASES, DESIGN, MEMORY
├── public/
│   ├── tracker.js                # the embeddable script (plain JS, no build)
│   └── demo/                     # static "Northwind" store (Amazon-style layout, own brand) with tracker.js
│       ├── store.css             # shared styles for the 4 pages
│       ├── img/                  # free-license photos (Unsplash/Pexels), see MEMORY.md
│       ├── index.html            # home: header + search, hero, deal cards, best sellers
│       ├── products.html         # listing with filters
│       ├── product.html          # product detail + buy box (one URL for all products)
│       └── checkout.html
├── scripts/
│   └── seed.ts                   # fake sessions for screenshots / demo
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # redirects to /dashboard (or landing)
│   │   ├── globals.css           # design tokens + .hatch utility (see DESIGN.md)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # rounded frame + top bar (logo, pill navbar, live dot, demo button)
│   │   │   ├── page.tsx          # overview: range pill + 7 cards, each with Suspense + error boundary
│   │   │   ├── journeys/
│   │   │   │   ├── page.tsx      # journeys (sessions) table
│   │   │   │   └── [sessionId]/page.tsx   # timeline + page preview
│   │   │   └── heatmap/page.tsx
│   │   └── api/
│   │       ├── events/route.ts
│   │       ├── sessions/route.ts
│   │       ├── sessions/[sessionId]/events/route.ts
│   │       ├── heatmap/route.ts
│   │       └── pages/route.ts
│   ├── components/
│   │   ├── ui/                   # shadcn (generated, do not hand-edit much)
│   │   ├── dashboard/            # frame, pill-nav, live status, page title, timezone-sync
│   │   ├── overview/             # Overview cards, params (range + cf_tz), cached loaders, Recharts charts
│   │   ├── sessions/             # sessions-table, event-timeline, page preview
│   │   └── heatmap/              # page-select, heatmap-canvas, heat-legend
│   ├── server/                   # backend logic, no React here
│   │   ├── db.ts                 # cached mongoose connection
│   │   ├── models/event.ts       # schema + indexes
│   │   ├── services/             # events.ts, sessions.ts, heatmap.ts, stats.ts, overview.ts (see §4.1)
│   │   └── http.ts               # ok(), fail(), cors helpers
│   ├── lib/
│   │   ├── utils.ts              # cn()
│   │   ├── validation.ts         # zod schemas (shared)
│   │   └── format.ts             # dates, durations, url shortening
│   └── types/index.ts            # shared TS types
├── .env.example
└── README.md
```

**Layering rule:** `app/api/*/route.ts` → `server/services/*` → `server/models/*`. Route files only parse input, call one service, and shape the response. Pages may import `server/services` directly (Server Components only).
