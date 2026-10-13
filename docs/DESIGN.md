# Design

## 1. Direction: "Signal on dark"

An analytics tool is an instrument panel. The UI is dark and quiet so that **data is the brightest thing on screen**. Color is reserved for meaning: orange = clicks, cyan = page views, the heat ramp = density. Decoration (Aceternity effects) lives only in headers and empty states.

Dark mode is the default and only theme for v1 (`<html class="dark">`). Light theme is out of scope.

## 2. Colors

All tokens live in `src/app/globals.css`. Components use Tailwind classes (`bg-card`, `text-muted-foreground`, `text-event-click`), never raw hex.

### Surfaces
| Token | Hex | Use |
|---|---|---|
| `--background` | `#09090b` | Page |
| `--card` | `#111113` | Cards, panels, table |
| `--muted` | `#18181b` | Hover rows, inputs, chips |
| `--border` | `#27272a` | All borders, dividers |
| `--foreground` | `#fafafa` | Primary text |
| `--muted-foreground` | `#a1a1aa` | Secondary text, labels |

### Brand & meaning
| Token | Hex | Use |
|---|---|---|
| `--primary` | `#ff6b35` | Signal orange: primary buttons, focus ring, active nav |
| `--accent` | `#22d3ee` | Cyan: links, secondary highlights |
| `--event-click` | `#ff6b35` | Click events everywhere (badges, timeline icons, dots) |
| `--event-pageview` | `#22d3ee` | Page view events |
| `--success` | `#34d399` | Live indicator, success toasts |
| `--warning` | `#fbbf24` | Warnings |
| `--destructive` | `#f43f5e` | Errors |

### Heat ramp (cold → hot)
`--heat-1 #22d3ee` → `--heat-2 #a3e635` → `--heat-3 #fbbf24` → `--heat-4 #ff6b35` → `--heat-5 #f43f5e`

- Dots mode: each dot `--event-click` at 55% opacity, 10px, `mix-blend-mode: screen` so overlaps glow brighter.
- Grid mode: cell color picked from the ramp by `count / maxCount`, empty cells transparent.

### Rules
- Text contrast ≥ 4.5:1 (all foreground tokens on `--card` pass).
- Never encode meaning by color alone: event types also get an icon (`MousePointerClick`, `Eye`).

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| UI & headings | **Geist Sans** (`font-sans`) | Already loaded via `next/font` |
| IDs, URLs, timestamps, coordinates, numbers in tables | **Geist Mono** (`font-mono`) | `tabular-nums` so digits align |

### Scale
| Use | Class |
|---|---|
| Page title | `text-2xl md:text-3xl font-semibold tracking-tight` |
| Section title | `text-lg font-semibold` |
| Stat number | `text-3xl md:text-4xl font-semibold font-mono tabular-nums` |
| Body | `text-sm` (dashboards are dense; 14px base) |
| Label / eyebrow | `text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono` |
| Table cell | `text-sm`, IDs in `font-mono text-xs` |

Truncate long URLs in the middle (`site.com/…/checkout`), full URL in a tooltip. Session IDs show first 8 chars.

## 4. Layout & spacing

- Sidebar 240px (desktop), sheet drawer on mobile. Content max width `1280px`, padding `p-4 md:p-8`.
- Spacing on a 4px grid; card padding `p-5`, gaps `gap-4` / `gap-6`.
- Radius `0.75rem` (`rounded-lg` on cards, `rounded-md` on inputs/buttons, `rounded-full` on dots/badges).
- Borders, not shadows, separate surfaces. One subtle shadow allowed on popovers.

## 5. Components & patterns

| Screen | Pattern |
|---|---|
| Overview | Header with Aceternity Spotlight, 4 stat cards (icon, label, count-up number), recent sessions preview |
| Sessions list | shadcn Table; row hover `bg-muted`; whole row is a link; badges for click/view counts |
| Session journey | Vertical timeline, line in `--border`, node colored by event type, time gap pill between steps ("+12s") |
| Heatmap | Toolbar (page Select, Dots/Grid Tabs, Desktop/Mobile Tabs) above a framed, scaled page preview with overlay; legend bottom-right |
| Empty state | Icon, one sentence, button "Open demo site →" |

## 6. Motion

| Where | Library | Spec |
|---|---|---|
| Route enter | motion | fade + 8px rise, 250ms, `easeOut` |
| Table rows / timeline items | motion | stagger 30ms, max 15 items animated |
| Card hover | motion / CSS | lift 2px, border to `--primary/40`, 150ms |
| Heatmap dots | anime.js | `scale 0 → 1` + opacity, `stagger(8)` ordered by timestamp, total ≤ 800ms |
| Stat numbers | anime.js | count up 600ms, `outExpo` |
| Live indicator | CSS | `animate-ping` on a small green dot |

All animations disabled under `prefers-reduced-motion`.
