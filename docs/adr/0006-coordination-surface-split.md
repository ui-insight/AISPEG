# ADR 0006 — Split `/coordination` out of `/standards`

**Status:** Accepted
**Date:** 2026-07-25
**Deciders:** Barrie Robison (with @ProfessorPolymorphic)
**Related:** [ADR 0003](./0003-strategic-plan-map-home.md) (the last IA reshape, which put Map under Standards), [ADR 0005](./0005-unified-technology-request-registry.md) (the unified technology-request registry, whose surfaces this section now holds)

## Context

`/standards` accumulated eight sub-nav tabs between May and July 2026.
The tab row overflowed horizontally at desktop width, which is the visible
symptom. The structural problem is that the eight tabs are two different
kinds of thing:

**Reference — what the work is measured against.** The standards ledger,
the Data Model explorer, the Strategic Plan explorer, and the coverage
Map. Externally sourced (two git submodules), slow-changing, and
answering *"is this consistent with institutional direction?"*

**Process — how work gets in and moves.** The Intake Crosswalk, the OIT
Pathway, the OIT Portfolio, and the Operational Excellence Survey. All
four were built between June and July 2026, all four change as OIT
publishes drafts and as the Chief AI & Data Science Officer's intake
process settles, and all four answer *"how does a request become tracked
work, and who touches it?"*

Those have different audiences and different refresh cadences. More
importantly, the four process pages had no connective tissue: a reader
arriving at the Intake Crosswalk had no way to see that it, the pathway,
the OIT portfolio, and the survey are four views of one convergence
effort. They read as four artifacts in a folder rather than as a section
with a thesis.

This matters more than usual right now. The site is the primary
onboarding surface for the incoming CADSO, and the argument being made to
that office is precisely *"here is one institutional process, and here is
how far along it is."* That argument needs a page.

## Decision

**Add `/coordination` as a fifth primary sidebar surface. Move the four
process sub-pages into it. `/standards` keeps the four reference tabs.**

### Surface changes

| Before | After |
|---|---|
| `/standards/intake-crosswalk` | `/coordination/intake-crosswalk` (301) |
| `/standards/oit-pathway` | `/coordination/oit-pathway` (301) |
| `/standards/oit-portfolio` | `/coordination/oit-portfolio` (301) |
| `/standards/operational-excellence` | `/coordination/operational-excellence` (301) |
| — | `/coordination` — new overview page |
| sidebar: 5 entries | sidebar: 6 entries, Coordination between Submit a Project and Standards |
| `/standards` sub-nav: 8 tabs | `/standards`: 4 tabs · `/coordination`: 5 tabs |

Redirects are permanent and declared in `next.config.mjs`. Links to the
old paths have already been circulated externally; none of them break.

## Sub-decisions resolved

### 1. Why not call it "Governance"?

That word is already spent. `lib/governance/*`, the Data Governance
Explorer, and the "governed projects" vocabulary all refer to the Unified
Data Model — a different thing that lives under `/standards/data-model`.
Naming this section Governance would make two unrelated concerns sound
like one, in the surface where the distinction matters most.

"Coordination" also matches the framing the rest of the site already uses
(*"coordinated by IIDS"*), and it is in the EXEC vocabulary listed in
[`.impeccable.md`](../../.impeccable.md).

### 2. Why an overview page, and why does it name gaps?

Without it, this is a folder, not a section. The overview carries the
thesis — four movements a request travels, each with a surface and each
with a named gap — and the gaps are the load-bearing part. Two of them
(the ROI rubric and the authoritative data classifications) are owed by
the CADSO office; one (the TDX sync) is blocked on API access; one (further
OIT crosswalk matches) is waiting on owner confirmation. Publishing the
gaps alongside the artifacts is what makes the section evidence rather
than a pitch, per design principle 5.

Every number on the overview is computed from the typed modules at build
time. There are no hardcoded counts to drift.

### 3. Why does the request queue stay at `/portfolio/pipeline`?

It is demand, and demand is what this section is about — so the move was
considered. It stays because the queue is the front door for *"what is
being asked for,"* which belongs next to *"what we are building."*
Coordination holds the rules of the road; Projects holds the traffic.

This does not create a second request view. The standing constraint from
2026-07-24 holds: `/portfolio/pipeline` is the one all-origin queue, and
`/coordination` links to it rather than reproducing it.

### 4. Why a shared sub-nav component?

Two surfaces now need the same tab row. `components/StandardsSubNav.tsx`
is replaced by `components/SectionSubNav.tsx`, which takes `items`,
`rootHref`, and `ariaLabel`. Each layout declares its own `subNavItems`
next to the eyebrow it belongs to, so the nav and the surface it labels
stay in one file.

Agent rule 11 is amended accordingly: sub-sections are added by editing
`subNavItems` in the parent's `layout.tsx`, never by adding a sidebar row.

### 5. Does a sixth sidebar entry violate the narrow-IA principle?

Rule 11 forbids sidebar entries for *sub-sections*. This is a primary
surface with its own sub-nav, which is the case the rule is designed to
route into the sidebar rather than away from it. Six entries is still a
narrow IA; the alternative — eight tabs under a heading that only
describes half of them — was the worse violation.

## Consequences

- The `/standards` eyebrow now describes what is actually beneath it.
- The four process pages gained a parent that explains why they exist
  together, and each gained a stated gap.
- `lib/agent/tools/list-site-areas.ts` gains a Coordination area so the
  site assistant routes process questions there rather than at
  `/standards`; the OIT Portfolio sub-area, previously missing from that
  tool, is now declared.
- The landing page's Evaluate lane gains a Coordination row, so the
  surface is reachable without the sidebar.
- Four permanent redirects are now maintained in `next.config.mjs`.
  They do not expire.
