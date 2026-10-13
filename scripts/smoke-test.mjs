// Phase 1 API smoke test. Needs the app running (`npm run dev`) and a reachable MONGODB_URI.
// Usage: npm run smoke   (override the target with BASE_URL=http://host:port)

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const runId = crypto.randomUUID();
const pageA = `https://smoke.example/${runId}/a`;
const pageB = `https://smoke.example/${runId}/b`;
const sessionA = crypto.randomUUID();
const sessionB = crypto.randomUUID();
const now = Date.now();

let failures = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    failures++;
    console.log(`✗ ${name}\n    ${err instanceof Error ? err.message : String(err)}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function postEvents(body) {
  return fetch(`${BASE}/api/events`, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, body: await res.json() };
}

async function expectStatus(res, status) {
  const body = await res.json().catch(() => null);
  assert(res.status === status, `expected ${status}, got ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

const pageView = (session_id, page_url, offsetMs) => ({
  session_id,
  event_type: "page_view",
  page_url,
  timestamp: new Date(now + offsetMs).toISOString(),
});

const click = (session_id, page_url, offsetMs, x, y) => ({
  session_id,
  event_type: "click",
  page_url,
  timestamp: new Date(now + offsetMs).toISOString(),
  x,
  y,
  viewport_w: 1280,
  viewport_h: 800,
  page_h: 2000,
});

// Finds a session in the list by following cursors (the list is global, newest first).
async function findSession(sessionId) {
  let cursor = "";
  for (let page = 0; page < 20; page++) {
    const { status, body } = await get(`/api/sessions?limit=100${cursor ? `&cursor=${cursor}` : ""}`);
    assert(status === 200, `sessions list returned ${status}`);
    const found = body.data.sessions.find((s) => s.session_id === sessionId);
    if (found) return found;
    if (!body.data.nextCursor) break;
    cursor = body.data.nextCursor;
  }
  throw new Error(`session ${sessionId} not found in sessions list`);
}

console.log(`Smoke testing ${BASE} (run ${runId})\n`);

// --- Validation: all 400 ---
await test("bad JSON → 400", async () => {
  await expectStatus(await postEvents("{not json"), 400);
});
await test("unknown event_type → 400", async () => {
  await expectStatus(await postEvents({ ...pageView(sessionA, pageA, 0), event_type: "scroll" }), 400);
});
await test("click without x → 400", async () => {
  const noX = click(sessionA, pageA, 0, 10, 10);
  delete noX.x;
  await expectStatus(await postEvents(noX), 400);
});
await test("invalid URL → 400", async () => {
  await expectStatus(await postEvents(pageView(sessionA, "not a url", 0)), 400);
});
await test("batch of 51 → 400", async () => {
  const batch = Array.from({ length: 51 }, (_, i) => pageView(sessionA, pageA, i));
  await expectStatus(await postEvents(batch), 400);
});
await test("heatmap without page_url → 400", async () => {
  const { status } = await get("/api/heatmap");
  assert(status === 400, `expected 400, got ${status}`);
});
await test("sessions limit=0 → 400", async () => {
  const { status } = await get("/api/sessions?limit=0");
  assert(status === 400, `expected 400, got ${status}`);
});
await test("body over 64 KB → 413", async () => {
  await expectStatus(await postEvents("x".repeat(70 * 1024)), 413);
});

// --- CORS ---
await test("OPTIONS /api/events → 204 with CORS header", async () => {
  const res = await fetch(`${BASE}/api/events`, {
    method: "OPTIONS",
    headers: { origin: "https://smoke.example", "access-control-request-method": "POST" },
  });
  assert(res.status === 204, `expected 204, got ${res.status}`);
  assert(res.headers.get("access-control-allow-origin"), "missing Access-Control-Allow-Origin");
});

// --- Inserts ---
await test("single event → 201 inserted 1", async () => {
  const body = await expectStatus(await postEvents(pageView(sessionA, pageA, 0)), 201);
  assert(body.data.inserted === 1, `expected inserted 1, got ${body.data.inserted}`);
});
await test("batch of 3 (out of order) → 201 inserted 3", async () => {
  const batch = [
    click(sessionB, `${pageA}?utm=smoke#hero`, 2000, 100, 200),
    pageView(sessionB, pageA, 0),
    click(sessionB, pageB, 1000, 300, 400),
  ];
  const body = await expectStatus(await postEvents(batch), 201);
  assert(body.data.inserted === 3, `expected inserted 3, got ${body.data.inserted}`);
});

// --- Reads ---
await test("session journey is sorted by timestamp", async () => {
  const { status, body } = await get(`/api/sessions/${sessionB}/events`);
  assert(status === 200, `expected 200, got ${status}`);
  const times = body.data.map((e) => Date.parse(e.timestamp));
  assert(times.length === 3, `expected 3 events, got ${times.length}`);
  assert(times.every((t, i) => i === 0 || times[i - 1] <= t), `not sorted: ${body.data.map((e) => e.timestamp)}`);
  assert(body.data[0].event_type === "page_view", "first event should be the page_view");
});

await test("sessions list counts match inserts", async () => {
  const a = await findSession(sessionA);
  assert(a.event_count === 1 && a.page_view_count === 1 && a.click_count === 0, `session A counts: ${JSON.stringify(a)}`);
  const b = await findSession(sessionB);
  assert(b.event_count === 3 && b.page_view_count === 1 && b.click_count === 2, `session B counts: ${JSON.stringify(b)}`);
  assert(b.pages.length === 2, `session B should have 2 pages, got ${JSON.stringify(b.pages)}`);
});

await test("pagination cursor returns a different session on page 2", async () => {
  const first = await get("/api/sessions?limit=1");
  assert(first.status === 200, `page 1 returned ${first.status}`);
  const cursor = first.body.data.nextCursor;
  assert(cursor, "page 1 has no nextCursor");
  const second = await get(`/api/sessions?limit=1&cursor=${cursor}`);
  assert(second.status === 200, `page 2 returned ${second.status}`);
  const [s1] = first.body.data.sessions;
  const [s2] = second.body.data.sessions;
  assert(s2 && s1.session_id !== s2.session_id, "page 2 returned the same session as page 1");
});

await test("unknown session → 404", async () => {
  const { status } = await get(`/api/sessions/${crypto.randomUUID()}/events`);
  assert(status === 404, `expected 404, got ${status}`);
});

await test("heatmap returns only clicks for that page and ignores ?query", async () => {
  const { status, body } = await get(`/api/heatmap?page_url=${encodeURIComponent(`${pageA}?ignored=1`)}`);
  assert(status === 200, `expected 200, got ${status}`);
  assert(body.data.page_url === pageA, `page_url not normalized: ${body.data.page_url}`);
  assert(body.data.clicks.length === 1, `expected 1 click, got ${body.data.clicks.length}`);
  const [point] = body.data.clicks;
  assert(point.x === 100 && point.y === 200, `wrong click: ${JSON.stringify(point)}`);
});

console.log(failures ? `\n${failures} test(s) failed` : "\nAll tests passed");
process.exitCode = failures ? 1 : 0;
