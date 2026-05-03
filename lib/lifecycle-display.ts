// ============================================================
// Lifecycle Display — UI helpers for ADR 0001
// ============================================================
// Centralised labels, colors, and rollups for the operational ladder
// and public-stage axes. Imported by PortfolioCard, PortfolioFilters,
// the landing stat strip, and the /explore tile breakdowns.
//
// Color rule (locked in .impeccable.md):
//   - Public-stage chips carry stage-specific color (silver / huckleberry /
//     clearwater / gray / huckleberry-tint).
//   - Operational chips are ALWAYS neutral surface — same restraint as
//     the work-categories chips. No per-status color.
// ============================================================

import {
  computePublicStage,
  type ProjectStatus,
  type PublicStage,
} from "./portfolio";

export const PUBLIC_STAGE_LABEL: Record<PublicStage, string> = {
  exploring: "Exploring",
  building: "Building",
  live: "Live",
  retired: "Retired",
  tracked: "Tracked",
};

// Tailwind class strings for each public-stage chip.
// Each entry is a one-shot className for a chip with border + bg + text.
export const PUBLIC_STAGE_CHIP: Record<PublicStage, string> = {
  exploring: "border-brand-silver/40 bg-brand-silver/10 text-brand-silver",
  building: "border-brand-huckleberry/30 bg-brand-huckleberry/10 text-brand-huckleberry",
  live: "border-brand-clearwater/40 bg-brand-clearwater/10 text-brand-clearwater",
  retired: "border-gray-200 bg-gray-50 text-gray-500",
  tracked: "border-brand-huckleberry/30 bg-brand-huckleberry/10 text-brand-huckleberry",
};

// Reading-order list — used by the filter UI and the landing stat strip.
// `tracked` is omitted from the conventional progression and tacked on
// at the end since it's a meta-state that bypasses the ladder.
export const PUBLIC_STAGE_ORDER: PublicStage[] = [
  "exploring",
  "building",
  "live",
  "retired",
  "tracked",
];

export const OPERATIONAL_LABEL: Record<ProjectStatus, string> = {
  idea: "Idea",
  approved: "Approved",
  building: "Building",
  prototype: "Prototype",
  piloting: "Piloting",
  production: "Production",
  maintained: "Maintained",
  sunsetting: "Sunsetting",
  archived: "Archived",
  tracked: "Tracked",
};

// Tooltip-grade definitions for the colored chips on PortfolioCard. Each
// string is short enough to read in a native `title` tooltip; together
// they replace the bottom-of-page "How to read this inventory" callout.
export const PUBLIC_STAGE_TITLE: Record<PublicStage, string> = {
  exploring: "Exploring — idea or approval phase; not yet being built.",
  building: "Building — actively being built or prototyped by IIDS.",
  live: "Live — piloting, in production, or maintained.",
  retired: "Retired — sunsetting or archived.",
  tracked: "Tracked — in the inventory but not built by IIDS.",
};

export const OPERATIONAL_TITLE: Record<ProjectStatus, string> = {
  idea: "Idea — proposal not yet evaluated.",
  approved: "Approved — green-lit but not yet started.",
  building: "Building — under active development.",
  prototype: "Prototype — early build, not yet user-tested.",
  piloting: "Piloting — limited user base validating the build.",
  production: "Production — broadly deployed and in use.",
  maintained: "Maintained — production with ongoing support.",
  sunsetting: "Sunsetting — being phased out.",
  archived: "Archived — fully retired.",
  tracked: "Tracked — externally owned, in inventory only.",
};

// Inverse of computePublicStage — for the filter drill-in.
// Lists the 1-N operational states that roll up into each public stage,
// in approximate ladder order.
export const STAGE_OPERATIONAL_ROLLUP: Record<PublicStage, ProjectStatus[]> = {
  exploring: ["idea", "approved"],
  building: ["building", "prototype"],
  live: ["piloting", "production", "maintained"],
  retired: ["sunsetting", "archived"],
  tracked: ["tracked"],
};

// String-input version of computePublicStage. Postgres-sourced rows
// carry status as a plain string; if a row has a status outside the
// canonical 10-value union (drift, legacy data, etc.), bucket it as
// `exploring` so the UI never crashes.
export function publicStageFromStatus(status: string): PublicStage {
  if (isProjectStatus(status)) return computePublicStage(status);
  return "exploring";
}

const STATUSES: ReadonlyArray<ProjectStatus> = [
  "idea",
  "approved",
  "building",
  "prototype",
  "piloting",
  "production",
  "maintained",
  "sunsetting",
  "archived",
  "tracked",
];

export function isProjectStatus(s: string): s is ProjectStatus {
  return (STATUSES as readonly string[]).includes(s);
}

// Aggregate stage counts across a list of items keyed by status. Used by
// the landing stat strip and /explore tile breakdowns. Returns the stages
// in PUBLIC_STAGE_ORDER, with zero-count stages dropped.
export function stageBreakdown(
  items: ReadonlyArray<{ status: string }>
): Array<{ stage: PublicStage; count: number }> {
  const counts = new Map<PublicStage, number>();
  for (const item of items) {
    const stage = publicStageFromStatus(item.status);
    counts.set(stage, (counts.get(stage) ?? 0) + 1);
  }
  return PUBLIC_STAGE_ORDER.filter((s) => (counts.get(s) ?? 0) > 0).map(
    (stage) => ({ stage, count: counts.get(stage)! })
  );
}
