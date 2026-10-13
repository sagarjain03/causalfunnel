// Removes test sessions from the events collection.
// Usage: npm run clean:test            → dry run, deletes nothing
//        npm run clean:test -- --yes   → deletes the matching sessions
//
// A session is "test data" if ANY of its events is on a test URL. All events of such a session are removed,
// so no half-sessions remain in the dashboard.

import mongoose from "mongoose";

// Test URLs. "smoke.example" must be followed by "/", ":" or the end, so look-alike hosts (smoke.example.com) never match.
const TEST_URL_FILTER = {
  $or: [
    { page_url: { $regex: /^https:\/\/smoke\.example(?=[/:]|$)/ } }, // npm run smoke
    { page_url: { $regex: /\/__test\// } }, // automated browser/script tests (RULES §4)
    { page_url: { $regex: /\/demo\/spa-step$/ } }, // Phase 2 Playwright SPA check; not a real demo page
  ],
};

const confirmed = process.argv.includes("--yes");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (expected in .env.local)");

  await mongoose.connect(uri);
  const events = mongoose.connection.collection("events");

  // 1. Sessions touched by a test URL. 2. Every event of those sessions (same filter for report and delete).
  const sessionIds = await events.distinct("session_id", TEST_URL_FILTER);
  if (sessionIds.length === 0) {
    console.log("No test sessions found. Nothing to do.");
    return;
  }
  const sessionFilter = { session_id: { $in: sessionIds } };

  const bySession = await events
    .aggregate([
      { $match: sessionFilter },
      { $group: { _id: "$session_id", events: { $sum: 1 }, pages: { $addToSet: "$page_url" } } },
      { $project: { _id: 0, session_id: "$_id", events: 1, pages: 1 } },
      { $sort: { session_id: 1 } },
    ])
    .toArray();
  const totalEvents = bySession.reduce((sum, row) => sum + row.events, 0);

  console.table(
    bySession.map((row) => ({
      session_id: row.session_id,
      events: row.events,
      pages: row.pages.map((url) => new URL(url).host + new URL(url).pathname).sort().join(", "),
    })),
  );
  console.log(`Matched ${totalEvents} event(s) across ${sessionIds.length} session(s).`);

  if (!confirmed) {
    console.log("\nDry run: nothing deleted. Re-run with --yes to delete:  npm run clean:test -- --yes");
    return;
  }

  const { deletedCount } = await events.deleteMany(sessionFilter);
  console.log(`\nDeleted ${deletedCount} event(s).`);
}

try {
  await main();
  process.exitCode = 0;
} catch (err) {
  console.error("clean:test failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
