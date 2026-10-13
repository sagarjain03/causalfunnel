# Design

## 1. Direction: "Bento on dark"

A deep-black bento dashboard with charcoal surfaces and glossy glass controls: the app sits in a rounded frame, data lives in mixed-size cards, and one quiet main color (sage-teal) carries all the data. A small orange accent marks the few things that need attention. The signature texture is a **diagonal hatch** on bars and fills.

Reference: a dark logistics dashboard with a floating pill navbar, mixed-size cards, hatched bars, a sage main color and an orange accent. We borrow its structure and texture, not its content.

**Honesty rule:** every number on screen comes from the database. There are no placeholder, decorative or "example" numbers anywhere, including empty states, legends and skeletons.

Dark is the only theme (`<html class="dark">`).

## 2. Colors

All tokens live in `src/app/globals.css` as CSS variables. Components use Tailwind token classes, never hex.

### Surfaces & text
Neutral charcoal (no blue tint). The background is deep black; every surface is a step lighter than the background.

| Token | Hex | Use |
|---|---|---|
| `--frame` | `#000000` | Outermost window background, around the app frame |
| `--app` | `#0A0A0A` | The app canvas inside the frame |
| `--panel` | `#141414` | Cards |
| `--panel-raised` | `#1C1C1C` | Inner tiles, icon squares, hover background, inputs |
| `--line` | `#262626` | All borders and dividers |
| `--text` | `#F2F2F2` | Primary text, big numbers |
| `--text-muted` | `#8F8F8F` | Labels, secondary text, axis text |

### Data & accent
| Token | Hex | Use |
|---|---|---|
| `--sage` | `#9CC5C4` | **Main data color**: bars, active nav pill, current bar, page views, active states, focus ring |
| `--sage-dim` | `#5E7F7E` | Secondary data, inactive series, timeline line |
| `--orange` | `#F2672E` | **Only** in the places listed under "Orange budget" |
| `--up` | `#4CC38A` | Positive change |
| `--down` | `#E5484D` | Negative change, errors |

### Event colors
| Event | Color | Icon |
|---|---|---|
| Click | `--orange` | `MousePointerClick` |
| Page view | `--sage` | `Eye` |

Clicks are the one data category drawn in orange, because a click is the event the product is about. This is the only exception to the orange budget, and it never applies to bars.

### Heat ramp (heatmap and heat grid), cold → hot
`--heat-0 transparent` → `--heat-1 #5E7F7E` → `--heat-2 #9CC5C4` → `--heat-3 #E8D58A` → `--heat-4 #F2672E`

A cell's color is picked by `count / maxCount`. Zero is transparent, so only the cell's `--line` outline shows.

### Orange budget
Orange may appear only on:
1. The logo mark.
2. The primary button ("Open demo store", "Get started" in empty states). Its text is `--app` (dark), because white on orange fails contrast.
3. The live dot.
4. The single highlighted bar: at most one per chart, and only when one item must be called out (e.g. the peak). Charts don't need one by default.
5. Click events (dots, timeline nodes, the click icon), as above.

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

## 3. Texture: diagonal hatch

The signature texture is used on **bars and progress fills only**, and never as decoration (no hatched backgrounds, borders or empty areas).

```css
/* utility: .hatch */
background-image: repeating-linear-gradient(
  45deg,
  color-mix(in srgb, var(--sage) 35%, transparent) 0 1px,
  transparent 1px 6px
);
```

- **Default bar:** hatch on a transparent background, with a 1px `--line` outline and the top corners rounded at 6px.
- **Current bar** (today, the selected item): solid `--sage`, no hatch.
- **Highlighted bar:** solid `--orange`, at most one per chart (see the orange budget).
- **Horizontal bars** (Top pages): the same hatch, filling from the left.

## 4. Typography

| Role | Font | Spec |
|---|---|---|
| Everything | **Onest**, via `next/font/google` (self-hosted by Next at build time) | Weights 300, 400, 500 and 600. General Sans was dropped: its ITF Free Font License §02 forbids distributing the font files through a public repository. |
| Session ids only | **Geist Mono** (already installed) | `text-xs`, nothing else is mono |

| Use | Spec |
|---|---|
| Big numbers | **300 weight**, 40–56px (`text-[40px] md:text-[56px]`), `tabular-nums`, `leading-none`. A small 400-weight unit or label sits next to the number (`text-sm text-muted-foreground`), e.g. `1,200` + `events`. |
| Greeting | 300 weight, 32–40px; the second half ("Good evening") is in `--text-muted` |
| Card title | 500 weight, 18px |
| Body | 400, 14px |
| Small labels, axis | 400, 12px, `--text-muted` |
| Numbers in tables, times, coordinates | Onest with `tabular-nums` (not mono) |

Rules:
- **No all-caps labels anywhere.** No `uppercase` and no letter-spaced eyebrow labels.
- **Sentence case** everywhere: "Top pages", not "Top Pages".
- Long URLs: show the path only, with the full URL in a tooltip.
- Session ids: the first 8 characters, in Geist Mono, with the full id in a tooltip.

## 5. Layout

### Frame
- The window background is `--frame`.
- The app is one rounded container: `--app` background, **28px radius**, **16px gap** from the window edges, and a 1px `--line` border.
- Content inside the frame: 24px padding on desktop, 12px below `md`.

### Top bar (inside the frame)
- **Left:** the logo (orange mark + "CausalFunnel").
- **Center:** a **floating pill navbar**. It's a `--panel` pill with a `--line` border, containing Overview / Journeys / Heatmap.
  - The active item sits on a `--panel-raised` pill that **slides** between items (motion `layoutId`).
  - The active text is `--text`; the others are `--text-muted`.
- **Right:**
  - **Live dot:** a pulsing orange dot labelled "Live" when the newest event is less than 5 minutes old (read from the DB). Otherwise a static `--text-muted` dot labelled "Idle".
  - The **"Open demo store"** primary button (a plain `<a href="/demo">`).
- **Below `md`:** the logo and live dot stay on top; the pill navbar moves under them at full width (3 equal segments). There's no hamburger and no sidebar.

### Greeting row
- "Good evening" (morning, afternoon or evening by the viewer's local time) and today's date in a `--panel` pill on the right.
- Both are computed **on the client** (server time and time zone are not the viewer's). The server HTML renders a neutral "Hello" and no date, and switches after hydration without a layout shift (the pill has a fixed width).

### Cards
- `--panel` background, 1px `--line` border, **22px radius**, 20px padding.
- Header: an 18px/500 title on the left, an optional control on the right (a `--panel-raised` pill select or a round icon button).
- Inner tiles: `--panel-raised`, 16px radius, 16px padding.
- Icon square: 36px, `--panel-raised`, 10px radius, a 16px lucide icon in `--text`.
- Hover (clickable cards and rows only): the background changes to `--panel-raised`. No lift, shadow or scale.

### Glass controls
Glossy charcoal glass, from the user's reference (dark pill buttons with a bevel and a sheen), is used on **controls only**:
- the pill navbar and its active pill
- the Live/Idle pill and the date pill
- buttons
- chips and status pills
- the Phase 4 heatmap toolbar

**Never on cards, the frame, or anything behind data.**

It's built from two utilities in `globals.css`, using the tokens `--glass-*`:
- `glass`:
  - a top-to-bottom gradient `--glass-top #262626` → `--glass-bottom #111111`
  - a faint 115° sheen band
  - a 1px edge at white 7%
  - an inset top highlight (white 12%) and an inset bottom shadow
  - a soft drop shadow
- `glass-shine`: the same sheen, bevel and shadow over an existing background color. Used for the orange primary button and the active nav pill.

There's no `backdrop-filter` blur: on a flat black background there's nothing behind the control to blur. Glass controls are the only elements with shadows; cards stay flat with a 1px border.

### Chips & pills
- **Chip** (page path, filter): `glass`, full radius, 12px text, 4×10px padding.
- **Change pill:**
  - `↑ 12%` in `--up` or `↓ 8%` in `--down`, on that color at 12% opacity.
  - **"New this week"** in `--text-muted` when the previous period has no data.
  - **"No change"** when the values are equal.
- **Status pill** (Recent journeys):
  - "Reached checkout": `glass` with `--sage` text.
  - "Browsing": `glass` with `--text-muted` text.

## 6. Overview (bento)

Desktop: a **12-column grid, 16px gap**. Every number comes from the services in ARCHITECTURE.md §4.1.

| Position | Card | Content |
|---|---|---|
| Left, span 4, tall (2 rows) | **Activity this week** | One sentence: "**{n}%** more/less than last week" (`n` from this week's vs last week's events; "New this week" if last week = 0). 7 vertical **hatched** bars, one per day, oldest → today, with weekday labels below. **Today's bar is solid sage** with a value pill above it (its event count). |
| Middle top, span 4 | **2×2 tiles** | Sessions, Events, Clicks and Pages tracked. Each tile has an icon square, a big 300-weight number, and a change pill vs the previous 7 days (see Chips). |
| Middle bottom, span 4 | **Top pages** | Up to 5 pages by clicks. Each row: the path in a chip, a horizontal **hatched** bar sized by `clicks / maxClicks`, and the count. |
| Right, span 4, tall | **Heatmap preview** + **Latest journey** | **Top:** a scaled iframe of the most-clicked page (`?cf_preview=1`) with its desktop (≥768px) click dots overlaid, the page path as the title, and an "Open heatmap" button. **Below:** the newest session's last 8 steps as a vertical timeline (dots joined by a `--sage-dim` line; click dots orange, page-view dots sage), the path on the left and the local time on the right, plus a "View journey" link. |
| Bottom, span 8 | **Clicks by day and hour** | Heat grid: **7 rows** (Mon–Sun) × **12 columns** (2-hour buckets, 00–02 … 22–24), in the viewer's time zone, over the last 28 days. Cells use the heat ramp; a small legend shows the ramp with the real min and max counts. |
| Bottom, span 4 | **Recent journeys** | The newest 5 sessions: short id (mono), events, status pill ("Reached checkout" if any `page_url` ends with `/checkout.html`, else "Browsing"), last seen (relative). The row links to the journey. |

**Mobile (below `md`)**: a single column, in this order:
1. tiles
2. activity
3. heatmap preview
4. latest journey
5. top pages
6. heat grid (scrolls horizontally inside its card, with the weekday labels sticky)
7. recent journeys

**Empty database:** the bento is replaced by one large card: an icon, "No events yet", one sentence, and the "Open demo store" button. No zero-filled charts.

## 7. Other pages

All of them use the same frame, cards and texture.

- **Journeys** (`/dashboard/journeys`): one large card with the sessions table. Same columns as Recent journeys, plus clicks and pages (hidden below `sm`). "Load more" button at the bottom.
- **Journey detail** (`/dashboard/journeys/[sessionId]`):
  - **Left (span 5):** the summary tiles (duration, events, clicks, page views) above the timeline card, in the same style as Latest journey but with every step and "+12s" gap chips.
  - **Right (span 7):** a large page preview card showing the page of the selected step (default: the first), with that step's click dot if it's a click. Clicking a step selects it.
  - **Mobile:** timeline first, then the preview.
- **Heatmap** (`/dashboard/heatmap`):
  - A large preview card: the scaled iframe of the selected page with the dots or grid overlay.
  - A **floating pill toolbar** on top of the card: page select, Dots / Grid, Desktop / Mobile.
  - A **replay scrubber** at the bottom of the card: a play/pause button, a range slider over the click time span, and the current time. Moving it shows only the clicks up to that moment.
  - A legend with the ramp and real counts.

## 8. States

Every data card has all three states:
- **Loading:** a skeleton in the card's real shape (bars, tiles, rows). Skeletons show no numbers.
- **Empty:** an icon, one sentence, and the "Open demo store" button.
- **Error:** a sentence plus "Try again" (`retry()`); the frame and navbar stay visible.

## 9. Motion (only these)

| What | Library | Spec |
|---|---|---|
| Big numbers count up | anime.js | once on first load, 600ms, `outExpo` |
| Bars grow from 0 | anime.js | once on first load, height or width from 0, **40ms stagger**, ≤ 600ms each |
| Nav active pill slides | motion | `layoutId`, spring, ~250ms |
| Heatmap dots on replay | anime.js | dots appear in timestamp order, total ≤ 800ms (or following the scrubber) |
| Live dot | CSS | a slow pulse, only while "Live" |

- **Nothing else moves.** No page transitions, no hover lift or scale, no row stagger.
- Hover = a subtle background change only.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, everything renders in its final state immediately (JS animations check `matchMedia`; CSS is already globally disabled), and the live dot doesn't pulse.
