// /internal/agent-log — auth-gated review of recent /api/ask traffic.
// Slice #113 of Epic #107.
//
// The middleware (middleware.ts) gates /internal/* with basic auth.
// Reads from agent_queries (Migration 009).

import Link from "next/link";
import {
  getAgentSummary,
  listRecentAgentQueries,
  type AgentLogRow,
  type AgentOutcome,
} from "@/lib/agent/log";

export const dynamic = "force-dynamic";

interface SearchParams {
  outcome?: string;
  sort?: string;
  limit?: string;
}

const VALID_OUTCOMES: AgentOutcome[] = [
  "ok",
  "mindrouter_error",
  "tool_error",
  "rate_limited",
  "bad_request",
  "unconfigured",
  "internal_error",
];

const OUTCOME_TONE: Record<AgentOutcome, string> = {
  ok: "bg-emerald-50 text-emerald-700",
  mindrouter_error: "bg-amber-50 text-amber-800",
  tool_error: "bg-amber-50 text-amber-800",
  rate_limited: "bg-amber-50 text-amber-800",
  bad_request: "bg-gray-100 text-gray-700",
  unconfigured: "bg-gray-100 text-gray-700",
  internal_error: "bg-rose-50 text-rose-700",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function truncate(s: string | null, n: number): string {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
        (active
          ? "border-ui-charcoal bg-ui-charcoal text-brand-white"
          : "border-gray-200 bg-white text-gray-700 hover:border-ui-gold/40")
      }
    >
      {label}
    </Link>
  );
}

export default async function AgentLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const outcomeFilter = VALID_OUTCOMES.includes(sp.outcome as AgentOutcome)
    ? (sp.outcome as AgentOutcome)
    : undefined;
  const sort = sp.sort === "slowest" ? "slowest" : "recent";
  const limit = (() => {
    const parsed = sp.limit ? Number.parseInt(sp.limit, 10) : 100;
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 500) : 100;
  })();

  let summary: Awaited<ReturnType<typeof getAgentSummary>> | null = null;
  let rows: AgentLogRow[] = [];
  let error: string | null = null;

  try {
    [summary, rows] = await Promise.all([
      getAgentSummary(),
      listRecentAgentQueries({ outcome: outcomeFilter, sort, limit }),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  function buildHref(updates: Partial<SearchParams>): string {
    const next = new URLSearchParams();
    const merged = { outcome: outcomeFilter, sort, limit: String(limit), ...updates };
    if (merged.outcome) next.set("outcome", merged.outcome);
    if (merged.sort && merged.sort !== "recent") next.set("sort", merged.sort);
    if (merged.limit && merged.limit !== "100") next.set("limit", merged.limit);
    const qs = next.toString();
    return qs ? `/internal/agent-log?${qs}` : "/internal/agent-log";
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-ui-gold-dark">
          IIDS Internal · Agent log
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ui-charcoal">
          Conversational agent traffic
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-700">
          Recent queries to <code>/api/ask</code>, logged via Migration 009.
          IPs are stored as a salted SHA-256 hash, not raw addresses.
          Use this view to see what stakeholders are asking, where the
          agent is failing, and where to tune the system prompt or add
          tool coverage.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          <p className="font-semibold">Couldn&apos;t load agent log.</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-xs text-rose-700">
            Migration 009 may not be applied to this database — run{" "}
            <code>npm run migrate</code> against the dev DB.
          </p>
        </div>
      )}

      {summary && (
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Last 24h
            </p>
            <p className="mt-1 text-3xl font-black text-ui-charcoal">
              {summary.total24h}
            </p>
            <p className="mt-2 text-xs text-gray-500">queries</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Median latency (24h)
            </p>
            <p className="mt-1 text-3xl font-black text-ui-charcoal">
              {(summary.p50LatencyMs / 1000).toFixed(1)}s
            </p>
            <p className="mt-2 text-xs text-gray-500">
              p95 {(summary.p95LatencyMs / 1000).toFixed(1)}s
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Successes (24h)
            </p>
            <p className="mt-1 text-3xl font-black text-emerald-700">
              {summary.byOutcome.ok ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Failures (24h)
            </p>
            <p className="mt-1 text-3xl font-black text-rose-700">
              {Object.entries(summary.byOutcome)
                .filter(([k]) => k !== "ok")
                .reduce((sum, [, n]) => sum + (n ?? 0), 0)}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {(summary.byOutcome.mindrouter_error ?? 0)} MindRouter ·{" "}
              {(summary.byOutcome.tool_error ?? 0)} tool ·{" "}
              {(summary.byOutcome.rate_limited ?? 0)} rate-limited
            </p>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-wider text-gray-500">
            Outcome:
          </span>
          <FilterChip
            label="All"
            href={buildHref({ outcome: undefined })}
            active={!outcomeFilter}
          />
          {VALID_OUTCOMES.map((o) => (
            <FilterChip
              key={o}
              label={o.replace(/_/g, " ")}
              href={buildHref({ outcome: o })}
              active={outcomeFilter === o}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-wider text-gray-500">
            Sort:
          </span>
          <FilterChip
            label="Most recent"
            href={buildHref({ sort: "recent" })}
            active={sort === "recent"}
          />
          <FilterChip
            label="Slowest first"
            href={buildHref({ sort: "slowest" })}
            active={sort === "slowest"}
          />
        </div>
      </section>

      <section className="space-y-3">
        {rows.length === 0 && !error && (
          <p className="text-sm text-gray-600">
            No queries logged yet for the current filter.
          </p>
        )}
        {rows.map((r) => (
          <article
            key={r.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                    OUTCOME_TONE[r.outcome]
                  }
                >
                  {r.outcome}
                </span>
                <span className="text-xs text-gray-500">
                  HTTP {r.httpStatus} · {r.latencyMs} ms · {r.iterations} iter
                  {r.truncated ? " (truncated)" : ""}
                </span>
              </div>
              <span className="text-xs text-gray-500">{fmtDate(r.createdAt)}</span>
            </header>

            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                User
              </p>
              <p className="whitespace-pre-wrap text-sm text-ink">
                {truncate(r.message, 600)}
              </p>
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Assistant
              </p>
              <p className="whitespace-pre-wrap text-sm text-ink">
                {truncate(r.response, 1200)}
              </p>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-gray-600 md:grid-cols-3">
              <div>
                <span className="font-medium text-gray-500">Tools:</span>{" "}
                {r.toolCalls.length === 0 ? (
                  <span className="text-gray-400">none</span>
                ) : (
                  r.toolCalls.join(", ")
                )}
              </div>
              <div>
                <span className="font-medium text-gray-500">Citations:</span>{" "}
                {r.citationCount}
              </div>
              <div>
                <span className="font-medium text-gray-500">Model:</span>{" "}
                <code className="text-[11px]">{r.model ?? "—"}</code>
              </div>
            </div>

            {r.errorMessage && (
              <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-800">
                <span className="font-medium">Error:</span> {r.errorMessage}
              </div>
            )}
          </article>
        ))}
      </section>

      <p className="text-xs text-gray-500">
        IPs are stored as <code>SHA-256(ip:AGENT_LOG_SALT)</code>. Set{" "}
        <code>AGENT_LOG_SALT</code> per environment to avoid hash
        precomputation against a known IP space.
      </p>
    </div>
  );
}
