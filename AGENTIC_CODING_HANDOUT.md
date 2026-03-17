# Agentic Coding and Orchestration in AISPEG

This handout is a short pre-read for a working session on agentic coding with Codex and Claude Code using the AISPEG repository.

The goal is not to have AI "write code for us." The goal is to learn how to direct, constrain, review, and verify agent work so it becomes a practical force multiplier.

## What This Session Covers

We will use the AISPEG repo to:

- get GitHub and the coding tools set up
- orient to the structure of a real, working repository
- practice giving agents bounded, high-clarity tasks
- make a few simple improvements with visible results
- compare Codex and Claude Code as complementary tools
- reinforce review, verification, and orchestration

## Why AISPEG Is a Good Training Repo

AISPEG is a strong training environment because it is:

- small enough to understand quickly
- visual enough to show immediate results
- simple enough for low-risk starter tasks
- real enough to demonstrate institutional development patterns

Much of the site is data-driven, which means many useful changes are straightforward and easy to verify.

## How We Will Frame Agentic Coding

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
- accelerating iteration once the direction is clear

This is orchestration, not abdication.

## Session Trajectory

The session will likely move through four stages:

1. Environment setup
   Connect GitHub, confirm the repo opens correctly, and make sure the tools can inspect files and run basic commands.

2. Repo orientation
   Review the project structure, identify where content lives, and distinguish static pages from pages that depend on live GitHub data.

3. Simple wins
   Make a few small, useful changes that are visible, low-risk, and easy to verify.

4. Orchestration patterns
   Use Codex and Claude Code together so one tool explores, one implements, and the human stays in the orchestrator role.

## AISPEG Repo Quick Map

- `app/` contains the pages
- `components/` contains reusable UI pieces
- `lib/data.ts` contains most of the structured site content
- `lib/github.ts` fetches live GitHub issue data for dynamic sections

This means the safest first tasks are usually:

- content updates in `lib/data.ts`
- small UI or search fixes in a single page
- documentation cleanup when the docs drift from the implementation

## Codex and Claude Code

The most useful comparison is not "which one is better?" It is "how do they complement each other?"

- Claude Code is often very good at reading a repo, building context, explaining what it sees, and proposing a sensible path.
- Codex is often very good at targeted implementation, terminal-heavy work, and tightening the last mile of execution.

A metaphor I like:

- Claude Code can build you a functional car. It is generally good, gets you rolling, and will get you where you need to go.
- Codex can build a racing transmission. When installed in your car, it can dramatically improve performance and capability.

In practice, that means Claude Code is often excellent for broad repo understanding and initial framing, while Codex often shines when precision, iteration speed, and execution discipline matter most.

## A Practical Orchestration Pattern

A strong default pattern is:

1. Ask one agent to read first and suggest the safest useful task.
2. Ask the other agent to implement that narrow task.
3. Ask one of them to review the result for risk, drift, or regressions.
4. Keep the human in charge of scope, approval, and next steps.

This keeps the tools complementary instead of redundant.

## Good First Wins in AISPEG

Strong starter tasks in this repo include:

- add or refine a principle, lesson, or knowledge-base entry
- fix a small search or filtering behavior
- align contributor documentation with how the repo actually works
- tighten page helper text so future contributors know where to edit

These are good first wins because they are:

- visible
- low-risk
- easy to review
- easy to verify
- useful even when small

## Cheat Sheet

### Good Starter Prompts

- "Read the repo conventions and summarize how this project is structured."
- "Suggest three safe, useful first changes for a new contributor."
- "Implement one small improvement, explain what changed, and run the build."
- "Review this change for risk, drift, or regressions."
- "What assumptions are you making before you edit anything?"

### Good Guardrails

- "Start with the smallest safe change."
- "Follow the existing patterns in the repo."
- "Do not make unrelated changes."
- "Explain your reasoning briefly before editing."
- "Run the relevant checks after the change."

### Good Habits

- ask the agent to read before it writes
- keep tasks narrow
- name the file or area to change
- state the acceptance criteria
- ask for verification
- review the diff before accepting the result

## Simple Working Loop

1. Understand the repo
2. Pick one small task
3. Ask the agent to implement it
4. Review the change
5. Run `npm run build` or another relevant check
6. Refine if needed
7. Commit only when the change is clear and verified

## What Makes a Good First Task

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

## What Success Looks Like

A successful session is not "we changed a lot of code."

A successful session is:

- you can direct the tools confidently
- you can tell when a task is well-scoped
- you can review output with the right level of skepticism
- you can see where this approach fits in real institutional development work

## Takeaway

The value of agentic coding is not just faster implementation. It is faster understanding, tighter iteration loops, and a new way to coordinate human judgment with machine execution.

AISPEG is a manageable place to practice that well.
