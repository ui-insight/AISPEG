// agent_queries logger — Slice #113 of Epic #107.
//
// Captures every /api/ask invocation for offline review at
// /internal/agent-log. IP addresses are stored only as a SHA-256 hash
// of `<ip>:<AGENT_LOG_SALT>` so the log carries no PII at rest.

import "server-only";
import { createHash } from "node:crypto";
import { query } from "@/lib/db";

export type AgentOutcome =
  | "ok"
  | "mindrouter_error"
  | "tool_error"
  | "rate_limited"
  | "bad_request"
  | "unconfigured"
  | "internal_error";

export interface AgentLogRow {
  id: string;
  createdAt: string;
  ipHash: string;
  audience: "public" | "internal";
  message: string;
  response: string | null;
  toolCalls: string[];
  citationCount: number;
  iterations: number;
  truncated: boolean;
  latencyMs: number;
  outcome: AgentOutcome;
  httpStatus: number;
  model: string | null;
  errorMessage: string | null;
}

export interface InsertAgentQuery {
  ipHash: string;
  audience: "public" | "internal";
  message: string;
  response?: string | null;
  toolCalls?: string[];
  citationCount?: number;
  iterations?: number;
  truncated?: boolean;
  latencyMs: number;
  outcome: AgentOutcome;
  httpStatus: number;
  model?: string | null;
  errorMessage?: string | null;
}

const FALLBACK_SALT = "aispeg-agent-default-salt";

/**
 * Hash a client IP with the per-deployment salt. Returns a 64-char hex
 * digest. Same IP + same salt always produces the same hash, so the
 * rate-limiter can key on it.
 */
export function hashIp(ip: string): string {
  const salt = process.env.AGENT_LOG_SALT || FALLBACK_SALT;
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

/**
 * Best-effort log insert. Never throws — we don't want a logging failure
 * to fail the user's request.
 */
export async function logAgentQuery(row: InsertAgentQuery): Promise<void> {
  try {
    await query(
      `INSERT INTO agent_queries
         (ip_hash, audience, message, response, tool_calls,
          citation_count, iterations, truncated, latency_ms,
          outcome, http_status, model, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        row.ipHash,
        row.audience,
        row.message,
        row.response ?? null,
        row.toolCalls ?? [],
        row.citationCount ?? 0,
        row.iterations ?? 0,
        row.truncated ?? false,
        row.latencyMs,
        row.outcome,
        row.httpStatus,
        row.model ?? null,
        row.errorMessage ?? null,
      ]
    );
  } catch (err) {
    console.error("logAgentQuery failed:", err);
  }
}

interface RawAgentRow {
  id: string;
  created_at: Date | string;
  ip_hash: string;
  audience: "public" | "internal";
  message: string;
  response: string | null;
  tool_calls: string[];
  citation_count: number;
  iterations: number;
  truncated: boolean;
  latency_ms: number;
  outcome: AgentOutcome;
  http_status: number;
  model: string | null;
  error_message: string | null;
}

function rowToLog(row: RawAgentRow): AgentLogRow {
  return {
    id: String(row.id),
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    ipHash: row.ip_hash,
    audience: row.audience,
    message: row.message,
    response: row.response,
    toolCalls: row.tool_calls ?? [],
    citationCount: row.citation_count,
    iterations: row.iterations,
    truncated: row.truncated,
    latencyMs: row.latency_ms,
    outcome: row.outcome,
    httpStatus: row.http_status,
    model: row.model,
    errorMessage: row.error_message,
  };
}

export interface ListRecentOptions {
  limit?: number;
  outcome?: AgentOutcome;
  sort?: "recent" | "slowest";
}

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export async function listRecentAgentQueries(
  opts: ListRecentOptions = {}
): Promise<AgentLogRow[]> {
  const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const sort = opts.sort ?? "recent";
  const orderClause =
    sort === "slowest"
      ? "ORDER BY latency_ms DESC, created_at DESC"
      : "ORDER BY created_at DESC";

  const params: unknown[] = [];
  let where = "";
  if (opts.outcome) {
    params.push(opts.outcome);
    where = `WHERE outcome = $${params.length}`;
  }
  params.push(limit);

  const rows = await query<RawAgentRow>(
    `SELECT * FROM agent_queries ${where} ${orderClause} LIMIT $${params.length}`,
    params
  );
  return rows.map(rowToLog);
}

export interface AgentSummary {
  total24h: number;
  byOutcome: Partial<Record<AgentOutcome, number>>;
  p50LatencyMs: number;
  p95LatencyMs: number;
}

export async function getAgentSummary(): Promise<AgentSummary> {
  const rows = await query<{
    total: string;
    p50: string;
    p95: string;
  }>(
    `SELECT
       COUNT(*)::text AS total,
       COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY latency_ms), 0)::text AS p50,
       COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms), 0)::text AS p95
     FROM agent_queries
     WHERE created_at >= now() - interval '24 hours'`
  );
  const head = rows[0];

  const byRows = await query<{ outcome: AgentOutcome; n: string }>(
    `SELECT outcome, COUNT(*)::text AS n
       FROM agent_queries
      WHERE created_at >= now() - interval '24 hours'
      GROUP BY outcome`
  );
  const byOutcome: Partial<Record<AgentOutcome, number>> = {};
  for (const r of byRows) {
    byOutcome[r.outcome] = Number.parseInt(r.n, 10);
  }

  return {
    total24h: head ? Number.parseInt(head.total, 10) : 0,
    byOutcome,
    p50LatencyMs: head ? Math.round(Number.parseFloat(head.p50)) : 0,
    p95LatencyMs: head ? Math.round(Number.parseFloat(head.p95)) : 0,
  };
}
