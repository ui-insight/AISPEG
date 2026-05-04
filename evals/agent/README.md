# Conversational Agent Eval Harness

Local-runnable eval scaffold for the `/api/ask` agent loop. Lands as
slice #112 of [Epic #107](https://github.com/ui-insight/AISPEG/issues/107) — the gate before more tools come online in
slices #110 + #115. Adding tools without a regression net is how
citation accuracy silently rots.

## Run it

```bash
# Full set, default thresholds
npm run eval:agent

# Subset by tag (e.g. just refusal cases)
npm run eval:agent -- --tags refusal

# Single case by id
npm run eval:agent -- --case openera-detail

# Machine-readable output
npm run eval:agent -- --json
```

The runner needs a live agent session, so:

- `MINDROUTER_API_KEY` must be set in the env (the same key
  `/api/ask` uses).
- `DATABASE_URL` must point at a Postgres with the seeded `applications`
  table. For local runs against the dev DB, open the SSH tunnel
  documented in `CLAUDE.md` and `.env.local` already targets
  `localhost:5433`.

The harness does **not** spin up `npm run dev`; it imports `runAgent`
directly. Faster, no port conflicts, and the same code path the route
handler uses.

## What it scores

Three axes, each scored as **set membership** (subset, not strict
equality) so the eval stays stable as new tools land and the model is
allowed to invoke extras.

| Axis | What passes |
|---|---|
| **Tool-selection accuracy** | Every tool name in `expectedToolCalls` appeared in `result.toolCalls`. |
| **Citation accuracy** | Every URL in `expectedCitations` appeared in `result.citations`. |
| **Refusal correctness** | When `shouldRefuse: true`, the response matches a refusal pattern (e.g. "I don't have data on that…"). Tool calls are *not* required to be empty — an agent that calls `search_portfolio` for an out-of-scope query, gets nothing back, and then refuses is doing the right thing. |

A case passes overall iff all *applicable* axes pass. A case with no
applicable axes won't pass — be sure each case asserts at least one of
the three.

## Default thresholds

Defined in `run.ts:THRESHOLDS`. Per the slice acceptance criterion,
the seed-set baseline is **80%** on each axis. Bump as more tools
land and the model has more to do; the runner exits non-zero when any
axis falls below threshold so this doubles as a CI gate later.

## Adding a Q&A pair

Edit `golden.json`. Each case is one object in the `cases` array:

```json
{
  "id": "stable-kebab-case-id",
  "question": "User-facing prompt the agent will see.",
  "expectedToolCalls": ["search_portfolio"],
  "expectedCitations": ["/portfolio/openera"],
  "shouldRefuse": false,
  "rationale": "Optional human note on why this case matters.",
  "tags": ["portfolio", "named-project"]
}
```

Guidelines:

- **Use real slugs / URLs.** If you cite `/portfolio/foo`, make sure
  `foo` is in `lib/portfolio.ts`. The eval will (correctly) fail on a
  typo, which is the point.
- **Don't assert response text.** Phrasing drifts; URLs and tool names
  are stable. The metrics module deliberately does not score against
  the `response` string except to detect refusal patterns.
- **One assertion per axis.** A case can be a refusal case
  (`shouldRefuse`) **or** a tool/citation case, not both. The runner
  treats these as separate axes.
- **Tag liberally.** Tags drive the `--tags` filter for fast iteration
  while debugging a regression.

## What's intentionally not here yet

- **CI integration.** This slice ships the local-runnable scaffold
  only. Wiring `eval:agent` into a PR-blocking workflow is a follow-up
  once the model + tool surface stabilises (likely after slice #115).
- **Response-text grading.** Brittle and the wrong contract for a
  citation-grounded agent. If a future tool needs richer assertions
  (e.g. structured-output validation), add a fourth axis to
  `metrics.ts` rather than scoring text.
- **Eval-driven prompt tuning.** That belongs in the tool-batch slices
  (#110, #115), where a regression in the metrics here is the
  trigger.
