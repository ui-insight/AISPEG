# ADR 0003 — Strategic-Plan Map Home + `/explore` Retirement

**Status:** Accepted
**Date:** 2026-05-05
**Deciders:** Barrie Robison (with @ProfessorPolymorphic)
**Related:** [#251](https://github.com/ui-insight/AISPEG/issues/251) (this ADR), [#250](https://github.com/ui-insight/AISPEG/issues/250) (landing steering page, shipped in [#254](https://github.com/ui-insight/AISPEG/pull/254)), [#252](https://github.com/ui-insight/AISPEG/issues/252) (implementation, blocked by this ADR), [ADR 0002](./0002-strategic-plan-alignment-explorer.md) (the strategic-plan explorer itself)

## Context

The IA critique on 2026-05-04 surfaced two collisions between the site's surfaces:

1. **`/explore` tiles duplicate `/portfolio`'s category filter.** Each tile is a pre-filtered link into `/portfolio?category=…` that already exists on the canonical inventory page. A whole sidebar entry's worth of nav for a one-click-deeper filter.
2. **`/explore?view=map` is the most distinctive view in the trio — and the most buried.** The map joins projects to strategic-plan priorities and surfaces 13 uncovered priorities as a finding. Nothing else in the IA answers *"where are the gaps in our strategic-plan coverage?"*. Currently it lives behind a toggle on a page whose H1 changes from one sentence to another based on view state — two pages sharing one URL.

Sub-issue #250 (landing → steering page) shipped first; the steering tile for "Explore" still points at `/explore` so this ADR's decision is what determines whether that tile gets re-targeted or removed in #252.

The map is also the site's most quotable artifact for the peer-institution audience (REACH, NSF GRANTED, AI4RA partners). It deserves a permanent home, not a toggle.

## Decision

**Move the strategic-plan map to `/standards/strategic-plan/map`. Retire `/explore` entirely.** Sidebar shrinks from six entries to five.

### Surface changes

| Before | After |
|---|---|
| `/explore` (default = tiles) | redirect → `/portfolio` |
| `/explore?view=tiles` | redirect → `/portfolio` |
| `/explore?view=map` | redirect → `/standards/strategic-plan/map` |
| `/standards/strategic-plan` (pillar overview) | unchanged |
| sidebar entry "Explore" | removed |
| sidebar sub-nav under `/standards` | adds "Map" alongside existing Ledger / Data Model / Strategic Plan |

### Steering grid on `/`

The 5-tile steering grid shipped in #254 includes an "Explore" tile pointing at `/explore`. After this ADR lands, that tile is removed in #252 — the steering grid drops to four tiles (Projects, Submit a Project, Standards, Reports). Standards remains the door to the map, framed by sub-nav rather than a dedicated landing tile.

## Sub-decisions resolved

### 1. Why `/standards/strategic-plan/map` and not `/explore` becoming the map?

Three reasons.

**The data lives where the visualization lives.** The map renders pillars ↔ priorities ↔ projects ↔ work-categories. Pillars and priorities are owned by `vendor/strategic-plan/` and surfaced under `/standards/strategic-plan` (per ADR 0002). Putting the map elsewhere fragments the strategic-plan exploration across two URLs.

**"Explore" is too generic a label for a single visualization.** If the tiles view goes away, "Explore" as a sidebar entry would mean "the strategic-plan coverage map." That semantic mismatch is worse than removing the entry — the word *explore* implies browsing through many things, not staring at one chart.

**The audit framing is correct under `/standards`.** "13 priorities have no aligned projects" is a self-accountability claim — what the institution holds itself to advancing. That's exactly what `/standards` is for. The same logic that put the alignment explorer under `/standards` in ADR 0002 ("standards we hold ourselves to, including the institutional plan") applies to its visualization.

### 2. Why retire `/explore` entirely instead of keeping a `/coverage` URL?

A new top-level URL adds an entry to the IA without earning its keep. The map is one of three views *under* the strategic-plan exploration (overview, per-priority detail, mesh map). It's a sub-page of an existing surface, not a parallel surface.

The IA critique scored the trio at 28/40 partly because of redundant surfaces; adding a new top-level URL would reverse that gain.

### 3. Why a sub-route instead of a tab toggle on `/standards/strategic-plan`?

The existing `/standards/strategic-plan` is a pillar overview. The map is a different rendering of the same data, but at a different granularity (the whole network at once vs. one pillar at a time). They are siblings, not view modes of the same page.

A sub-route gives the map its own H1, its own deep-link, and its own metadata. A tab toggle would reintroduce the "two pages share one URL with two different H1s" problem this ADR exists to fix.

### 4. What happens to the work-categories taxonomy on the landing IA?

`/explore` tiles expose `WORK_CATEGORIES` as the primary entry point into the by-problem axis. After retirement, that role moves entirely to `/portfolio`'s category filter (the chips in `PortfolioFilters`). The taxonomy itself stays — it remains useful as a filter dimension and a card-level chip.

If a future need surfaces for a dedicated "browse by problem" entry distinct from the project inventory's filter, that's a fresh ADR. YAGNI today.

### 5. Inbound link compatibility

Two patterns exist in the wild:

- **`/portfolio?category=…`** is generated by `app/explore/page.tsx`'s `CategoryTileCard`. These links go to `/portfolio` directly and are unaffected.
- **Bookmarks to `/explore` or `/explore?view=map`** need redirects. Implementation in #252 will add a `next.config` redirect rule (or middleware redirect) covering both.

The strategic-plan map is recent enough that there are unlikely to be many third-party deep links to `/explore?view=map` in circulation; the redirect is belt-and-braces.

## Consequences

**Positive:**

- The most distinctive view in the IA gets a permanent home with its own H1 and URL, instead of being a toggle on a page whose meaning changes.
- Sidebar shrinks 6 → 5 entries; the IA reads as more deliberate.
- The redundancy between `/explore` tiles and `/portfolio` category filter goes away.
- Stakeholder framing for the map is better: a Provost looking at strategic-plan coverage gaps lands under `/standards`, which is where the self-accountability framing lives.
- The peer-institution audience gets a quotable URL (`/standards/strategic-plan/map`) that contextualizes the finding instead of leaving it stranded under "Explore."

**Negative:**

- One sub-nav entry under `/standards` is added, taking the count from three to four (Ledger, Data Model, Strategic Plan, Map). Tolerable; a fifth would be tight.
- Redirects need to be maintained for `/explore` and `/explore?view=map`. Low cost; redirect rules are easy to keep.
- Loses the dedicated category-tile entry surface. Anyone whose mental model of the site was "categories → projects" must learn that the categories live as filter chips on `/portfolio`. Mitigated by the steering-tile copy on `/portfolio` already mentioning categories.
- Steering tile for "Explore" on `/` (shipped in #254) needs to be removed in #252. Minor coordination cost; #252 already calls this out.

**Neutral:**

- `WORK_CATEGORIES` stays as a typed taxonomy with no behavior change. The decision affects where it's surfaced, not what it is.
- The map's renderer (`components/ProjectMapView.tsx` and the d3 graph adapter) is unchanged; it just renders at a new URL.

## Implementation sequencing

This is captured in [#252](https://github.com/ui-insight/AISPEG/issues/252). At a glance:

1. Move map render to `app/standards/strategic-plan/map/page.tsx` (server component shell + reuse the existing client `ProjectMapView`).
2. Add "Map" entry to `components/StandardsSubNav.tsx`.
3. Delete `app/explore/` and the `ExploreViewToggle` component.
4. Add redirects: `/explore` → `/portfolio`, `/explore?view=map` → `/standards/strategic-plan/map`.
5. Remove "Explore" from `components/Sidebar.tsx`.
6. Update the steering grid on `app/page.tsx`: drop the Explore tile (4-tile grid: Projects, Submit a Project, Standards, Reports).
7. Sweep code references — none expected outside the surfaces above.
