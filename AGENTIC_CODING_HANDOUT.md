# Agentic Coding and Orchestration

A short pre-read for a working session on agentic coding with Codex and
Claude Code using this repository — the **Institutional AI Initiative**
site, an IIDS-coordinated Next.js application for the University of
Idaho's institutional AI work.

The goal is not to have AI "write code for us." The goal is to learn how
to direct, constrain, review, and verify agent work so it becomes a
practical force multiplier.

## What this session covers

We will use this repo to:

- get GitHub and the coding tools set up
- orient to the structure of a real, working repository mid-refactor
- practice giving agents bounded, high-clarity tasks
- make a few simple improvements with visible results
- compare Codex and Claude Code as complementary tools
- reinforce review, verification, and orchestration

## Why this is a good training repo

This repo is a strong training environment because it is:

- small enough to understand quickly
- visual enough to show immediate results in the browser
- simple enough for low-risk starter tasks
- real enough to demonstrate institutional development patterns
- **mid-refactor** — which means there are explicit decisions captured
  in `REFACTOR.md` that show how strategic context flows into code

Much of the content is data-driven through typed TypeScript modules
(`lib/portfolio.ts`, `lib/standards-watch.ts`), so many useful changes
are straightforward and easy to verify.

## How we frame agentic coding

The human remains responsible for:

- choosing the problem
- defining constraints
- deciding what "done" means
- reviewing the output
- approving what gets merged

The agents are useful for:

- reading and summarizing the codebase quickly
- identifying inconsistencies, drift, and low-risk improvements
- implementing narrow, well-scoped changes
- running checks and surfacing problems
- accelerating iteration once direction is clear

This is orchestration, not abdication.

## Session trajectory

The session will likely move through four stages:

1. **Environment setup** — connect GitHub, confirm the repo opens
   correctly, make sure the tools can inspect files and run commands.
2. **Repo orientation** — read `README.md`, `CLAUDE.md`, and `REFACTOR.md`.
   Identify where content lives. Distinguish static pages from pages that
   depend on Postgres or live GitHub data.
3. **Simple wins** — make a few small, useful changes that are visible,
   low-risk, and easy to verify.
4. **Orchestration patterns** — use Codex and Claude Code together so one
   tool explores, one implements, and the human stays in the orchestrator
   role.

## Quick map

- `app/` — pages (Next.js App Router; four primary surfaces:
  `/portfolio`, `/builder-guide`, `/reports`, `/standards`)
- `components/` — reusable UI pieces
- `lib/portfolio.ts` — interventions inventory (typed)
- `lib/standards-watch.ts` — standards ledger
- `lib/builder-guide-data.ts` — assessment quiz, scoring, tiers
- `lib/github.ts` — fetches GitHub issue data
- `db/migrations/` — SQL migrations

The safest first tasks are usually:

- adding an entry to a typed data module (`lib/portfolio.ts`,
  `lib/standards-watch.ts`)
- small UI fixes in a single page
- documentation cleanup when the docs drift from the implementation

## Codex and Claude Code

The most useful comparison is not "which one is better?" It is "how do
they complement each other?"

- **Claude Code** is often very good at reading a repo, building context,
  explaining what it sees, and proposing a sensible path.
- **Codex** is often very good at targeted implementation, terminal-heavy
  work, and tightening the last mile of execution.

A useful metaphor:

- Claude Code can build you a functional car. It is generally good, gets
  you rolling, and will get you where you need to go.
- Codex can build a racing transmission. When installed in your car, it
  can dramatically improve performance and capability.

In practice, that means Claude Code is often excellent for broad repo
understanding and initial framing, while Codex often shines when
precision, iteration speed, and execution discipline matter most.

## A practical orchestration pattern

A strong default pattern:

1. Ask one agent to read first and suggest the safest useful task.
2. Ask the other agent to implement that narrow task.
3. Ask one of them to review the result for risk, drift, or regressions.
4. Keep the human in charge of scope, approval, and next steps.

This keeps the tools complementary instead of redundant.

## Good first wins

Strong starter tasks in this repo include:

- add or refine an intervention entry in `lib/portfolio.ts`
- add a new entry to `lib/standards-watch.ts` when a new standard is
  formally requested from OIT
- fix a small typography or layout detail on a page
- align contributor documentation with how the repo actually works
- tighten page helper text so future contributors know where to edit

These are good first wins because they are:

- visible
- low-risk
- easy to review
- easy to verify
- useful even when small

## Cheat sheet

### Good starter prompts

- "Read `REFACTOR.md` and `CLAUDE.md`, then summarize how this project is
  structured and what's being refactored."
- "Suggest three safe, useful first changes for a new contributor."
- "Implement one small improvement, explain what changed, and run the
  build."
- "Review this change for risk, drift, or regressions."
- "What assumptions are you making before you edit anything?"

### Good guardrails

- "Start with the smallest safe change."
- "Follow the existing patterns in the repo."
- "Don't make unrelated changes."
- "Don't reintroduce cut routes — check `REFACTOR.md` first."
- "Explain your reasoning briefly before editing."
- "Run `npm run build` after the change."

### Good habits

- ask the agent to read before it writes
- keep tasks narrow
- name the file or area to change
- state the acceptance criteria
- ask for verification
- review the diff before accepting the result

## Simple working loop

1. Understand the repo
2. Pick one small task
3. Ask the agent to implement it
4. Review the change
5. Run `npm run build`
6. Refine if needed
7. Commit only when the change is clear and verified

## What makes a good first task

A good first task is:

- small
- visible
- easy to verify
- low risk
- grounded in existing patterns
- useful even if modest

A poor first task is:

- broad
- ambiguous
- cross-cutting
- hard to verify
- dependent on too many moving parts

## What success looks like

A successful session is not "we changed a lot of code."

A successful session is:

- you can direct the tools confidently
- you can tell when a task is well-scoped
- you can review output with the right level of skepticism
- you can see where this approach fits in real institutional development
  work

## Takeaway

The value of agentic coding is not just faster implementation. It is
faster understanding, tighter iteration loops, and a new way to coordinate
human judgment with machine execution. This repo is a manageable place to
practice that well — and because it's mid-refactor with strategic
decisions captured in `REFACTOR.md`, it's a good window into how
agentic coding scales from "make a small change" to "execute a multi-sprint
restructure under sustained editorial direction."
