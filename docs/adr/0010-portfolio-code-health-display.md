# ADR 0010 — Portfolio code health display

**Status:** Accepted
**Date:** 2026-11-05
**Deciders:** Barrie Robison
**Related:** distributed-debt-ledger ADR-0012 (independent code health
measurement, items 25–28 cover publishing here), `lib/code-health.ts`,
`components/CodeHealth.tsx`, `/portfolio/code-health`

## Context

The distributed-debt-ledger measures every portfolio repository once a
month with pinned tools (lizard, radon, jscpd, osv-scanner, the GitHub API)
and writes an immutable snapshot. Snapshots are private: they hold file
paths, function names, package names and advisory IDs. Its `summary`
command reduces a snapshot to per-project numbers. Barrie decided on
2026-11-04 that those summaries may appear on this site, including for
private repositories.

The ledger is private and this repository is public, so whatever reaches
this repository is published in its git history.

## Decision

1. **Copy, don't read.** When a snapshot merges in the ledger, its workflow
   opens a PR here adding `data/code-health/summary-YYYY-MM-DD.json`. This
   repo never reads the ledger, needs no token for it, and builds from what
   is committed. One file per snapshot; they are never edited.
2. **Vulnerability counts stay out.** The ledger drops them from the summary
   itself, because leaving them off the page would still publish them in
   git history. A count of known vulnerabilities in a deployed project points
   at it before it is fixed. Direct dependencies a major version behind stay.
3. **An allowlist parser is the only reader.** `lib/code-health.ts` parses
   every file and fails on any field outside the published allowlist, an
   unknown basis, a schema change, or a duplicated slug.
   `npm run verify:portfolio` runs it, so the ledger's PR fails CI instead
   of production. The files are machine-written interchange, like
   `data/scorecards/`, so a parsed JSON file is preferred here over a typed
   module, and the parser supplies the types.
4. **Portfolio slugs only.** Every slug in a summary must be in
   `lib/portfolio.ts` or in `MEASURED_OUTSIDE_PORTFOLIO`. Measured
   repositories outside the portfolio are never shown. Projects sharing a
   repository (`SHARES_REPOSITORY_WITH`) show the measured project's numbers
   and say so.
5. **List, don't rank.** Each project page has a Code health section with
   its own numbers and trend. `/portfolio/code-health` lists projects
   alphabetically by basis, coverage status, gates and commit date, with
   no size or complexity column and nothing to sort. Its charts are
   portfolio-wide adoption counts only. Projects differ in language, size
   and age, so a number means most next to the same project's earlier
   numbers.
6. **Say what each number is.** Heuristic projects are marked *estimated*.
   Complexity is labelled as lizard's measure, not a project's lint score.
   Dependency counts are dated to the capture date, not the commit. Gates
   are *configured*, not proven to run in CI. Coverage counts only when CI
   ran on the measured commit. Unmeasured projects say why, with a fixed
   reason and never the collector's error text.
7. **Trends from the start.** Sparklines appear once a project has two
   snapshots. Until then the section says the trend starts next month.

## Consequences

- A new measured repository, or a renamed slug, fails the ledger's PR here
  until someone adds it to the portfolio or to `MEASURED_OUTSIDE_PORTFOLIO`.
- Pages read the files from disk at request time. Standalone output ships
  them through `outputFileTracingIncludes` in `next.config.mjs`.
- 27 of the first 28 projects are on the heuristic basis, so most numbers
  are marked estimated until projects adopt code-health-kit.
