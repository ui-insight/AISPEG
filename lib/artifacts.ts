// lib/artifacts.ts
//
// Unified timeline of public-facing artifacts: written briefs, activity
// reports, and external presentations. Backs the /reports surface, which
// is the single index for everything time-stamped.
//
// Sorting: every artifact carries an ISO-date `dateIso` that drives
// reverse-chronological order on /reports. `dateLabel` is the
// human-readable form for display (e.g. "February 7, 2026").
//
// Adding a new artifact: append to the array below. Mark `featured: true`
// to give it the hero spot on /reports (the most recent featured wins
// when multiple are flagged). Set `external: true` when the link goes
// outside the site so the card renders an external-link affordance.

export type ArtifactKind =
  | "activity-report" // Long-form internal report (e.g. monthly activity)
  | "brief"           // Executive briefing document
  | "presentation";   // External presentation, podium talk, etc.

export type ArtifactStatus = "Draft" | "Ready" | "Delivered";

export interface Artifact {
  slug: string;
  kind: ArtifactKind;
  title: string;
  subtitle?: string;
  /** Audience description shown on the card eyebrow. */
  audience: string;
  /** Display date string (e.g. "February 7, 2026"). */
  dateLabel: string;
  /** ISO date used for sorting. */
  dateIso: string;
  author: string;
  abstract: string;
  /** Where the card links. Internal route or external URL. */
  href: string;
  /** True if href is external (renders an outbound icon). */
  external?: boolean;
  /** Approximate runtime for decks/talks. */
  duration?: string;
  status?: ArtifactStatus;
  featured?: boolean;
  /** Tags that surface as small chips on the card. */
  tags?: string[];
}

export const artifacts: Artifact[] = [
  {
    slug: "dev-activity-report-feb-2026",
    kind: "activity-report",
    title: "Development Activity Report — February 1–26, 2026",
    subtitle: "Origin story",
    audience: "IIDS / ORED Leadership",
    dateLabel: "February 26, 2026",
    dateIso: "2026-02-26",
    author: "Barrie Robison",
    abstract:
      "The 26-day sprint that proved agentic development could work at institutional scale. 830 commits, 237,900 net new lines, 11 active repos, 10–16x productivity multiplier. Includes repository-by-repository analysis, adoption timeline, and methodology.",
    href: "/reports/feb-2026",
    featured: true,
    tags: ["Agentic development", "Force multiplier"],
  },
  {
    slug: "presidential-brief-feb-2026",
    kind: "brief",
    title:
      "Agentic AI: Evidence of Impact, Current Constraints, and Recommendations",
    audience: "University of Idaho Executive Leadership",
    dateLabel: "February 7, 2026",
    dateIso: "2026-02-07",
    author: "Barrie Robison",
    abstract:
      "Briefing for executive leadership on the transformative potential and organizational risks of Agentic AI. Covers active ORED projects leveraging agentic AI, force multiplier evidence, institutional constraints, and near-term recommendations.",
    href: "/reports/presidential-brief-feb-2026",
    tags: ["Executive briefing"],
  },
  {
    slug: "lovable-vibe-coding-2026",
    kind: "brief",
    title: "Cautionary tale: Lovable vibe-coding security crisis",
    audience: "UI institutional context",
    dateLabel: "April 21, 2026",
    dateIso: "2026-04-21",
    author: "IIDS",
    abstract:
      "External signal: Lovable left thousands of vibe-coded projects exposed for 48 days after closing the bug report without escalation. Documented breaches revealed source code, credentials, and real user records — a preview of what happens when AI-assisted development scales without institutional governance.",
    href: "/reports/lovable-vibe-coding-2026",
    tags: ["Cautionary tale", "External signal"],
  },
];

const KIND_LABELS: Record<ArtifactKind, string> = {
  "activity-report": "Activity report",
  brief: "Brief",
  presentation: "Presentation",
};

export function kindLabel(kind: ArtifactKind): string {
  return KIND_LABELS[kind];
}

/** Reverse-chronological ordering (newest first). */
export function sortedArtifacts(): Artifact[] {
  return [...artifacts].sort((a, b) =>
    a.dateIso < b.dateIso ? 1 : a.dateIso > b.dateIso ? -1 : 0
  );
}

/**
 * Most-recent featured artifact. Used by /reports for the hero card.
 * Returns null if nothing is featured.
 */
export function featuredArtifact(): Artifact | null {
  const featured = sortedArtifacts().filter((a) => a.featured);
  return featured[0] ?? null;
}

/** Everything that isn't the featured artifact, reverse-chrono. */
export function nonFeaturedArtifacts(): Artifact[] {
  const featured = featuredArtifact();
  return sortedArtifacts().filter((a) => a.slug !== featured?.slug);
}
