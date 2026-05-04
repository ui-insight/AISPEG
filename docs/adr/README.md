# Architecture Decision Records

Decisions that are durable, cross-cutting, or non-obvious live here. ADRs are
the audit trail for *why* the codebase looks the way it does — the kind of
context that doesn't fit in a commit message and erodes from prose docs as
they get edited over time.

## When to write one

Write an ADR when a decision:

- Locks a taxonomy, schema, or vocabulary that multiple files depend on.
- Cuts off otherwise-reasonable alternatives (and would surprise someone
  who didn't see the deliberation).
- Couples this site to an external system or upstream registry.
- Names a tradeoff that will need to be revisited when conditions change.

Skip the ADR for:

- Implementation details captured well by code + tests + the PR description.
- Fixes to bugs (the commit message and issue thread are the audit trail).
- Choices that are easily reversible inside a single file.

If the next person reading the code would ask "why did you do it this way?"
and the answer isn't obvious from the file itself, the answer probably
belongs in an ADR.

## Format

By convention, follow the shape of [`0001-product-lifecycle-taxonomy.md`](./0001-product-lifecycle-taxonomy.md):

```markdown
# ADR NNNN — Short title

**Status:** Proposed | Accepted | Superseded by [ADR NNNN](./NNNN-...)
**Date:** YYYY-MM-DD
**Deciders:** Names of the people who actually made the call
**Supersedes:** (optional) Pointer to the ADR or pattern this replaces
**Related:** (optional) Issues, PRs, other ADRs

## Context
What's true today; what problem the decision is responding to.

## Decision
The decision itself, stated as a positive claim.

## Sub-decisions resolved
(optional) Discrete questions the decision settles, with rationale.

## Consequences
**Positive:** ...
**Negative:** ...
**Neutral:** ...

## Implementation sequencing
(optional, useful when the decision spans multiple PRs)
```

## File naming

`NNNN-kebab-case-title.md`. NNNN is a zero-padded sequence; never reuse a
number, even for a withdrawn ADR. Pick the next number from the highest
existing file.

## Lifecycle

ADRs are **append-only**. To change a decision:

- **Refining a decision** while the implementation is still in flight (e.g.
  the rules haven't been encoded in code yet) — edit the ADR with a
  clearly-marked sub-decision section. ADR 0001's sub-decision #4 is the
  precedent.
- **Reversing a decision** that's already shipped — write a *new* ADR that
  marks the old one as superseded. Don't delete or rewrite the old one;
  the historical reasoning is part of the audit trail.

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [0001](./0001-product-lifecycle-taxonomy.md) | Product Lifecycle Taxonomy | Accepted | 2026-05-03 |
| [0002](./0002-strategic-plan-alignment-explorer.md) | Strategic Plan Alignment Explorer | Accepted | 2026-05-03 |
