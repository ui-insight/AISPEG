# Orchestrating agents across harnesses

How to delegate work from one agent to another in this repo through T3 Code.
Findings come from the 2026-10-31 test, one scorecard run per model, so treat
the routing as a starting point and update it as evidence accumulates.

## Route by data, then by fit

Pick the provider in this order.

1. **Data.** This repository is public, so committed content may go to any
   configured provider. Untracked and gitignored files stay with the local
   orchestrator. Anything else non-public, such as database rows, ClickUp
   exports and internal documents, goes to MindRouter or stays local.
2. **Fit.**

| Work | Route | Evidence |
|---|---|---|
| Coordination, verification, final judgment | Claude | Held the context and ran the gates |
| Quick work, shell-heavy work on committed content | GPT via Codex (`gpt-6.1-sol`) | 5 minutes on the test brief |
| On-prem work, long read-and-write jobs | Kimi K3 via OpenCode (`mindrouter/moonshotai/kimi-k3`) | 36 minutes on the same brief |

Models read evidence differently: on the test brief GPT left 91 of 165 facts
unknown where Kimi left 54, and Kimi rated risk lower on every subject. Keep
parallel judgments side by side rather than picking a winner.

## Isolate every child

- Use `isolation: "worktree"` for every Codex and OpenCode child. Worktrees
  hold committed files only, which keeps the untracked documents in the repo
  root out of reach.
- Treat a brief's "do not read X" as a request. In the test, a repo-wide
  search surfaced a directory the brief had excluded. To withhold committed
  material from a child, branch without it.
- `opencode.json` limits OpenCode to an allow-listed shell, blocks reads
  outside the workspace, and blocks edits to generated files. Its read rules
  cover the read tool only, so a shared checkout is still exposed through
  search.
- Keep the permissions on `deny`. An `ask` rule waits for a person, and the
  orchestrator cannot approve it. A denied command returns an error the agent
  can work around.

## Write the brief

A child starts with `AGENTS.md` and the brief, nothing else. Every brief states:

- **Goal and scope:** exact files or subjects, and what to leave alone.
- **Evidence:** where to look, and which sources are off limits.
- **Allowed tools:** what the child may run. Kimi's shell is limited to the
  allow-list in `opencode.json`.
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

The orchestrator commits, pushes and opens PRs. Children leave their output in
their worktree.

## Keep the setup working

- `AGENTS.md` is the only rules file. `CLAUDE.md` imports it, and harness-specific
  files stay out of the rules. Codex stops loading at 32 KiB, so
  `npm run verify:agents` caps `AGENTS.md` below that; disclose reference here
  or in another doc rather than raising the cap.
- The T3 project's `Install dependencies` script runs on worktree creation,
  so children start with `node_modules`. T3 stores that script outside the
  repo; recreate it if the project is re-added.
- When loading is in doubt, probe it: ask a child to quote a rule from memory
  without opening any file.
