# Design

This file describes the UI **as it is in the code**. Sections are marked **Built** (in the code now) or **Planned** (specified, not built yet).
If the code and this file disagree, the code was changed without updating the docs: fix the docs or ask, don't "fix" the design back.

There are two separate designs:
- **Dashboard** (`src/app/dashboard`): "Bento on dark", §1–§9.
- **Demo store** (`public/demo`): "Northwind", a light, Amazon-style marketplace with its own brand, §10. The dashboard rules don't apply to it.

## 1. Direction: "Bento on dark" (Built)

A deep-black bento dashboard with charcoal surfaces and glossy glass controls: the app sits in a rounded frame, data lives in mixed-size cards, and one quiet main color (sage-teal) carries the data. A small orange accent marks the few things that need attention. The signature texture is a **diagonal hatch** on bars and fills (Built on the Overview, §3).

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

## 3. Texture: diagonal hatch (Built)

The `hatch` utility in `globals.css` is used for **bars and progress fills only**, never as decoration (Overview funnel, devices, top elements).

```css
@utility hatch {
  background-image: repeating-linear-gradient(
    45deg,
    color-mix(in srgb, var(--sage) 35%, transparent) 0 1px,
    transparent 1px 6px
  );
}
```

Inside Recharts charts (SVG) the same texture is an SVG `<pattern>` (`overview/hatch-pattern.tsx`): 45° sage strokes at 35% opacity every 6px.

Bar styles:
- **Default bar:** hatch on a transparent background, with a 1px `--line` outline and the top corners rounded at 6px.
- **Current bar:** solid `--sage`.
- **Highlighted bar:** solid `--orange`, at most one per chart (none used yet).
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
- **Navigation progress bar** (`nav-progress.tsx`, in the dashboard layout): a 2px `bg-sage` bar fixed to the top of the window while a dashboard route loads. It starts on a click on an internal `/dashboard…` link to a different URL (plain left click, no modifier, no `target`) or on `startNavProgress()` (journey row click, heatmap page select, both `router.push`). It only appears if the navigation takes longer than 80ms, eases towards 90% (8s), and disappears when the URL changes (10s safety timeout). Reduced motion: it shows at 90% without moving. No dependency.

### Page title (Built)
**"Includes demo data" pill:** when any event has `source: "seed"`, a small muted pill (`glass`, 12px, `--text-muted`, like the "Browsing" status pill) sits next to the page title on Overview, Journeys and Heatmap, and next to "← All journeys" on journey detail. It streams in separately (no skeleton) and has a tooltip explaining `npm run seed -- --clear`.

There's no greeting and no date pill. Each page starts with `PageTitle` (`components/dashboard/page-title.tsx`): an `h1` (24px/500) and **one muted sentence of real data** under it. The sentence streams behind `<Suspense>`, with a 20×256px skeleton line while it loads.
- **Overview:** `{n} journeys and {m} events in the last {7|14|28} days. Last activity {relative time}. ({time zone})`
  - `n` and `m` are the current-period KPI totals (§6); the last activity comes from `getLastEventAt()`.
  - It says "No activity yet." when there are no events, and "(UTC, browser time zone not known yet)" before the `cf_tz` cookie exists.
- **Action slot:** `PageTitle` takes an optional `action` (Overview: the range pill), on the right from `md` up and under the title below `md`. Without it the title looks as before.
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

## 6. Overview (Built)

Files: `src/app/dashboard/page.tsx` + `src/components/overview/*`. Every number comes from `src/server/services/overview.ts` (ARCHITECTURE.md §4.1).

### Range and time zone
- **Range pill** (`range-select.tsx`): a glass segmented pill of Links, `7d | 14d | 28d` (`?range=`, default 7, anything else → 7). The active segment uses the active-nav look (`glass-shine bg-panel-raised`). While it streams, the same pill renders with no active segment.
- **Time zone:** days and hours are in the viewer's zone, read from the `cf_tz` cookie (`TimezoneSync` in the dashboard layout). The zone is named in the title sentence and in the Activity and heat-grid descriptions.

### Definitions
- **Journey** = a session. It belongs to the period its **first event** falls in.
- **Current period:** the last N calendar days in the viewer's zone, today included up to now. **Previous period:** the N days before, cut at the same time of day (equal elapsed time).
- **Conversion rate:** journeys that visited a page ending `/checkout.html` ÷ journeys.
- **Avg journey duration:** mean of (last − first event); bounces count as 0s.
- **Bounce rate:** journeys with exactly one `page_view` ÷ journeys.
- **Clicks:** click events with a timestamp in the period.
- **Change pill** (`change-pill.tsx`): counts and duration show ±% vs the previous period; rates show ±pp. "New" when the previous value is 0 (for rates: when the previous period had no journeys); "No data" when both are 0; "No change" when the rounded delta is 0. Green (`--up`) = up, red (`--down`) = down; **bounce rate is inverted** (up is red). The tooltip shows the previous value.

### Layout
12-column grid, 16px gap. One column below `lg`, in source order.

| Row | Card | Content |
|---|---|---|
| 1, span 12 | **KPI strip** | 5 tiles (5 across on `lg`; 2 per row below, the last full width): Journeys, Conversion rate, Avg journey duration, Bounce rate, Clicks. Each: muted label, big number (300 weight, 28/32/40px, never wraps), change pill, 40px daily sparkline (sage line over the hatch pattern). The definition is the tile's `title`. |
| 2, span 8 | **Funnel** | Home → Products → Product → Checkout (journeys that visited each page, any order). Horizontal hatched bars scaled to the largest step, the last step solid sage; count + % of step 1 (stacked below `sm`); "↓ x% drop-off" between steps. Each row links to `/dashboard/heatmap?page=<most common URL for that step>`. |
| 2, span 4 | **Devices** | Desktop (≥ 768px) and Mobile (< 768px) by the widest click `viewport_w` of the journey: hatched bar, journeys, conversion. Journeys without clicks are listed as "Unknown (no clicks)" (page views carry no width). |
| 3, span 8 | **Activity** | Recharts ComposedChart, min 240px tall (grows with the row): daily journeys as hatched bars (left axis "Journeys", today solid sage) and daily events as a `--sage-dim` line (right axis "Events"). Lines and sparklines use `type="monotone"` (d3 `curveMonotoneX`): the curve never overshoots between points or dips below the lowest value (checked: 0px overshoot on every curve). X axis = dates in the viewer's zone. |
| 3, span 4 | **Top clicked elements** | Top 6 (page, `target`) pairs by clicks: target text (form fields read like "Search box: Search Northwind", "Checkbox: Bags & luggage"; RULES.md tracker privacy), truncated, full text in `title`; page-label chip, hatched bar, count. Rows link to that page's heatmap. A muted line counts older clicks without `target`. |
| 4, span 8 | **Clicks by day and hour** | 7 rows (Mon–Sun, ISO) × 12 two-hour columns, cells `--heat-1…4` with the heatmap Grid thresholds (empty = no fill), native `title` per cell ("Tue 18–20: 14 clicks"). Legend shows the real min and max non-empty cell. Below `lg` it scrolls sideways inside the card (sticky weekday column). |
| 4, span 4 | **Recent journeys** | The newest 6 journeys overall (not range-bound): short id, relative time, `JourneyPath` (max 3 chips), status pill. Rows link to the journey; "All journeys" link top right. |

### Charts
- Recharts via shadcn `ui/chart.tsx` (`ChartContainer`, `ChartTooltip`). Colors are config tokens (`var(--sage)`, `var(--sage-dim)`), grid lines `var(--line)`; no hex in components.
- Every chart has a tooltip with the date and exact values; axes are labelled with units.
- No chart animation (§9).

### States
- **Loading:** one skeleton per card in its shape and height (no numbers). The KPI skeleton is 5 tiles.
- **Empty:** per card, e.g. "No journeys in the last 7 days." + "Open demo store". The KPI strip collapses to one empty card. No zero-filled charts.
- **Error:** per card (§8).

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
  - the full session id (Geist Mono, 12px, muted, wraps) with a 28px outline round **copy button** (lucide `Copy`, `aria-label="Copy session id"`): copies the full id and confirms with a sonner toast "Session id copied" (error toast if the browser blocks the clipboard)
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
  - **Dots:** 10px dots, normal blending: `--event-click` fill at 80%, a 1px `--text` (light) inner ring and a 1px `--app` (dark) outer ring (`DOT_STYLE` in `heatmap-overlay.tsx`). They stay visible on any page background. Overlaps don't brighten; density is what Grid mode is for. The legend's sample dot uses the same style.
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
- **Error (per card, Overview):** each Overview card is wrapped in `CardErrorBoundary` (`catchError` from `next/error`): a card with a `--down` warning icon, "Couldn't load {card}", and an outline **"Try again"** (`retry()`). The other cards keep working.
- **Not found (global):** `app/not-found.tsx` for every unmatched URL (`/anything`, `/dashboard/anything`, HTTP 404). It renders in the root layout only, so it draws the dashboard frame itself: logo top-left, then a centered empty-state card (Compass icon square, "Page not found", one sentence, outline "Go to overview" + orange "Open demo store"). Unknown journey ids keep `journeys/[sessionId]/not-found.tsx` ("Journey not found", inside the dashboard frame).
- **Toasts (sonner, only for actions with no visible result):** "Could not load more journeys" (Load more failed; the existing rows stay) and "Session id copied" / "Could not copy the session id". Every other action shows its result on screen (navigation, range, page/width/mode, replay, Load more success, Try again), so it has no toast.
- **Error (page):** `error.tsx` in each route segment renders a card with a `--down` warning icon, "Something went wrong", a sentence, an optional "Ref: <digest>", and an outline glass **"Try again"** (`retry()`). The frame and navbar stay visible.

## 9. Motion

### Built
| What | Where | Spec |
|---|---|---|
| Nav active pill slides | `pill-nav.tsx` (motion) | `layoutId`, spring 0.25s, bounce 0.15, `MotionConfig reducedMotion="user"` |
| Skeleton pulse | `ui/skeleton.tsx` (shadcn default) | `animate-pulse` while loading |
| Table row hover | `ui/table.tsx` (shadcn default) | `transition-colors` on the row background |
| Toasts | sonner (library default) | slide-in; the loading icon spins |
| Navigation progress bar | `nav-progress.tsx` (CSS `animate-nav-progress`, `globals.css`) | width 0 → 90% over 8s, `cubic-bezier(0.1, 0.7, 0.2, 1)`; on arrival it jumps to full width and fades out in 200ms; reduced motion → static 90% bar |
| Overview charts | Recharts (`sparkline.tsx`, `activity-chart.tsx`) | **no animation**: every series has `isAnimationActive={false}`, so reduced-motion users see nothing move either |
| Heatmap replay | `replay-bar.tsx` (anime.js `animate()`) | the slider value animates linearly to the end, 2s for the full span; dots appear in timestamp order as it passes them; reduced motion → jump to the end |

All other hover changes are instant: the transitions were removed from buttons, the tooltip, the nav items, the timeline and the Select (`ui/select.tsx`: no open/close animation, no trigger transition).

### Planned
| What | Library | Spec |
|---|---|---|
| Big numbers count up | anime.js | once on first load, 600ms, `outExpo` |
| Bars grow from 0 | anime.js | once, 40ms stagger, ≤ 600ms each (not on the Overview: its bars and charts are static by decision) |
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
