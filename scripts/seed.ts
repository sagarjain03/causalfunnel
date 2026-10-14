// Seeds ~150 realistic demo journeys (source: "seed") into the events collection.
//
//   npm run seed                                   re-seed (removes old seed data first), page URLs on http://localhost:3000
//   npm run seed -- --origin https://app.example   page URLs on another origin (so deployed previews load)
//   npm run seed -- --clear                        remove seed data only
//   npm run seed:prod -- --origin https://app.example   same, against .env.production.local; --origin is required
//
// Click coordinates come from scripts/seed-layout.json: real element boxes captured from the demo store with Playwright
// (scripts/capture-seed-layout.js), so every seeded click lands on the element its `target` names.
// Only events with source: "seed" are ever deleted here, and real tracker events can't carry that field.
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

type PageKey = "home" | "products" | "product" | "checkout";
type Kind = "nav" | "input" | "button" | "product" | "link";
type Point = [number, number];
type Element = { kind: Kind; target: string; to: PageKey | null; points: Point[] };
type WidthLayout = { viewport_w: number; viewport_h: number; layout_w: number; page_h: number; elements: Element[] };
type Layout = { generatedAt: string; pages: Record<PageKey, { path: string; widths: Record<string, WidthLayout> }> };

type SeedEvent = {
  session_id: string;
  event_type: "page_view" | "click";
  page_url: string;
  timestamp: Date;
  received_at: Date;
  source: "seed";
  referrer?: string;
  x?: number;
  y?: number;
  viewport_w?: number;
  viewport_h?: number;
  layout_w?: number;
  page_h?: number;
  target?: string;
};

const JOURNEYS = 150;
const DAYS = 28;
const DESKTOP_SHARE = 0.65;
const DESKTOP_WIDTHS = [1536, 1366, 1280];
const MOBILE_WIDTHS = [390, 375];
// Funnel (share of ALL journeys): Home 100% → Products 70% → Product 45% → Checkout 18%.
// Exact shares: journeys are dealt from a shuffled deck with these counts, so a run of 150 hits the targets
// instead of drifting with sampling noise.
const SHARE_PRODUCTS = 0.7;
const SHARE_PRODUCT = 0.45;
const SHARE_CHECKOUT = 0.18;
const SHARE_BOUNCE = 0.15; // half of the 30% who never reach Products leave without a single click
const P_BACK_TO_PRODUCTS = 0.25; // product → products → another product
const KIND_WEIGHT: Record<Kind, number> = { button: 5, product: 5, input: 2.5, nav: 1.5, link: 0.7 };
// Visits by local hour (evenings busier) and weekday (weekends busier).
const HOUR_WEIGHT = [1, 0.5, 0.3, 0.2, 0.2, 0.3, 0.6, 1, 1.5, 2, 2.2, 2.4, 2.6, 2.4, 2.2, 2.2, 2.5, 3, 4, 4.8, 5, 4.6, 3.4, 2];
const WEEKEND_WEIGHT = 1.7;
const REFERRERS = ["https://www.google.com/", "https://www.google.com/", "https://www.instagram.com/", "https://www.youtube.com/", "", "", ""];

// --- args -------------------------------------------------------------------------------------------------------------
const args = process.argv.slice(2);
const clearOnly = args.includes("--clear");
// seed:prod passes --require-origin: seeding a deployed database with localhost URLs would make the heatmap
// preview load pages that do not exist there, so it refuses to run without an explicit --origin.
if (args.includes("--require-origin") && !args.some((a) => a === "--origin" || a.startsWith("--origin="))) {
  console.error("seed:prod needs the deployed site's origin: npm run seed:prod -- --origin https://your-app.example");
  process.exit(1);
}
function originFromArgs(): string {
  const eq = args.find((a) => a.startsWith("--origin="));
  if (eq) return eq.slice("--origin=".length);
  const i = args.indexOf("--origin");
  if (i === -1) return "http://localhost:3000";
  const value = args[i + 1];
  if (!value || value.startsWith("--")) throw new Error("--origin needs a URL, e.g. --origin https://app.example");
  return value;
}
const origin = new URL(originFromArgs()).origin;

// --- deterministic random -----------------------------------------------------------------------------------------------
let state = 20261014;
function rand(): number {
  // mulberry32
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];
function weighted<T>(items: T[], weight: (item: T) => number): T | undefined {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let r = rand() * total;
  for (const item of items) {
    r -= weight(item);
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

// --- journey generation -------------------------------------------------------------------------------------------------
const layout = JSON.parse(readFileSync(new URL("./seed-layout.json", import.meta.url), "utf8")) as Layout;

function startTime(now: number): number {
  for (;;) {
    const day = new Date(now - int(0, DAYS - 1) * 86_400_000);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    if (rand() > (weekend ? 1 : 1 / WEEKEND_WEIGHT)) continue;
    const hour = weighted([...HOUR_WEIGHT.keys()], (h) => HOUR_WEIGHT[h]) ?? 20;
    day.setHours(hour, int(0, 59), int(0, 59), int(0, 999));
    if (day.getTime() < now - 2 * 3_600_000) return day.getTime(); // leave room for the journey to end in the past
  }
}

type Plan = { depth: "bounce" | "home" | "products" | "product" | "checkout"; desktop: boolean };

/** Shuffled deck of journey plans with exact funnel and device shares. */
function dealPlans(): Plan[] {
  const n = (share: number) => Math.round(JOURNEYS * share);
  const checkout = n(SHARE_CHECKOUT);
  const product = n(SHARE_PRODUCT) - checkout;
  const products = n(SHARE_PRODUCTS) - n(SHARE_PRODUCT);
  const bounce = n(SHARE_BOUNCE);
  const home = JOURNEYS - checkout - product - products - bounce;
  const depths: Plan["depth"][] = [
    ...Array<Plan["depth"]>(checkout).fill("checkout"),
    ...Array<Plan["depth"]>(product).fill("product"),
    ...Array<Plan["depth"]>(products).fill("products"),
    ...Array<Plan["depth"]>(home).fill("home"),
    ...Array<Plan["depth"]>(bounce).fill("bounce"),
  ];
  const desktop = shuffle(Array.from({ length: JOURNEYS }, (_, i) => i < n(DESKTOP_SHARE)));
  return shuffle(depths).map((depth, i) => ({ depth, desktop: desktop[i] }));
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function pagePath(depth: Plan["depth"]): PageKey[] {
  if (depth === "bounce" || depth === "home") return ["home"];
  const path: PageKey[] = ["home", "products"];
  if (depth === "products") return path;
  path.push("product");
  if (rand() < P_BACK_TO_PRODUCTS) path.push("products", "product");
  if (depth === "checkout") path.push("checkout");
  return path;
}

function clickAt(el: Element, w: WidthLayout, sessionId: string, url: string, ts: number): SeedEvent {
  const [px, py] = pick(el.points);
  return {
    session_id: sessionId,
    event_type: "click",
    page_url: url,
    timestamp: new Date(ts),
    received_at: new Date(ts + int(40, 400)),
    source: "seed",
    x: Math.max(0, px + int(-2, 2)),
    y: Math.max(0, py + int(-2, 2)),
    viewport_w: w.viewport_w,
    viewport_h: w.viewport_h,
    layout_w: w.layout_w,
    page_h: w.page_h,
    target: el.target,
  };
}

function journey(plan: Plan, now: number): SeedEvent[] {
  const sessionId = randomUUID();
  const width = String(plan.desktop ? pick(DESKTOP_WIDTHS) : pick(MOBILE_WIDTHS));
  const pages = pagePath(plan.depth);
  const bounce = plan.depth === "bounce";
  const events: SeedEvent[] = [];
  let t = startTime(now);

  pages.forEach((key, i) => {
    const page = layout.pages[key];
    const w = page.widths[width];
    const url = origin + page.path;
    const next = pages[i + 1];
    const referrer = i === 0 ? pick(REFERRERS) : undefined;
    events.push({
      session_id: sessionId,
      event_type: "page_view",
      page_url: url,
      timestamp: new Date(t),
      received_at: new Date(t + int(40, 400)),
      source: "seed",
      ...(referrer ? { referrer } : {}),
    });
    if (bounce) return;

    const dwell = int(5_000, 90_000);
    const clicks = int(2, 12);
    // Clicks that stay on the page: never on elements that would navigate away.
    const stay = w.elements.filter((e) => e.to === null || e.to === key);
    const offsets = Array.from({ length: clicks }, () => int(800, dwell)).sort((a, b) => a - b);
    const leaveVia = next ? weighted(w.elements.filter((e) => e.to === next), (e) => KIND_WEIGHT[e.kind]) : undefined;
    offsets.forEach((offset, c) => {
      const isLast = c === offsets.length - 1;
      const el = isLast && leaveVia ? leaveVia : weighted(stay, (e) => KIND_WEIGHT[e.kind]);
      if (el) events.push(clickAt(el, w, sessionId, url, t + offset));
    });
    t += Math.max(dwell, offsets[offsets.length - 1] ?? 0) + int(400, 1_500);
  });
  return events;
}

// --- run ---------------------------------------------------------------------------------------------------------------
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (expected in .env.local, or .env.production.local for seed:prod)");
  await mongoose.connect(uri);
  const events = mongoose.connection.collection<SeedEvent>("events");
  await events.createIndex({ source: 1 }, { sparse: true });

  const { deletedCount } = await events.deleteMany({ source: "seed" });
  if (clearOnly) {
    console.log(`Removed ${deletedCount} seed event(s). Nothing else was touched.`);
    return;
  }
  if (deletedCount) console.log(`Removed ${deletedCount} old seed event(s) first.`);

  const now = Date.now();
  const docs = dealPlans().flatMap((plan) => journey(plan, now));
  for (let i = 0; i < docs.length; i += 1000) await events.insertMany(docs.slice(i, i + 1000));

  // Report from the database, not from the generator.
  const [report] = await events
    .aggregate<{ journeys: number; events: number; clicks: number; home: number; products: number; product: number; checkout: number; bounces: number; desktop: number; mobile: number }>([
      { $match: { source: "seed" } },
      {
        $group: {
          _id: "$session_id",
          events: { $sum: 1 },
          clicks: { $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] } },
          pages: { $addToSet: "$page_url" },
          width: { $max: "$viewport_w" },
        },
      },
      {
        $group: {
          _id: null,
          journeys: { $sum: 1 },
          events: { $sum: "$events" },
          clicks: { $sum: "$clicks" },
          home: { $sum: { $cond: [{ $in: [`${origin}/demo`, "$pages"] }, 1, 0] } },
          products: { $sum: { $cond: [{ $in: [`${origin}/demo/products.html`, "$pages"] }, 1, 0] } },
          product: { $sum: { $cond: [{ $in: [`${origin}/demo/product.html`, "$pages"] }, 1, 0] } },
          checkout: { $sum: { $cond: [{ $in: [`${origin}/demo/checkout.html`, "$pages"] }, 1, 0] } },
          bounces: { $sum: { $cond: [{ $eq: ["$events", 1] }, 1, 0] } },
          // Width is only known from clicks (page views carry no screen size), so bounced journeys count as neither.
          desktop: { $sum: { $cond: [{ $gte: ["$width", 768] }, 1, 0] } },
          mobile: { $sum: { $cond: [{ $and: [{ $gt: ["$width", 0] }, { $lt: ["$width", 768] }] }, 1, 0] } },
        },
      },
    ])
    .toArray();

  const pct = (n: number) => `${((100 * n) / report.journeys).toFixed(1)}%`;
  console.log(`Seeded on ${origin} (layout captured ${layout.generatedAt})`);
  console.log(`Journeys: ${report.journeys}   Events: ${report.events}   Clicks: ${report.clicks}`);
  console.log(`Funnel: Home ${pct(report.home)} → Products ${pct(report.products)} → Product ${pct(report.product)} → Checkout ${pct(report.checkout)}`);
  const withClicks = report.desktop + report.mobile;
  const share = (n: number) => `${((100 * n) / withClicks).toFixed(1)}%`;
  console.log(`Bounced (1 page view, no clicks): ${pct(report.bounces)}`);
  console.log(`Devices (journeys with clicks, n=${withClicks}): desktop ${share(report.desktop)}, mobile ${share(report.mobile)}`);
}

try {
  await main();
} catch (err) {
  console.error("seed failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
