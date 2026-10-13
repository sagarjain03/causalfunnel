# Design

This file describes the UI **as it is in the code**. Sections are marked **Built** (in the code now) or **Planned** (specified, not built yet).
If the code and this file disagree, the code was changed without updating the docs: fix the docs or ask, don't "fix" the design back.

There are two separate designs:
- **Dashboard** (`src/app/dashboard`): "Bento on dark", §1–§9.
- **Demo store** (`public/demo`): "Northwind", a light, Amazon-style marketplace with its own brand, §10. The dashboard rules don't apply to it.

## 1. Direction: "Bento on dark" (Built)

A deep-black bento dashboard with charcoal surfaces and glossy glass controls: the app sits in a rounded frame, data lives in mixed-size cards, and one quiet main color (sage-teal) carries the data. A small orange accent marks the few things that need attention. The signature texture is a **diagonal hatch** on bars and fills (Planned: no bars are built yet).

References from the user:
- **Layout:** a dark logistics dashboard (floating pill navbar, mixed-size cards, hatched bars, sage + orange).
- **Controls:** glossy dark "glass" pill buttons.

We borrow structure and texture, not content.

**Honesty rule:** every number on screen comes from the database. There are no placeholder, decorative or "example" numbers anywhere, including empty states, legends and skeletons.

Dark is the only theme (`<html class="dark">`).

## 2. Colors (Built)

All tokens live in `src/app/globals.css` as CSS variables. Components use Tailwind token classes (`bg-panel`, `text-muted-foreground`, `text-sage`, …), never hex.

### Surfaces & text
Neutral charcoal (no blue tint). The background is deep black; every surface is a step lighter than the background.

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| `--frame` | `#000000` | `bg-frame` | `body`: the window around the app frame |
| `--app` | `#0A0A0A` | `bg-app` | The app canvas inside the frame; page-preview background |
| `--panel` | `#141414` | `bg-panel` / `bg-card` | Cards; the icon square inside raised tiles |
| `--panel-raised` | `#1C1C1C` | `bg-panel-raised` / `bg-muted` | Inner tiles, icon squares on cards, hover and selected rows, gap chips, skeletons |
| `--line` | `#262626` | `border-line` / `border-border` | All borders and dividers |
| `--text` | `#F2F2F2` | `text-foreground` | Primary text, big numbers |
| `--text-muted` | `#8F8F8F` | `text-muted-foreground` | Labels, secondary text, the Idle dot |

### Data & accent
| Token | Hex | Use |
|---|---|---|
| `--sage` | `#9CC5C4` | **Main data color**: page-view dots, "Reached checkout" text, id link hover, focus ring (`--ring`). Planned: bars, current bar |
| `--sage-dim` | `#5E7F7E` | The timeline's connecting line. Planned: secondary data |
| `--orange` | `#F2672E` | **Only** where the orange budget allows (below) |
| `--up` | `#4CC38A` | Planned: positive change |
| `--down` | `#E5484D` | Error icon (`--destructive`). Planned: negative change |

### Event colors
| Event | Color | Where |
|---|---|---|
| Click | `--orange` (`--event-click`) | Timeline dot, summary tile dot, preview click dot |
| Page view | `--sage` (`--event-pageview`) | Timeline dot, summary tile dot |

Clicks are the one data category drawn in orange, because a click is the event the product is about. This is the only exception to the orange budget, and it never applies to bars.

### Heat ramp (Built: heatmap Grid mode and legend), cold → hot
`--heat-0 transparent` → `--heat-1 #5E7F7E` → `--heat-2 #9CC5C4` → `--heat-3 #E8D58A` → `--heat-4 #F2672E`

A cell's color is picked by `count / maxCount`. Zero is transparent, so only the cell's `--line` outline shows.

### Glass tokens (Built)
- **Body and edges:** `--glass-top` `#262626` at 70% and `--glass-bottom` `#111111` at 70% (translucent), `--glass-edge` white 7%, `--glass-highlight` white 12%.
- **Shadows:** `--glass-inner-shadow` black 60%, `--glass-drop` black 80%, `--glass-drop-soft` black 45%.
- **Sheen and blur:** `--glass-sheen` white 6%, `--glass-blur` 14px.
- See §5 "Glass controls".

### App glow tokens (Built)
`--glow-sage` = `--sage` at 5%, `--glow-orange` = `--orange` at 5%. They're used only by the `app-glow` utility on the app frame (§5); this is the only decorative background.

### Orange budget
Orange appears only on:
1. **The logo mark.**
2. **The primary button**: "Open demo store" in the top bar and in empty and not-found states. The button text is `--app` (dark), because white on orange fails contrast.
3. **The Live dot** (Idle is grey).
4. **Click events**: timeline dots, the summary tile's Clicks dot, the preview's click dot.
5. Planned: the single highlighted bar, at most one per chart.

Anything else orange is a bug.

### shadcn mapping
shadcn components read their own variable names. These are aliases, so the components follow the palette:

| shadcn variable | → token |
|---|---|
| `--background` | `--app` |
| `--foreground` | `--text` |
| `--card`, `--popover` | `--panel` |
| `--muted`, `--secondary`, `--accent`, `--input` | `--panel-raised` |
| `--muted-foreground` | `--text-muted` |
| `--border` | `--line` |
| `--primary` | `--orange` (primary button only) |
| `--primary-foreground` | `--app` |
| `--ring` | `--sage` |
| `--destructive` | `--down` |

Because `--primary` is orange, components whose *default* variant is primary (Badge, Tabs, etc.) must be used with a non-primary variant, or they spend the orange budget.

### Contrast (checked)
- `--text-muted` on `--panel`: 5.79:1 (≈5.4:1 on `--panel-raised`).
- `--sage` on `--panel`: ≈9.9:1.
- `--orange` on `--panel`: ≈6:1.
- `--app` text on `--orange`: 6.37:1.
- White on orange is 3.11:1, which fails for body text, so it isn't used.

## 3. Texture: diagonal hatch (utility Built, not used yet)

The `hatch` utility exists in `globals.css`. Planned use: **bars and progress fills only**, never as decoration.

```css
@utility hatch {
  background-image: repeating-linear-gradient(
    45deg,
    color-mix(in srgb, var(--sage) 35%, transparent) 0 1px,
    transparent 1px 6px
  );
}
```

Planned bar styles:
- **Default bar:** hatch on a transparent background, with a 1px `--line` outline and the top corners rounded at 6px.
- **Current bar:** solid `--sage`.
- **Highlighted bar:** solid `--orange`, at most one per chart.
- **Horizontal bars:** the same hatch, filling from the left.

## 4. Typography (Built)

| Role | Font | Spec |
|---|---|---|
| Everything | **Onest**, via `next/font/google` (self-hosted by Next at build time) | Weights 300, 400, 500, 600. General Sans was dropped: its ITF Free Font License §02 forbids distributing the font files through a public repository. |
| Session ids only | **Geist Mono** (`geist` package) | Short ids in the table (`text-xs`), the full id in the journey summary and in tooltips. Nothing else is mono. |

| Use | Spec in code |
|---|---|
| Page title | `h1`, **24px, 500 weight** (`text-2xl font-medium`), tight tracking |
| Page summary sentence | 14px, `--text-muted`, one sentence of live numbers under the title |
| Big numbers, Overview tiles | 300 weight, 40px (48px from `md`), `tabular-nums`, `leading-none`. The label sits **above** the number, next to the icon square (`text-sm`, `--text-muted`). |
| Big numbers, journey summary tiles | 300 weight, 32px, `tabular-nums`, `leading-none` |
| Card title | 500 weight, 18px (`text-lg font-medium`) |
| Logo text | 500 weight, 18px |
| Body | 400, 14px |
| Small labels, table footer, times | 12px, `--text-muted` |
| Numbers in tables, times, coordinates | Onest with `tabular-nums` (not mono) |

Rules:
- **No all-caps labels anywhere.** No `uppercase` and no letter-spaced eyebrow labels.
- **Sentence case** everywhere.
- **URLs:** show the path only; the full URL goes in a `title` tooltip.
- **Session ids:** the first 8 characters in Geist Mono, with the full id in a tooltip.

## 5. Layout (Built)

### Frame
- `body` is `--frame` (pure black).
- The app is one rounded container: `--app` background, **28px radius** (`rounded-frame`), **16px margin** from the window (`m-4`), 1px `--line` border, min-height = viewport − 32px.
- Inside the frame: padding of 12px (24px from `md`), with a 24px gap between the top bar and `main`. Inside `main`, sections are 16px apart.
- **App glow** (`app-glow` utility on the frame) gives the glass controls something to refract. It's two very faint radial gradients over `--app`, fixed to the viewport (`background-attachment: fixed`):
  - `--glow-sage`, a 48×32rem ellipse at the top-left
  - `--glow-orange`, the same at the top-right
  - Nothing else changes color.

### Radius tokens
`rounded-icon` 10px · `rounded-tile` 16px · `rounded-card` 22px · `rounded-frame` 28px. Pills and buttons are `rounded-full`.

### Top bar
A grid `[logo] [nav] [status + button]` from `md`. Below `md`, the first row is logo + status and the nav takes a full-width second row.
- **Logo:** a 28px orange rounded square with a 10px `--app` dot inside, plus "CausalFunnel" (18px/500). Links to `/dashboard`.
- **Pill navbar** (centered): a `glass` pill, 4px padding, with Overview / Journeys / Heatmap (14px, 6×16px item padding).
  - **Active item:** a `bg-panel-raised` + `glass-shine` pill behind it that **slides** between items (motion `layoutId="nav-pill"`, spring 0.25s, bounce 0.15). Text is `--text`.
  - **Others:** `--text-muted`, turning `--text` on hover.
  - **Heatmap:** a normal link to `/dashboard/heatmap` (enabled in Phase 4).
  - **Below `md`:** full width, items split it equally.
  - **Server fallback** (inside `<Suspense>`, because `usePathname` suspends on `[sessionId]`): the same bar with no active pill.
- **Status** (right side):
  - **Live/Idle pill:** `glass`, 36px tall. Shows an 8px dot and a label: orange "Live" when the newest event is under 5 minutes old (`getLastEventAt()`), otherwise a grey dot with muted "Idle". Hovering shows the newest event's ISO time. **No pulse** (Planned, Phase 5). While loading: a 36×80px skeleton pill. It updates only on full page loads or refreshes.
  - **"Open demo store":** an orange primary pill button (36px tall, `glass-shine`), a plain `<a href="/demo">`. **Hidden below `sm`** (640px).
- No sidebar, no hamburger, no sheet.

### Page title (Built)
There's no greeting and no date pill. Each page starts with `PageTitle` (`components/dashboard/page-title.tsx`): an `h1` (24px/500) and **one muted sentence of real data** under it. The sentence streams behind `<Suspense>`, with a 20×256px skeleton line while it loads.
- **Overview:** `{n} journeys and {m} events. Last activity {relative time}.`
  - `n` and `m` come from `getOverviewStats()`; the last activity from `getLastEventAt()`.
  - It says "No activity yet." when there are no events.
- **Journeys:** `{n} journeys, {k} reached checkout.`, from `getJourneyStats()`.
- **Heatmap:** `{n} clicks on {page label} at {width}px.`, for the selected page and exact width (§7).
- **Journey detail:** no page title; it keeps its "← All journeys" link and the summary card.
- Singular and plural come from `plural()` ("1 journey", "2 journeys").

### Cards
- shadcn `Card`, restyled in `ui/card.tsx`: `--panel` background, 1px `--line` border, **22px radius**, **20px padding**, 16px gap between children, **no shadow**.
- **Card title:** 18px/500, with an optional 14px muted description below it.
- **Inner tiles:** `--panel-raised`, 16px radius, 16px padding.
- **Icon squares:**
  - on cards and in states: 36px, 10px radius, `--panel-raised`
  - inside raised tiles: `--panel`
  - always a 16px lucide icon in `--text` (`--down` for the error icon)
- **Hover (clickable rows only):** the background changes to `--panel-raised`. No lift, shadow or scale.

### Glass controls (Built)
Glossy charcoal glass (from the user's reference) is used on **controls only**:
- the pill navbar and its active pill
- the Live/Idle pill
- buttons
- the "Pages visited" chips, the Journeys **Path** chips and the status pills
- the heatmap toolbar: page select trigger, width chips, Dots/Grid control

**Never on cards, the frame, or anything behind data.**

There are two utilities in `globals.css`:
- **`glass`:**
  - a translucent (70%) top-to-bottom gradient `--glass-top` → `--glass-bottom`
  - `backdrop-filter: blur(14px) saturate(140%)`, so the app glow behind the control shows through softly
  - a 115° sheen band (white 6%, sharp edge at 30%)
  - a 1px edge at white 7%
  - an inset top highlight (white 12%) and an inset bottom shadow (black 60%)
  - a drop shadow of `0 1px 2px` black 80% plus `0 6px 16px` black 45%
- **`glass-shine`:** the same sheen, bevel and shadow over an existing background color.

`backdrop-filter` appears only in the `glass` utility. Glass controls are the only elements with shadows.

### Buttons (`ui/button.tsx`)
- **Default (primary):** orange, `glass-shine`, dark text; hover is orange at 90%.
- **Outline:** `glass`, `--text`; hover is `brightness-125`.
- All buttons in the app are `rounded-full`. There's no transition (it was removed from the shadcn base).

### Chips & pills
- **Page chip** ("Pages visited"): `glass`, full radius, 12px text, 4×10px padding.
- **Path chip** (Journeys table): `glass`, full radius, 12px text, 2×8px padding. Shows a friendly page label (§7).
- **Status pill** (Journeys table): `glass`, 12px text, 2×10px padding.
  - "Reached checkout": `--sage` text (any event on a page ending `/checkout.html`).
  - "Browsing": `--text-muted` text.
- **Gap chip** (timeline, e.g. `+11s`): `--panel-raised`, **not glass**, 11px muted `tabular-nums`.
- **Change pill:** Planned (Step B).
  - `↑ 12%` in `--up` or `↓ 8%` in `--down`, on that color at 12%.
  - "New this week" when the previous period is empty.
  - "No change" when the values are equal.

### Tooltips
`ui/tooltip.tsx`: a light tooltip (`--text` background, `--app` text), 12px, `rounded-md`, with **no animation** (the shadcn fade and zoom were removed).

## 6. Overview

### Built (Phase 3.5 Step A)
- **Page title** "Overview" + its summary sentence (§5).
- A 12-column grid (1 column below `lg`), 16px gap.
- **"Totals" card** (`lg:col-span-4`): 2×2 raised tiles with a 12px gap: **Sessions, Events, Clicks, Pages tracked**. These are **all-time** totals from `getOverviewStats()`.
  - Each tile: an icon square (`--panel`) + a muted label on one row, then the big number.
  - No change pills.
- **Empty database:** an empty-state card across the whole grid: "No events yet", a sentence, and "Open demo store".
- **Loading:** a skeleton of the same card (title bar + 4 tiles, no numbers).

### Planned (Step B), the bento
Desktop is a 12-column grid with a 16px gap. Every number comes from the services in ARCHITECTURE.md §4.1.

| Position | Card | Content |
|---|---|---|
| Left, span 4, tall | **Activity this week** | "**{n}%** more/less than last week" ("New this week" if last week = 0). 7 vertical hatched bars, oldest → today; **today's bar is solid sage** with a value pill. |
| Middle top, span 4 | **2×2 tiles** | Sessions, Events, Clicks, Pages, with change pills vs the previous 7 days. |
| Middle bottom, span 4 | **Top pages** | Up to 5 pages by clicks: path chip, horizontal hatched bar, count. |
| Right, span 4, tall | **Heatmap preview** + **Latest journey** | A scaled iframe of the most-clicked page (`?cf_preview=1`) with desktop click dots, plus "Open heatmap". Below it, the newest session's last 8 steps as a timeline, plus "View journey". |
| Bottom, span 8 | **Clicks by day and hour** | Heat grid, 7 rows (Mon–Sun) × 12 two-hour columns, in the viewer's time zone, over the last 28 days, with a legend of real min and max counts. |
| Bottom, span 4 | **Recent journeys** | The newest 5 sessions: short id, events, status pill, last seen. |

**Mobile order:**
1. tiles
2. activity
3. heatmap preview
4. latest journey
5. top pages
6. heat grid (scrolls inside its card)
7. recent journeys

**Empty database:** one large empty-state card; no zero-filled charts.

## 7. Other pages

### Journeys `/dashboard/journeys` (Built)
- **Page title** "Journeys" + its summary sentence (§5), then **one card** holding only the table (no card title).
- **Table columns:**
  - **Journey:** 8-char Geist Mono id, `text-xs`; a link that turns sage on hover; tooltip with the full id.
  - **Events, Clicks:** right-aligned `tabular-nums`; **hidden below `sm`**.
  - **Path:** the page sequence as glass path chips joined by a muted `→`, e.g. `Home → Products → Product → Checkout`.
    - At most **4 chips**, then a muted `+n`. Chips wrap inside the cell.
    - Hovering shows the full URL sequence.
    - **Hidden below `md`.**
    - Comes from `SessionSummary.path`: the `page_url` of each page_view in time order, with consecutive duplicates collapsed in the service.
    - Labels come from `pageLabel()`: exactly `/demo` or `/demo/` → Home, `products.html` → Products, `product.html` → Product, `checkout.html` → Checkout, anything else → its last segment without `.html`.
    - There's no "Pages" count column any more.
  - **Status:** the glass status pill.
  - **Last seen:** right-aligned, muted. From `sm` up it's the long form ("4 minutes ago"); below `sm` it's the narrow form ("4m ago"). Hover shows the ISO time.
- **Below `sm`** only **Journey, Status, Last seen** show (Path also needs `md`), and the table fits 375px with no scrolling (`overflow-x-auto` is only a fallback). The "Last seen" header may wrap to two lines below `sm`.
- **Rows:** the whole row is clickable, with a `--line` divider and `--panel-raised` hover.
- **Footer:** "N journeys shown" (12px muted) on the left; an outline glass **"Load more"** on the right, hidden when there's no next page. If loading fails, a sonner toast says "Could not load more journeys".
- **Empty:** an empty state inside the card (no border or background of its own): "No journeys yet" + "Open demo store".
- The URL `/dashboard/sessions` no longer exists (no redirect).

### Journey detail `/dashboard/journeys/[sessionId]` (Built)
- **Top:** a muted "← All journeys" link.
- **Grid:** 12 columns from `lg` (1 column below it): left `col-span-5`, right `col-span-7`. Below `lg` the order is summary, timeline, preview.
- **"Journey summary" card** (left):
  - the full session id (Geist Mono, 12px, muted, wraps)
  - "Started <local date and time>"
  - 2×2 raised tiles: Duration, Events, Clicks (orange dot), Page views (sage dot), with 32px light numbers
  - "Pages visited (n)" with glass page chips
- **"Journey" card** (left): a vertical timeline of every event. Each step is a full-width button (`rounded-tile`, 8×4px padding):
  - a 10px dot (orange for clicks, sage for page views) joined to the next by a 1px `--sage-dim` line
  - the label ("Page view" / "Click", 14px)
  - the path (12px muted, truncated, full URL in a tooltip)
  - for clicks, `x 520, y 333 · 1536×776` (12px muted)
  - the local time on the right
  - a gap chip (`+11s`) between steps
  - the selected step has a `--panel-raised` background; the first step is selected by default.
- **Page preview card** (right; sticky at `top-4` from `lg`):
  - **Header:** the page path as the title (18px/500, truncated) and the render size `W×H` (12px muted).
  - **Body:** a scroll box (`rounded-tile`, `--line` border, `--app` background, max height 70vh) holding an iframe of `page_url?cf_preview=1`, scaled to the card width.
    - **For a click:** rendered at the click's own `viewport_w × page_h`, with a 14px orange dot (2px `--app` ring) at the click position. The box scrolls to the dot.
    - **For a page view:** 1280×800.
  - **iframe:** `sandbox="allow-scripts"` (no `allow-same-origin`), `referrerPolicy="no-referrer"`, `pointer-events-none`, lazy-loaded.
- **Not found** (unknown or malformed id): a card with "Journey not found", a sentence, an outline "Back to journeys" and an orange "Open demo store".

### Heatmap `/dashboard/heatmap` (Built, Phase 4)
- **Header:** `PageTitle` "Heatmap" + `{n} clicks on {page label} at {width}px.`, where n = all clicks for the selected page **and** exact width (not affected by the replay slider). With nothing clicked yet: "No clicks recorded yet."
- **Floating glass toolbar** (`glass`, `rounded-card`, a full pill from `md`, 6px padding, wraps on phones):
  - **Page select:** shadcn `Select` with a glass pill trigger (36px, min 176px). Options are page labels, with path + click count as a tooltip, from `listHeatmapPages()` (no `/__test/` URLs, most clicked first). Writes `?page=<full page_url>` and drops `?w=`.
  - **Width chips:** one per **exact window width** the page was clicked at, e.g. `1536px · 13` (36px pills, `tabular-nums`), writing `?w=`.
    - **Selected chip:** `bg-panel-raised` + `glass-shine` (the active-nav style). **Others:** `glass`, muted.
    - The row scrolls sideways inside the toolbar when it doesn't fit.
    - **This replaces the old Desktop/Mobile filter.** A responsive page lays out differently at 1280px and 1536px, so x/y only match the layout at the width they were recorded at. Only clicks from the selected width are plotted.
  - **Dots / Grid:** a glass segmented control; the selected segment uses the active-nav style. It's client state, not in the URL.
  - **Defaults:** the most-clicked page, then its most-clicked width. An unknown `?w` falls back to the default; an unknown `?page` shows the empty state, with the toolbar still visible.
- **Preview card:**
  - **Header:** page path (18px/500) + the render size `W×H` (12px muted).
  - **Body:** `ScaledPageFrame` (shared with the journey preview), an iframe of `page_url?cf_preview=1` with `sandbox="allow-same-origin"` (no scripts).
    - **Width:** rendered at the width's `render_w`, i.e. the clicks' **layout width** (`layout_w` = viewport minus scrollbar), falling back to `viewport_w` for older clicks.
    - **Height:** the tallest `page_h` among those clicks.
    - **Scaling:** scaled to the card with `transform: scale()`, in a scroll box (max 70vh). Dots and grid share the scaled box: page (x, y) → (x, y) × scale.
  - **Dots:** 10px `--event-click` dots at 55% opacity with `mix-blend-mode: screen`, so overlaps get brighter.
  - **Grid:** 24×24 **page-pixel** cells (scaled with the page). Each cell gets `heat-1…4` by count / maxCount (≤25%, ≤50%, ≤75%, above), at 70% opacity; empty cells are transparent.
  - **Legend** (12px muted):
    - **Grid:** real min cell count, the heat ramp bar, real max, then "clicks per 24px cell".
    - **Dots:** "1 dot = 1 click · n clicks shown".
  - **Replay bar:** an outline glass play/pause icon button, then a range slider (`accent-sage`) over the time span of the selected width's clicks, then the current local date and time.
    - Only clicks at or before the slider time are drawn. It starts at the end, showing all.
    - Play animates the slider with anime.js (`animate()`, linear, 2s for the full span); Play at the end restarts from the first click.
    - With reduced motion, Play jumps to the end and the slider still works. With a single click time, both controls are disabled.
- **States:**
  - **Loading:** a skeleton of the toolbar pill and the preview card.
  - **Empty:** "No clicks on this page yet" + Open demo store; the toolbar stays if there are other pages.
  - **Error:** `error.tsx` with "Try again".
- **Console:** with no scripts allowed, Chrome logs "Blocked script execution" for the demo page's `tracker.js` on this page. That's expected and harmless.

## 8. States (Built)

- **Loading:** shadcn `Skeleton` blocks (`--panel-raised`, with shadcn's default `animate-pulse`) in the shape of the real content (totals tiles, table rows, summary + timeline + preview). They show no numbers.
- **Empty:** a card with a 36px icon square, a title (18px/500), one muted sentence, and the orange **"Open demo store"** pill (a plain `<a href="/demo">`).
- **Error:** `error.tsx` in each route segment renders a card with a `--down` warning icon, "Something went wrong", a sentence, an optional "Ref: <digest>", and an outline glass **"Try again"** (`retry()`). The frame and navbar stay visible.

## 9. Motion

### Built
| What | Where | Spec |
|---|---|---|
| Nav active pill slides | `pill-nav.tsx` (motion) | `layoutId`, spring 0.25s, bounce 0.15, `MotionConfig reducedMotion="user"` |
| Skeleton pulse | `ui/skeleton.tsx` (shadcn default) | `animate-pulse` while loading |
| Table row hover | `ui/table.tsx` (shadcn default) | `transition-colors` on the row background |
| Toasts | sonner (library default) | slide-in; the loading icon spins |
| Heatmap replay | `replay-bar.tsx` (anime.js `animate()`) | the slider value animates linearly to the end, 2s for the full span; dots appear in timestamp order as it passes them; reduced motion → jump to the end |

All other hover changes are instant: the transitions were removed from buttons, the tooltip, the nav items, the timeline and the Select (`ui/select.tsx`: no open/close animation, no trigger transition).

### Planned
| What | Library | Spec |
|---|---|---|
| Big numbers count up | anime.js | once on first load, 600ms, `outExpo` |
| Bars grow from 0 | anime.js | once, 40ms stagger, ≤ 600ms each |
| Live dot pulse | CSS | slow, only while "Live" |

- No page transitions, no hover lift or scale, no row stagger.
- **Reduced motion:** the global CSS in `globals.css` cuts all CSS animations and transitions to ~0 under `prefers-reduced-motion: reduce`; the nav pill follows the user setting via `MotionConfig`. Planned JS animations must check `matchMedia` and render their final state.

## 10. Demo store "Northwind" (Built)

`public/demo/*.html` + `public/demo/store.css`. A **light**, Amazon-style marketplace with its **own brand** (no Amazon name, logo, colors or partner banners). It's a separate site: the dashboard tokens, orange budget, glass and "no hex" rules don't apply here.

### Rules
- **Static:** no JavaScript except `tracker.js`. No carousels or randomized sections, so heatmap positions are stable.
- **Product photos** (`p-*.jpg`) all have a plain white or light-grey studio-style background, so the catalog looks consistent (`p-2` and `p-1c` were replaced for this).
- **Images:** every image is a CSS `background-image` on a fixed-size box (`.img`, with `aspect-ratio` or a fixed height). There are **no `<img>` elements**, so layout is identical before and after images load (verified with Playwright: 0 element boxes move). Missing images show a light tile.
  - The files live in `public/demo/img/` (free Unsplash License photos, credited in `img/CREDITS.md`).
- **Tests and screenshots must use `?cf_preview=1`** on demo URLs so the tracker sends nothing.

### Palette (`store.css` `:root`)
| Var | Hex | Use |
|---|---|---|
| `--ink` | `#0F1111` | Top header, footer base, body text |
| `--ink-2` | `#1F2A2A` | Category strip, footer |
| `--page` | `#E9ECEC` | Page background |
| `--card` | `#FFFFFF` | Cards, product tiles |
| `--line` | `#D5D9D9` | Borders |
| `--muted` | `#565959` | Secondary text |
| `--teal` / `--teal-dark` | `#14B8A6` / `#0F8F82` | Search button, primary buttons, focus ring, logo dot |
| `--gold` | `#F5A623` | Stars; secondary buttons ("Shop the sale", "Sign in securely", "Add to Cart", "Place your order") |
| `--coral` | `#F05A4F` | Discount badges |
| `--link` | `#007185` | Text links ("See all deals", ratings count) |

The back-to-top bar is `#37474F`. Image placeholder tiles: `#F3F4F4` (cover) and `#F7F8F8` (contain).

### Type and shape
- **Fonts:** system UI stack, 14px base. The logo "northwind" is 24px/800, followed by a teal dot and ".in".
- **Card radius:** 8px. Buttons are fully rounded.

### Pages
- **Header** (shared), 64px, `--ink`:
  - logo, then "Deliver to Noida 201301 / Update location"
  - a search bar: category select + input + teal button, 42px tall, 8px radius
  - "Hello, sign in / Account & Lists", "Returns & Orders", and a cart with a teal count
  - then a 40px **category strip** (`--ink-2`): "☰ All", Fresh, Today's Deals, …, Customer Service; it scrolls sideways when narrow.
- **`/demo`:**
  - a 420px hero (`hero.jpg`, teal → gold gradient behind it; the text block sits between `left: 6%` and `right: 6%`, max 460px wide)
  - **Readability overlay:** `.hero::before`, `--ink`-colored, between the bottom fade and the text.
    - **Desktop:** a horizontal gradient from 62% → 50% (at 40%) → 0 (at 72%).
    - **≤600px:** full width, 62% → 50%.
    - It stops where the deal cards start (170px from the bottom, 110px at ≤860px), with a 40px soft edge.
    - **Measured:** white text's worst-case contrast against the brightest pixel behind it is 5.3–6.0:1 at 1280px and 5.0–5.6:1 at 375px (target ≥ 4.5:1). with "The Festive Edit is live", a sentence and a gold "Shop the sale"; it fades into the page
  - **4 deal cards** overlapping the hero by 170px: Trending deals, Under ₹299, Up to 60% off | Self-care & home, and Sign in. Each holds a 2×2 image grid and a "See …" link.
  - a "Best sellers in Sports & Outdoors" row that scrolls inside its card
  - "Back to top" and the footer
- **`/demo/products.html`:**
  - a white results bar ("1-9 of 9 results…", Sort select)
  - a 240px filter sidebar (category, reviews, price, delivery checkboxes) and a grid of 9 product cards, at least 230px each
  - each card: image, title, stars + count, coral % badge, price, struck-through M.R.P., delivery line, teal "Add to cart"
- **`/demo/product.html`:** used for every product; `?id` is ignored by the analytics.
  - breadcrumbs
  - a gallery: 3 thumbnails + the main image
  - info: title, store link, rating, badge + price, M.R.P., 3 offer boxes, "About this item", a review quote
  - a sticky buy box: price, delivery, "In stock", quantity, gold "Add to Cart", teal "Buy Now" → checkout
- **`/demo/checkout.html`:**
  - a simplified white header: logo, "Checkout", a lock icon
  - 3 steps: address form, delivery speed radios, payment (no card fields)
  - a sticky order summary: gold "Place your order", 2 items, totals
- **Footer** (shared): 4 link columns on `--ink-2`, and a base line "© Northwind — a demo store for CausalFunnel analytics. Not a real shop."

### Breakpoints
- **≤1100px:** deal cards in 2 columns; the product page's buy box moves under the details.
- **≤860px:**
  - the header wraps and the search bar gets its own full-width row
  - "Deliver to", "Account" and "Returns" are hidden
  - the hero drops to 300px and the deal cards overlap by 110px
  - the filters become a wrapped card above the grid
  - checkout goes to one column
  - the footer goes to 2 columns
- **≤600px:**
  - deal cards in 1 column
  - the product grid in 2 columns
  - the product page in one column, with thumbnails in a row under the main image
- No page scrolls sideways at 375px or at 1280px.
