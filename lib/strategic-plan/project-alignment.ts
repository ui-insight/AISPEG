// ============================================================
// Strategic Plan ↔ Portfolio reverse-direction lookups
// ============================================================
// Returns the portfolio entries that have declared alignment with a
// given priority code. Reads directly from lib/portfolio.ts (the typed
// seed source) so the strategic-plan pages stay statically renderable
// — no DB coupling. Once ClickUp wiring lands and lib/portfolio.ts
// retires, swap this to read from Postgres via lib/work.ts.
// ============================================================

import { interventions, type Intervention } from "../portfolio";

export interface AlignedProject {
  slug: string;
  name: string;
  tagline: string;
  status: Intervention["status"];
  homeUnits: string[];
  ownerNames: string[];
  visibility: Intervention["visibility"];
}

function toAlignedProject(i: Intervention): AlignedProject {
  return {
    slug: i.slug,
    name: i.name,
    tagline: i.tagline,
    status: i.status,
    homeUnits: i.homeUnits,
    ownerNames: i.operationalOwners.map((o) => o.name),
    visibility: i.visibility,
  };
}

// Public-facing lookup. Excludes "Internal-only" entries so the
// strategic-plan UI matches what /portfolio surfaces to anonymous
// readers. Embargoed ("Partial") entries are included — same rule
// PortfolioCard / lib/work.ts uses for the public audience.
export function getProjectsForPriority(code: string): AlignedProject[] {
  return interventions
    .filter(
      (i) =>
        i.visibility !== "Internal-only" &&
        (i.strategicPlanAlignment ?? []).includes(code),
    )
    .map(toAlignedProject)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function countProjectsForPriority(code: string): number {
  return getProjectsForPriority(code).length;
}
