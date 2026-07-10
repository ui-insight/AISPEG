// scripts/sync-clickup.ts
//
// Pulls the IIDS-AI4UI ClickUp space into Postgres: per-project status
// updates + ROI (clickup_projects, clickup_status_updates) and the scored
// intake backlog (clickup_requests). Read-only against ClickUp; upserts
// keyed by ClickUp ids so re-runs are idempotent. See ADR 0003.
//
// Env:
//   DATABASE_URL        — required
//   CLICKUP_API_TOKEN   — required (personal token with read access to the
//                         IIDS-AI4UI space)
//   MINDROUTER_API_KEY  — optional; generates the public status summaries
//                         (without it, sync still runs and summaries keep
//                         their previous value, with a warning per project)
//
// Usage:
//   npm run sync:clickup
//
// In production the same engine runs via POST /internal/sync (Basic auth),
// which the host cron curls — see ADR 0003.

import { pool } from "../lib/db.js";
import { runSync } from "../lib/clickup-sync.js";

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  if (!process.env.CLICKUP_API_TOKEN) {
    console.error("CLICKUP_API_TOKEN is not set (see .env.example).");
    process.exit(1);
  }

  console.log("Syncing ClickUp (IIDS-AI4UI space) → Postgres ...\n");
  const summary = await runSync("cron");

  console.log(
    `\nSynced ${summary.projects} projects, ${summary.statusUpdates} status updates, ${summary.requests} requests (run #${summary.runId}).`
  );
  if (summary.warnings.length > 0) {
    console.warn(`\n${summary.warnings.length} warning(s):`);
    for (const warning of summary.warnings) console.warn(`  ! ${warning}`);
  }
}

main()
  .catch((err) => {
    console.error("sync-clickup failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
