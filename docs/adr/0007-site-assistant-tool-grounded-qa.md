# ADR 0007 — Site assistant: tool-grounded Q&A with strict citation

**Status:** Accepted
**Date:** 2026-07-27
**Deciders:** Barrie Robison (with @ProfessorPolymorphic)
**Related:** [#107](https://github.com/ui-insight/AISPEG/issues/107) (epic), slices [#114](https://github.com/ui-insight/AISPEG/issues/114), [#112](https://github.com/ui-insight/AISPEG/issues/112), [#108](https://github.com/ui-insight/AISPEG/issues/108), [#110](https://github.com/ui-insight/AISPEG/issues/110), [#115](https://github.com/ui-insight/AISPEG/issues/115), [#113](https://github.com/ui-insight/AISPEG/issues/113); Migration 009; [ADR 0004](./0004-clickup-ingestion-boundary.md) and [ADR 0005](./0005-unified-technology-request-registry.md) (the no-write-back posture this extends); [`.impeccable.md`](../../.impeccable.md) (cold-start constraint)

> **Written retrospectively.** The decisions below were made and shipped
> between May and July 2026 under Epic #107. They were recorded in issue
> threads and code comments but never in an ADR, which a July 2026
> documentation audit surfaced — the subsystem was invisible in
> `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, and `/docs`. This ADR
> records what was decided and why, so the reasoning survives the epic
> being closed. It does not propose anything new.

## Context

The site's data is fragmented by design. Project state lives in Postgres
`applications` and `blockers`; the standards ledger, Reports timeline,
work categories, and coordination surfaces live in typed TS modules; the
Unified Data Model and Strategic Plan catalogs are generated from vendored
git submodules; ClickUp status narrative arrives through projection
tables; technical work lives in GitHub Issues. Each of those shapes is the
right one for its data — that's [ADR 0004](./0004-clickup-ingestion-boundary.md),
[ADR 0005](./0005-unified-technology-request-registry.md), and Agent Rule 9
working as intended.

The cost lands on the reader. Answering *"what is IIDS doing about
document processing, and who owns it?"* currently requires knowing that
projects are at `/portfolio`, that the by-problem axis is a filter chip
rather than a page, that blockers are a separate concept from governance
flags, and that OIT's own portfolio is a different inventory than ours. No
Dean knows that. Per [`.impeccable.md`](../../.impeccable.md), the primary
audience has **no returning users** — this is a cold-start problem, and
every surface has to work as a first touch. Asking a stakeholder to learn
our information architecture before they can get an answer is precisely
the inertia the site has to overcome.

The obvious affordance is a conversational assistant. The obvious risk is
that this site is an **institutional accountability surface**. It names
real people as owners, makes dated claims about what OIT has and hasn't
done, and asserts which projects are in production. A hallucinated owner,
status, or blocker is not a UX blemish here — it is a false institutional
claim attributed to IIDS, on the one property whose entire argument is
that its claims are evidence-backed and owner-named. An assistant that is
usually right is worse than no assistant.

## Decision

**Ship a site-wide assistant built as a tool-using agent loop over
read-only tools, with a strict citation policy: if no tool returned
relevant data, the assistant refuses rather than answers.**

`components/ChatWidget.tsx` mounts a floating button in the root layout on
every page (suppressed on `/builder-guide`, which owns its own
idea-refinement panel). It posts to `POST /api/ask`, which runs
`lib/agent/loop.ts` against a registry of 25 read-only tools in
`lib/agent/tools/`, backed by MindRouter on the institutional Qwen
deployment.

## Sub-decisions resolved

### 1. Tools, not RAG and not text-to-SQL

Three architectures were available. Retrieval over embedded page text
would answer from prose that drifts from the data behind it and cannot
express *"which projects advance priority D.3"*. Text-to-SQL would reach
Postgres but not the typed modules, the vendored catalogs, or GitHub —
which is where most of the interesting data lives.

Each data source instead gets a **typed read-only tool** returning a
structured payload plus a `canonicalUrl`. The tool reads the same modules
the pages read, so the assistant and the page cannot disagree. When a
taxonomy changes, tsc breaks the tool the same way it breaks the UI.

### 2. Refusal is a correct answer

The system prompt's citation policy is the load-bearing constraint, and it
is stated as non-negotiable: never invent project names, owners, dates,
statuses, blockers, links, or report titles; if a tool didn't return it,
we don't know it; out-of-scope questions get the standard refusal.

A tool returning an `error` is explicitly **not** a zero. Reading a failed
lookup as "there are none" is the specific failure mode that would let the
assistant assert something false about IIDS, so the prompt calls it out
by name.

This trades helpfulness for trustworthiness deliberately. An assistant
that says *"I don't have data on that"* costs a click. An assistant that
invents a plausible owner for a project costs the site its argument.

### 3. Citations come from tool returns, not from the model

Every tool result carries `canonicalUrl` (and optionally `links[]`). The
loop accumulates and dedupes those into `citations` — the model composes
prose around them but never authors a URL that the loop reports as a
citation. A link the assistant surfaces is therefore a link some tool
actually produced from real data, and cannot be a hallucinated path.

### 4. Read-only, permanently

No tool writes. No tool triggers a sync, files a request, changes a
status, or sends anything. This is the same posture as ADR 0004's
pull-only ClickUp ingestion and ADR 0005's *"no approval actions on this
site"* — extended to the assistant. A conversational surface that can
mutate institutional records is a different product with a different risk
profile, and would need its own ADR.

### 5. Visibility is enforced at registration, not by the model

`lib/agent/tools/registry.ts` scopes each tool to an `Audience` tier when
it is registered. The loop passes the audience into every handler. The
model is never asked to decide what it may disclose — it only sees tools
the registry handed it.

The alternative (one registry, model-side filtering by prompt) was
rejected outright: prompt-level access control is not access control.
This is why `/internal/ask` ([#109](https://github.com/ui-insight/AISPEG/issues/109))
is still open — the internal tier needs tools written against internal
data, not a flag flipped on the public ones.

### 6. Log every query; keep no PII at rest

Migration 009's `agent_queries` captures every invocation — message,
response, tools called, citation count, iterations, truncation, latency,
outcome, HTTP status, model — reviewable at `/internal/agent-log`.

Client IPs are stored **only** as `SHA-256(<ip>:<AGENT_LOG_SALT>)`, with
the salt set per deployment so hashes cannot be precomputed against a
known campus IP space. The log needs a stable per-client key for rate
limiting and abuse review; it does not need to know who anyone is, so it
doesn't.

An observability surface was treated as a launch requirement rather than a
follow-up, on the reasoning that an assistant speaking for IIDS in public
that nobody reads the transcripts of is an unmanaged liability. Retention
is currently unbounded; the schema is deliberately simple so a retention
policy can be added later without a migration of substance.

### 7. Rate limiting in-process, with the exit documented

`lib/agent/rate-limit.ts` is a sliding-window limiter in memory — 60
requests/hour public, 600 internal. This is correct for the current
single-instance dev and prod containers and wrong the moment the stack
scales horizontally. Rather than build for a scale we don't have, the
fallback is documented in the module and the index that supports it
(`agent_queries (ip_hash, created_at)`) already exists in Migration 009.
Swapping to a Postgres `COUNT(*)` is a contained change when it's needed.

### 8. Evals score tool selection and citations — never response text

`evals/agent/` holds 41 golden cases scored on three axes: tool-selection
accuracy, citation accuracy, and refusal correctness. All three are
**set membership** (subset, not equality), so the eval stays stable as
tools are added and the model is allowed to call extras.

Response text is deliberately not graded. Phrasing drifts; URLs and tool
names are stable, and they are what the citation contract is actually
about. Grading prose would produce a brittle suite that fails on
rewording and passes on a confidently-wrong answer with the right shape.

The harness imports `runAgent` directly rather than driving a dev server —
same code path, no port conflicts. It is **not yet a CI gate**
(the runner needs a live MindRouter key and a seeded database); it exits
non-zero below threshold so it can become one.

### 9. Model-quirk resilience belongs in the loop, not the prompt

Observed repeatedly on qwen3.6-27b through MindRouter (2026-07-24,
2026-07-25): instead of emitting `tool_calls`, the model writes a *textual
imitation* of one — in three distinct syntaxes — and that markup becomes
the final answer the user sees.

Prompt-level correction was tried and produced the same imitation in a
different syntax. So `lib/agent/salvage-tool-call.ts` parses the intent
and runs the tool: the model told us exactly what it wanted, it just used
the wrong channel. The parse is conservative — it only accepts a name that
matches a **registered** tool, so a malformed call cannot invent a tool.
Real `tool_calls` always win; salvage only fires when the channel came
back empty, and the count is returned as `salvagedToolCalls` so a rise
after a model change is visible rather than silent.

The loop carries three more guards for the same class of problem: a
one-shot nudge when no tool has been called (escalating to
`tool_choice: "required"` when the narration named a tool), a forced
synthesis turn when the model returns an empty final message, and a
`MAX_ITERATIONS` cap of 6 with a forced synthesis at the end.

This is real coupling to a specific model's behavior, accepted knowingly.
The alternative — shipping raw XML to a Dean — was worse.

### 10. A new surface owes the assistant a tool

Established as a consequence in
[ADR 0006](./0006-coordination-surface-split.md) and generalized here: if
a stakeholder would plausibly ask about a surface, that surface needs a
tool, or the assistant will confidently refuse to discuss work that
exists. `list_site_areas` is the meta-tool for navigation questions and
has to be updated alongside the IA.

## Consequences

**Positive:**
- Stakeholders can ask in their own vocabulary without learning the IA —
  which is the cold-start affordance `.impeccable.md` argues every surface
  needs.
- The assistant reads the same typed modules the pages read, so it cannot
  drift from the site's own claims.
- Citations are structurally guaranteed to be real URLs from real lookups.
- Every answer IIDS's assistant gives in public is reviewable.
- The eval suite makes citation accuracy a measurable regression surface
  rather than a vibe.

**Negative:**
- Twenty-five tools are twenty-five things to keep in sync with the data
  they read. A surface added without a tool is invisible to the assistant.
- Real coupling to MindRouter availability and to qwen3.6's tool-calling
  quirks (§9). A model change requires re-running the evals and watching
  `salvagedToolCalls`.
- Strict citation makes the assistant visibly less capable than a
  general-purpose chatbot. Users who expect ChatGPT will find it narrow.
  That is the intended trade.
- The rate limiter is single-instance-only and will silently under-enforce
  if the stack is ever scaled without addressing §7.
- Unbounded log retention is a decision deferred, not made.

**Neutral:**
- `Audience` exists as a concept with only the public tier implemented.
  The seam is real but untested until #109 lands.

## Status

| Slice | State |
|---|---|
| [#114](https://github.com/ui-insight/AISPEG/issues/114) Tracer: `/api/ask`, loop, tool-calling | Shipped |
| [#112](https://github.com/ui-insight/AISPEG/issues/112) Eval harness | Shipped (41 cases; not a CI gate) |
| [#108](https://github.com/ui-insight/AISPEG/issues/108) Floating chat UI | Shipped |
| [#110](https://github.com/ui-insight/AISPEG/issues/110) Tools batch A — portfolio, standards, reports, sitemap | Shipped |
| [#115](https://github.com/ui-insight/AISPEG/issues/115) Tools batch B — governance, strategic plan, GitHub | Shipped |
| [#113](https://github.com/ui-insight/AISPEG/issues/113) Observability, rate limiting, safety | Shipped (Migration 009) |
| [#109](https://github.com/ui-insight/AISPEG/issues/109) Auth-gated `/internal/ask` + internal-tier tools | **Open** |
| [#111](https://github.com/ui-insight/AISPEG/issues/111) Streaming, conversation persistence, UX polish | **Open** |

Coordination-surface tools (`lookup_oit_pathway`, `lookup_oit_portfolio`,
`lookup_intake_profile`, `list_requested_projects`, survey tools) were
added after the original slice plan as those surfaces shipped — the §10
obligation in practice.

## What we deliberately do not build

- **No write tools.** Ever, under this ADR.
- **No general-knowledge fallback.** An uncited answer is a defect, not a
  degraded mode.
- **No response-text grading** in the evals (§8).
- **No model-side visibility filtering** (§5).
- **Not a search index.** The assistant answers questions; `/portfolio`'s
  filters remain the browse affordance, and the assistant links into them.

## Open questions

1. **Log retention.** Unbounded today. What is the right window, and does
   anything need to be purged sooner than that?
2. **Evals as a CI gate.** Blocked on the runner needing a live
   MindRouter key and a seeded database in CI. Worth solving before the
   tool count grows further.
3. **Internal tier (#109).** Needs tools written against internal data,
   not the public tools re-scoped. Deferred while the one-story directive
   (ADR 0005 amendment, 2026-07-24) is being worked through — it is not
   obvious the internal tier should exist at all in its original form.
