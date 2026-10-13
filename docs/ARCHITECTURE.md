# Architecture

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | One repo, one deploy. Route Handlers are our Node.js backend. |
| Language | **TypeScript** (strict) | Shared types between API and UI. |
| UI | **React 19**, **Tailwind CSS v4**, **shadcn/ui** | Accessible primitives we own as source code. |
| Fancy UI | **Aceternity UI** (copy-paste components) | Hero/background effects on non-data surfaces only. |
| Animation | **motion** (Framer Motion) for component/layout transitions, **anime.js v4** only for heatmap dot reveal & number counters | See RULES.md §3 for the boundary. |
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
type SessionSummary = { session_id; event_count; click_count; page_view_count; first_seen; last_seen; pages: string[] }
type ClickPoint = { x; y; viewport_w; page_h }
```

Status codes: `400` validation, `404` unknown session, `405` wrong method, `500` unexpected (logged, generic message to client).

## 5. Heatmap rendering

- Dots are positioned as **percentages**: `left = x / viewport_w * 100%`, `top = y` in px scaled by `containerWidth / viewport_w`.
- Behind the dots, an `<iframe>` of the page (demo pages are same-origin) at a fixed 1280px width, scaled down with CSS `transform: scale()`. Dots overlay the same scaled box.
- Two modes: **Dots** (each click) and **Grid** (bucket into 20×N cells, colored by `--heat-1…5`).
- Clicks from viewports < 768px vs ≥ 768px can be filtered, because layouts differ.

## 6. Folder structure

```
causalfunnel/
├── CLAUDE.md                     # tells Claude to read docs/ first
├── docs/                         # PRD, ARCHITECTURE, RULES, PHASES, DESIGN, MEMORY
├── public/
│   ├── tracker.js                # the embeddable script (plain JS, no build)
│   └── demo/                     # static demo site that includes tracker.js
│       ├── index.html
│       ├── products.html
│       └── checkout.html
├── scripts/
│   └── seed.ts                   # fake sessions for screenshots / demo
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # redirects to /dashboard (or landing)
│   │   ├── globals.css           # design tokens (see DESIGN.md)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # sidebar + header shell
│   │   │   ├── page.tsx          # overview stats
│   │   │   ├── sessions/
│   │   │   │   ├── page.tsx      # sessions table
│   │   │   │   └── [sessionId]/page.tsx   # journey timeline
│   │   │   └── heatmap/page.tsx
│   │   └── api/
│   │       ├── events/route.ts
│   │       ├── sessions/route.ts
│   │       ├── sessions/[sessionId]/events/route.ts
│   │       ├── heatmap/route.ts
│   │       └── pages/route.ts
│   ├── components/
│   │   ├── ui/                   # shadcn (generated, do not hand-edit much)
│   │   ├── aceternity/           # copied Aceternity components
│   │   ├── dashboard/            # sidebar, stat-card, page-header
│   │   ├── sessions/             # sessions-table, event-timeline
│   │   └── heatmap/              # page-select, heatmap-canvas, heat-legend
│   ├── server/                   # backend logic, no React here
│   │   ├── db.ts                 # cached mongoose connection
│   │   ├── models/event.ts       # schema + indexes
│   │   ├── services/             # events.ts, sessions.ts, heatmap.ts
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
