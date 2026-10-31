# Orchestrating agents across harnesses

How to delegate work from one agent to another in this repo through T3 Code.
Findings come from the 2026-10-31 test, one scorecard run per model, so treat
the routing as a starting point and update it as evidence accumulates.

## Route by data, then by fit

Pick the provider in this order.

1. **Data.** This repository is public, so committed content may go to any
   configured provider. The exception is `vendor/strategic-plan`, a private
   submodule that is present in every worktree: keep briefs for external
   providers to the generated `lib/strategic-plan/catalog.ts`. Untracked and
   gitignored files stay with the local orchestrator. Anything else non-public,
   such as database rows, ClickUp exports and internal documents, goes to
   MindRouter or stays local.
2. **Fit.**

| Work | Route | Evidence |
|---|---|---|
| Coordination, verification, final judgment | Claude | Held the context and ran the gates |
| Quick work, or anything needing a shell, on committed content | GPT via Codex (`gpt-6.1-sol`) | 5 minutes on the test brief; ran commands unattended |
| On-prem work that only reads and writes files | Kimi K3 via OpenCode (`mindrouter/moonshotai/kimi-k3`) | 36 minutes on the same brief, including waits for human edit approvals; no unattended shell |

Models read evidence differently: on the test brief GPT left 91 of 165 facts
unknown where Kimi left 54, and Kimi rated risk lower on every subject. Keep
parallel judgments side by side rather than picking a winner.

## Isolate every child

- Use `isolation: "worktree"` for every Codex and OpenCode child. Worktrees
  hold committed files only, so a child's searches never surface the untracked
  documents in the repo root.
- Treat a brief's "do not read X" as a request. In the test, a repo-wide
  search surfaced a directory the brief had excluded. To withhold committed
  material from a child, branch without it.

- Keep the orchestrating thread in `auto`. Children inherit its mode, and a
  full-access parent gives every child full access. Switch it only for T3
  project settings, then switch back.

Set the OpenCode runtime mode explicitly on every child:

| `runtimeMode` | File edits | Shell | `opencode.json` |
|---|---|---|---|
| `auto-accept-edits` | Unattended | Waits for a person | `read` denies hold; `bash` and `edit` rules are overridden |
| `auto` | Wait for a person | Wait for a person | `bash` and `edit` rules are overridden |
| `full-access` | Unattended | Unattended | Every rule bypassed, including reads outside the workspace |

Use `auto-accept-edits` with a "no shell" brief for unattended Kimi work. The
orchestrator cannot approve prompts, so `auto` stalls. Read denies cover the
read tool only, not search. Probes on 2026-10-31 confirmed each row, so no
agent-side block on writes exists under T3; CI and the gates below catch bad
writes after the fact.

## Write the brief

A child starts with `AGENTS.md` and the brief, nothing else. Every brief states:

- **Goal and scope:** exact files or subjects, and what to leave alone.
- **Evidence:** where to look, and which sources are off limits.
- **Allowed tools:** what the child may run. Kimi briefs say "no shell".
- **Output:** exact path and format.
- **Gate:** the command that decides pass or fail.
- **Report:** what to return, including what blocked it and its least
  confident judgment.

## Gate on commands, not reports

Children report confidently and sometimes wrongly; Kimi miscounted its own
null fields. The orchestrator reruns the gate itself and checks claimed numbers
against the output.

| Change | Gate |
|---|---|
| Any code | `npm run check` |
| Scorecard run | `npm run import:scorecard -- <file> --dry-run` |
| `lib/portfolio.ts` | `npm run verify:portfolio` (part of `check`) |

Delegated worktrees have no `node_modules`, so a Codex brief that needs a gate
starts with `npm ci --prefer-offline --no-audit --no-fund` (16 seconds in the
probe). Kimi has no unattended shell, so the orchestrator runs its gates from a
checkout with dependencies. The orchestrator commits, pushes and opens PRs.
Children leave their output in their worktree.

## Keep the setup working

- `AGENTS.md` is the only rules file. `CLAUDE.md` imports it, and harness-specific
  files stay out of the rules. Codex stops loading at 32 KiB, so
  `npm run verify:agents` caps `AGENTS.md` below that; disclose reference here
  or in another doc rather than raising the cap.
- The T3 project's `Install dependencies` script is set to run on worktree
  creation, but it did not run for delegated children. Its effect on worktrees
  started from the T3 UI is untested. T3 stores it outside the repo, so
  recreate it if the project is re-added.
- When loading is in doubt, probe it: ask a child to quote a rule from memory
  without opening any file.
