// ============================================================
// Work Categories — "By problem" exploration axis
// ============================================================
// A taxonomy of the kinds of operational work UI's AI interventions help
// with. Complementary to the home-unit grouping on /portfolio: a Dean
// asking "I have a [reconciliation / scheduling / document review]
// problem — is anyone already on it?" can scan by category instead of
// by which unit owns the work.
//
// One intervention can sit in 2-3 categories (multi-tagged). Tags are
// audience-facing (a Dean's vocabulary), not technical jargon.
//
// ------------------------------------------------------------
// Evolution policy
// ------------------------------------------------------------
// Add a category:
//   1. Append a slug to WORK_CATEGORIES.
//   2. Add a matching entry in WORK_CATEGORY_LABELS.
//   3. Tag relevant interventions in lib/portfolio.ts.
//   ~5 minutes; tsc verifies the label record is exhaustive.
//
// Rename a category:
//   Change the slug in both WORK_CATEGORIES and WORK_CATEGORY_LABELS.
//   tsc surfaces every callsite that still uses the old slug
//   (intervention tags + UI consumers) — fix in one pass.
//
// Retire a category:
//   Remove the slug from WORK_CATEGORIES (and from WORK_CATEGORY_LABELS).
//   tsc finds every intervention still tagged with it — untag in one
//   pass. Don't soft-delete; if the category is gone, it's gone.
//
// Promote to first-class field:
//   If a category later deserves its own subnavigation or schema
//   relationship, the typed shape makes migration mechanical: grep for
//   the slug, lift the matching interventions into whatever new shape
//   is needed.
// ============================================================

export const WORK_CATEGORIES = [
  "documents",
  "process",
  "coordination",
  "reconciliation",
  "executive-analytics",
  "research-admin",
  "knowledge-retrieval",
  "ai-infrastructure",
] as const;

export type WorkCategory = (typeof WORK_CATEGORIES)[number];

export const WORK_CATEGORY_LABELS: Record<
  WorkCategory,
  { label: string; description: string }
> = {
  documents: {
    label: "Working with documents",
    description:
      "Extracting, reviewing, or finding answers in documents — contracts, reports, RFPs, audit findings.",
  },
  process: {
    label: "Streamlining a process",
    description:
      "Mapping, automating, or removing bottlenecks from operational workflows.",
  },
  coordination: {
    label: "Coordinating people and time",
    description:
      "Calendars, schedules, daily registers, multi-party logistics.",
  },
  reconciliation: {
    label: "Reconciling accounts and records",
    description:
      "Financial reviews, audit cycles, matching transactions to source data.",
  },
  "executive-analytics": {
    label: "Executive visibility",
    description:
      "Dashboards, strategic alignment, portfolio-level rollups for leadership.",
  },
  "research-admin": {
    label: "Research administration",
    description:
      "Proposal lifecycle, awards, sponsor compliance, ORED operations.",
  },
  "knowledge-retrieval": {
    label: "Searching institutional knowledge",
    description:
      "Retrieval and Q&A over policies, history, decisions — RAG-style.",
  },
  "ai-infrastructure": {
    label: "AI infrastructure",
    description:
      "LLM gateways, GPU stacks, agent platforms — the plumbing other interventions run on, not a problem on its own.",
  },
};

export function getWorkCategoryLabel(slug: WorkCategory): string {
  return WORK_CATEGORY_LABELS[slug].label;
}

export function getWorkCategoryDescription(slug: WorkCategory): string {
  return WORK_CATEGORY_LABELS[slug].description;
}
