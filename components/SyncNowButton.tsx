"use client";

// The one client component in the ClickUp ingestion feature: fires the
// manual sync (POST /internal/sync) and reports the run summary inline.
// Rendered only on /internal, so the request rides the Basic-auth
// credentials the middleware already collected.

import { useState } from "react";

interface SyncSummary {
  projects: number;
  statusUpdates: number;
  requests: number;
  warnings: string[];
}

type SyncState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; summary: SyncSummary }
  | { phase: "error"; message: string };

export default function SyncNowButton({
  lastSyncedAt,
}: {
  lastSyncedAt: string | null;
}) {
  const [state, setState] = useState<SyncState>({ phase: "idle" });

  async function trigger() {
    setState({ phase: "running" });
    try {
      const res = await fetch("/internal/sync", { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setState({
          phase: "error",
          message: body?.error ?? `Sync failed (${res.status}).`,
        });
        return;
      }
      setState({ phase: "done", summary: body as SyncSummary });
    } catch {
      setState({ phase: "error", message: "Network error — sync may still be running." });
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={trigger}
          disabled={state.phase === "running"}
          className="inline-flex items-center gap-2 rounded-lg bg-ui-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-ui-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.phase === "running" ? "Syncing… (~1 min)" : "Sync ClickUp now"}
        </button>
        {lastSyncedAt && state.phase === "idle" && (
          <span className="text-xs text-ink-muted">
            Last synced{" "}
            {new Date(lastSyncedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      {state.phase === "done" && (
        <p className="text-xs text-ink-muted">
          Synced {state.summary.projects} projects,{" "}
          {state.summary.statusUpdates} status updates,{" "}
          {state.summary.requests} requests.
          {state.summary.warnings.length > 0 &&
            ` ${state.summary.warnings.length} warning(s): ${state.summary.warnings.join("; ")}`}
        </p>
      )}
      {state.phase === "error" && (
        <p className="text-xs text-red-700">{state.message}</p>
      )}
    </div>
  );
}
