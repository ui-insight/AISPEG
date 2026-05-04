-- Migration 009: agent_queries log
--
-- Slice #113 of Epic #107 (conversational agent observability). Captures
-- every /api/ask invocation for offline review at /internal/agent-log.
-- Stores anonymised IP hashes (not raw IPs) so review and rate-limiting
-- can happen without keeping PII at rest.
--
-- Retention is unbounded for now. If the table grows unwieldy, add a
-- per-row retention policy later (e.g. drop after 90 days) — the schema
-- is intentionally simple to make that easy.

BEGIN;

CREATE TABLE IF NOT EXISTS agent_queries (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- SHA-256 of `<ip>:<AGENT_LOG_SALT>`. Hex digest, 64 chars. Salt comes
  -- from the AGENT_LOG_SALT env var; a per-deployment value keeps the
  -- hash from being precomputed against a known IP space.
  ip_hash         TEXT NOT NULL,
  -- Audience tier the request was scoped to. Mirrors lib/agent loop's
  -- Audience type ('public' | 'internal').
  audience        TEXT NOT NULL CHECK (audience IN ('public', 'internal')),
  -- Verbatim user message. Capped at 2000 chars by the route handler.
  message         TEXT NOT NULL,
  -- Final assistant text. Null if the request errored before we got one.
  response        TEXT,
  -- Names of tools the agent invoked, in call order. Empty array on
  -- refusal-without-tool-call cases.
  tool_calls      TEXT[] NOT NULL DEFAULT '{}',
  -- Number of citation entries the loop returned.
  citation_count  INTEGER NOT NULL DEFAULT 0,
  -- How many loop iterations the request used.
  iterations      INTEGER NOT NULL DEFAULT 0,
  -- True if the loop hit MAX_ITERATIONS without producing a final answer
  -- and was forced to synthesise.
  truncated       BOOLEAN NOT NULL DEFAULT FALSE,
  -- Latency in milliseconds, route entry to JSON response.
  latency_ms      INTEGER NOT NULL,
  -- One of: 'ok', 'mindrouter_error', 'tool_error', 'rate_limited',
  -- 'bad_request', 'unconfigured', 'internal_error'. Lets the review
  -- surface group failures without parsing the message.
  outcome         TEXT NOT NULL,
  -- HTTP status the route handler returned.
  http_status     INTEGER NOT NULL,
  -- Model identifier used for this request.
  model           TEXT,
  -- Free-form error message when outcome != 'ok'.
  error_message   TEXT
);

-- Reverse-chron review on the log page hits this constantly.
CREATE INDEX IF NOT EXISTS agent_queries_created_at_idx
  ON agent_queries (created_at DESC);

-- Per-IP rate-limit lookups: count rows for a given hash since N minutes
-- ago. The rate limiter currently runs in-process, but querying directly
-- from the table is the durable fallback if we move multi-instance.
CREATE INDEX IF NOT EXISTS agent_queries_ip_hash_idx
  ON agent_queries (ip_hash, created_at);

COMMIT;
