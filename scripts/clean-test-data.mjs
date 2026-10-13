// Removes test events (smoke test + /__test/ pages) from the events collection.
// Usage: npm run clean:test            → dry run, deletes nothing
//        npm run clean:test -- --yes   → deletes the matching events

import mongoose from "mongoose";

// The ONLY events this script may touch. The same filter is used for the report and the delete.
// "smoke.example" must be followed by "/" , ":" or the end, so look-alike hosts (smoke.example.com) never match.
const TEST_FILTER = {
  $or: [{ page_url: { $regex: /^https:\/\/smoke\.example(?=[/:]|$)/ } }, { page_url: { $regex: /\/__test\// } }],
};

const confirmed = process.argv.includes("--yes");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (expected in .env.local)");

  await mongoose.connect(uri);
  const events = mongoose.connection.collection("events");

  const byPage = await events
    .aggregate([
      { $match: TEST_FILTER },
      { $group: { _id: "$page_url", events: { $sum: 1 }, sessions: { $addToSet: "$session_id" } } },
      { $project: { _id: 0, page_url: "$_id", events: 1, sessions: { $size: "$sessions" } } },
      { $sort: { page_url: 1 } },
    ])
    .toArray();
  const totalEvents = byPage.reduce((sum, row) => sum + row.events, 0);
  const totalSessions = (await events.distinct("session_id", TEST_FILTER)).length;

  if (totalEvents === 0) {
    console.log("No test events found. Nothing to do.");
    return;
  }

  console.table(byPage);
  console.log(`Matched ${totalEvents} event(s) across ${totalSessions} session(s) on ${byPage.length} page(s).`);

  if (!confirmed) {
    console.log("\nDry run: nothing deleted. Re-run with --yes to delete:  npm run clean:test -- --yes");
    return;
  }

  const { deletedCount } = await events.deleteMany(TEST_FILTER);
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
