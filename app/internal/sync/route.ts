// POST /internal/sync — manual ClickUp sync trigger (ADR 0004).
//
// Lives under /internal so the existing Basic-auth middleware covers it
// (fails closed 503 when credentials are unset). Used by the "Sync now"
// button on /internal and by the host cron:
//
//   curl -s -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASS" -X POST \
//     https://aispeg.insight.uidaho.edu/internal/sync

import { NextResponse } from "next/server";
import { runSync } from "@/lib/clickup-sync";

// A sync takes ~30-60s of sequential ClickUp calls; overlapping runs
// would double-write and burn rate limit for nothing. One at a time.
let syncInFlight = false;

export async function POST() {
  if (!process.env.CLICKUP_API_TOKEN) {
    return NextResponse.json(
      { error: "CLICKUP_API_TOKEN is not configured on this deployment." },
      { status: 503 }
    );
  }
  if (syncInFlight) {
    return NextResponse.json(
      { error: "A sync is already running." },
      { status: 409 }
    );
  }

  syncInFlight = true;
  try {
    const summary = await runSync("manual");
    return NextResponse.json(summary);
  } catch (err) {
    console.error("POST /internal/sync failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed." },
      { status: 500 }
    );
  } finally {
    syncInFlight = false;
  }
}
