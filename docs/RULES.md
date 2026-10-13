# Rules

These are hard rules for anyone (human or AI) writing code in this repo. When a rule conflicts with a "nicer" idea, the rule wins. If a rule seems wrong, ask before breaking it.

## 1. Libraries — use these

| Need | Use | Notes |
|---|---|---|
| Primitives (button, table, select, card, badge, tabs, tooltip, sheet, skeleton, sonner) | **shadcn/ui** | `npx shadcn@latest add <name>`. Lives in `src/components/ui`. |
| Fonts | **Onest** via `next/font/google`, **Geist Mono** for session ids only | No other fonts. Do not add General Sans or other Fontshare (ITF FFL) fonts: their license forbids putting the files in a public repo. |
| Nav pill slide | **motion** | `import { motion } from "motion/react"`. Only for the navbar `layoutId` pill. |
| Number count-up, bar grow, heatmap replay | **anime.js v4** | `import { animate, stagger } from "animejs"` (named exports, v4 API). |
| Icons | **lucide-react** | Nothing else. |
| Validation | **zod** v4 | Every API input. |
| DB | **mongoose** | Through `src/server/db.ts` only. |
| Class merging | `cn()` from `@/lib/utils` | Never concatenate class strings by hand. |
| Dates | `Intl.DateTimeFormat` / `Intl.RelativeTimeFormat` | No date library. |

## 2. Libraries — avoid these

- **axios** → use `fetch`.
- **moment / dayjs / date-fns** → use `Intl`.
- **Redux / Zustand / Jotai** → server components + URL search params + local state are enough.
- **MUI, Chakra, Ant, styled-components, emotion** → conflicts with Tailwind/shadcn.
- **GSAP, react-spring, AOS** → we already have two animation libs; a third is noise.
- **Heavy chart libs (Chart.js, Highcharts)** → if a chart is needed, use shadcn charts (Recharts).
- **heatmap.js or similar** → we draw the heatmap ourselves; that's part of what's being evaluated.
- **Any package not in `package.json`** → ask before installing. State why it's needed.

## 3. UI & animation rules

DESIGN.md describes the UI **as it is in the code** (sections marked Built / Planned). These are the rules that are easy to break.

- **Don't redesign by accident.** The dashboard is deep black (`--frame #000`, `--app #0A0A0A`) with charcoal surfaces and glass controls; the demo store is a light Amazon-style "Northwind" site. Never change colors, layout, spacing, fonts, copy or styling unless the user asks. If code and DESIGN.md disagree, update the doc or ask; don't "fix" the code back to an older spec.
- **Honesty rule.** Every number shown in the dashboard must come from the database. No placeholder, decorative or example numbers, including in empty states, legends and skeletons.
- **Hatch texture** (utility exists, not used yet). Bars and progress fills use the 45° diagonal hatch (`hatch`: 1px sage lines at 35% opacity every 6px). The current/selected bar is solid sage. Never use the hatch as decoration.
- **Orange only in these places:** the logo mark, the primary button ("Open demo store"), the Live dot, click events (dots, timeline nodes, the click icon), and (Planned) a single highlighted bar per chart. Anything else orange is a bug. shadcn variants that default to `primary` (orange) must be given a non-primary variant.
- **Glass on controls only.** The `glass` / `glass-shine` utilities go on the nav, the Live pill, buttons, page chips, Journeys path chips and status pills; never on cards, the frame, or behind data. `glass` is translucent with `backdrop-filter: blur(14px)`; `backdrop-filter` is used nowhere else. Cards stay flat (1px border, no shadow). Timeline gap chips are plain `bg-panel-raised`, not glass.
- **App glow is the only decorative background.** The `app-glow` utility (two 5% radial gradients from `--glow-sage` / `--glow-orange`, fixed) sits on the app frame so glass has something to refract. Don't add other gradients, images or textures behind dashboard content.
- **Page headers:** every dashboard page starts with `PageTitle` (24px/500 `h1`) plus **one** muted sentence of real database numbers (streamed in `<Suspense>`). No greetings, no date pills, no decorative copy.
- **No all-caps.** No `uppercase` class or letter-spaced eyebrow labels. Sentence case everywhere.
- **Mono only for session ids** (Geist Mono). Other numbers use Onest with `tabular-nums`.
- **Motion budget.** Built: the nav pill slide (motion), the heatmap replay (anime.js), plus shadcn/sonner defaults that are kept as-is (skeleton `animate-pulse`, table-row `transition-colors`, sonner toasts). Planned: count-up, bar grow, live-dot pulse (DESIGN.md §9). Nothing else animates; other hovers are instant (no `transition-*` on buttons, tooltip, nav or timeline).
- Respect `prefers-reduced-motion`: CSS animations and transitions are cut globally; motion uses `MotionConfig reducedMotion="user"`; future JS animations must check `window.matchMedia` and render the final state.
- Colors come from CSS variables in `globals.css`. **No hex codes in dashboard components.**
- Every data card has three states: **loading** (skeleton in the card's shape), **empty** (message + "Open demo store"), **error** (message + retry).
- Mobile works at 375px with no page-level horizontal scroll. Journeys table below `sm`: only id, status, narrow "last seen"; the Path column needs `md`. The planned bento becomes a single column in the DESIGN.md §6 order; wide content scrolls inside its card, never the page.
- **Demo store (`public/demo`)** has its own design, defined in `store.css` (DESIGN.md §10); dashboard rules (tokens, glass, orange budget, no hex) don't apply there. Keep it static (no JS except `tracker.js`), keep every image a CSS background on a fixed-size box (no `<img>`, so layout never shifts), and credit every photo in `img/CREDITS.md` (Unsplash/Pexels license only). Product photos must have a plain white or light-grey studio background. Hero text must keep ≥ 4.5:1 contrast (worst case against the brightest pixel behind it); the `.hero::before` overlay provides it.
- **Heatmap accuracy:** plot only clicks recorded at one exact `viewport_w` at a time (no desktop/mobile buckets), rendered at that group's layout width (`layout_w`, else `viewport_w`) and its tallest `page_h`. Never mix widths in one view.
- **Seed data isolation:** `scripts/seed.ts` writes events with `source: "seed"` straight to MongoDB. `source` is not accepted by the public API (so it can't be spoofed). `npm run seed -- --clear` deletes only `source: "seed"`; `clean:test` explicitly excludes it. Whenever seed data exists the dashboard shows "Includes demo data".
- **Seed layout:** after any demo store layout change, re-run `scripts/capture-seed-layout.js` (Playwright tool) and save `window.__seedLayout` to `scripts/seed-layout.json`, then re-seed; otherwise seeded clicks stop matching the pages.
- **Automated visits to demo pages** (Playwright, screenshots, scripts) must add `?cf_preview=1` so the tracker sends nothing.

## 4. Code rules

- TypeScript strict. **No `any`.** Use `unknown` + zod parsing.
- Server Components by default. Add `"use client"` only for interactivity, and push it as deep as possible.
- Next.js 16: `params` and `searchParams` are **Promises** — `const { sessionId } = await params`.
- Cache Components is ON in `next.config.ts`. Do NOT add `export const runtime`, `dynamic`, `revalidate` or `fetchCache` to any route or page — the build fails with them. Node.js is already the default runtime.
- A GET Route Handler or Server Component that reads the database but no request data (`req`, `params`, `searchParams`, `headers()`) gets prerendered at build time. Call `await connection()` from `"next/server"` first to keep it request-time.
- Next 16 docs are in `node_modules/next/dist/docs/`. Check them before using any Next.js API (see `AGENTS.md`).
- Route files stay thin: parse → service → respond. Business logic lives in `src/server/services`.
- Use `ok()` / `fail()` helpers from `src/server/http.ts` for every response (single envelope).
- Mongo connection is cached on `globalThis` to survive hot reload. Never call `mongoose.connect` elsewhere.
- Use `.lean()` on read queries. Sorting is always explicit.
- File names: `kebab-case.tsx`. Components: `PascalCase`. One component per file.
- `tracker.js` is plain ES2017, no dependencies, wrapped in an IIFE, about 5 KB unminified (mostly comments).
- **Tracker privacy:** a click's `target` is tag + #id/.class + up to 60 chars of visible text. Never send text or values of `input`/`select`/`textarea`, and for an element that contains a form field use only its own text nodes. Without a matching element, send only tag + id/class, no text.
- **Tracker cache-busting:** every `public/demo` page loads the tracker as `/tracker.js?v=N`. **Bump N in all demo pages whenever `tracker.js` changes** (current: `v=3`). `/tracker.js` itself is served with `Cache-Control: public, max-age=300` (`next.config.ts` `headers()`).
- Any future automated browser or script test (Playwright, smoke scripts, console snippets) must use page URLs under `/__test/` (e.g. `http://localhost:3000/__test/load-more`), so `npm run clean:test` removes them.
- NEVER run git commit, git push, or any git command that changes history. The user commits manually. When a task is done, suggest a commit message in the format `feat(api): add sessions endpoint` and stop.

## 5. Error handling

### In the app
- **API:** wrap each handler in `try/catch`. `ZodError` → `400` with the first issue's message. Unknown session → `404`. Anything else → log with `console.error("[api/<route>]", err)` and return `500` with a generic message. **Never leak stack traces or Mongo errors to the client.**
- **Tracker:** every public function wrapped in `try/catch`; errors are swallowed (optionally `console.debug` when `data-debug` is set). The host page must never break because of us.
- **Dashboard:** each route segment has `error.tsx` (with retry) and `loading.tsx` (Skeletons). Client fetches show a toast (`sonner`) on failure.
- **Validation:** reject events with `timestamp` more than 24h in the future, coordinates < 0, or unknown `event_type`. Cap batch size at 50.

### For AI (Claude) working in this repo
1. **Read `docs/MEMORY.md` first, every session.** Update it when a task is done.
2. **Do not invent APIs.** If unsure how a library works in its installed version, check `node_modules/<pkg>/package.json` and the types, or ask. anime.js v4, motion, zod v4, Next 16, and Tailwind v4 all changed APIs from older tutorials.
3. **Do not install packages silently.** Propose it, say why, wait.
4. **After every change, run `npm run build` (or `npx tsc --noEmit` + `npm run lint`)** and fix errors before saying "done". Never report a task done with failing types or lint.
5. **When an error appears, read the full message, find the root cause, fix that.** Do not wrap it in `try/catch` to hide it, do not add `// @ts-ignore`, do not use `as any`.
6. **If the same fix fails twice, stop and explain** what was tried and what the error says, instead of trying a third random variation.
7. **Stay in the current phase.** Do not build Phase 5 polish while Phase 2 is unfinished.
8. **Do not edit `docs/` files other than `MEMORY.md`** without asking. They are the spec.
9. **Never commit `.env.local`** or any secret.
10. **Keep diffs small.** Change only files related to the task. No drive-by refactors.
