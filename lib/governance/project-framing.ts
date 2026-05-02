// Stakeholder framing for the Data Governance Explorer detail pages.
//
// The governance catalog (lib/governance/catalog.ts) carries technical metadata —
// table counts, repository URLs, runtime modes. It does not carry the
// stakeholder-readable framing the .impeccable.md principle #1 requires
// ("every claim names a human"). This module supplies that.
//
// Source-of-truth note: all 5 governance projects (audit-dashboard, openera,
// processmapping, stratplan, ucm-daily-register) also exist in lib/portfolio.ts.
// The lede / owner data here is hand-written for the data-model surface
// specifically; when a fact diverges between this file and portfolio.ts, treat
// portfolio.ts as canonical and update here.

interface ProjectOwner {
  name: string;
  title?: string;
}

export interface ProjectFraming {
  /** Matches `slug` in lib/governance/catalog.ts. */
  slug: string;
  /** 1–2 sentence stakeholder-readable framing of what the project does. */
  lede: string;
  /** UI home unit whose work depends on the project. */
  homeUnit: string;
  /** Operational owner(s) — the people accountable for the outcome, not the build. */
  owners: ProjectOwner[];
  /** Matches `slug` in lib/portfolio.ts where the project is also a portfolio entry. */
  portfolioSlug?: string;
}

const FRAMINGS: ProjectFraming[] = [
  {
    slug: "audit-dashboard",
    portfolioSlug: "audit-dashboard",
    lede:
      "AI-assisted audit-observation lifecycle tracking. Ingests audit-report PDFs via OCR + LLM extraction, then carries corrective action items through closure for the Division of Financial Affairs.",
    homeUnit: "Division of Financial Affairs",
    owners: [{ name: "Kim Salisbury" }],
  },
  {
    slug: "openera",
    portfolioSlug: "openera",
    lede:
      "OpenERA is the institutional sponsored-research administration system, operated by IIDS for the Office of Research and Economic Development. The canonical implementor of the AI4RA Unified Data Model in research administration.",
    homeUnit: "Office of Research and Economic Development",
    owners: [{ name: "Sarah Martonick", title: "UI implementation owner" }],
  },
  {
    slug: "processmapping",
    portfolioSlug: "processmapping",
    lede:
      "Process intelligence platform for Research Administration. Documents who does what with which systems, surfaces process/tooling gaps, and feeds requirements for OpenERA and adjacent tools.",
    homeUnit: "Office of Sponsored Programs (ORED)",
    owners: [{ name: "Barrie Robison" }],
  },
  {
    slug: "stratplan",
    portfolioSlug: "stratplan",
    lede:
      "Executive visibility into 337 tactics aligned to the UI 2025–2030 Strategic Plan. Alignment, synergy, coverage, and investment-portfolio analytics for the Office of the President.",
    homeUnit: "Office of the President",
    owners: [{ name: "Michele Bartlett" }],
  },
  {
    slug: "ucm-daily-register",
    portfolioSlug: "ucm-daily-register",
    lede:
      "AI-assisted newsletter production pipeline for The Daily Register and My UI. Submission intake, AP+UI style enforcement, word-level diff review, and branded export for University Communications and Marketing.",
    homeUnit: "University Communications and Marketing",
    owners: [
      { name: "Joy Bauer" },
      { name: "Leigh Cooper" },
      { name: "Jodi Walker" },
    ],
  },
];

export function getProjectFraming(slug: string): ProjectFraming | undefined {
  return FRAMINGS.find((f) => f.slug === slug);
}

// Vocabulary-domain → governance-project slug that owns the domain.
// Domains observed in lib/governance/vocabularies.ts: audit, communications,
// processmapping, research-admin. research-admin is shared across multiple
// projects (OpenERA, Vandalizer); we attribute to OpenERA as the canonical
// UDM implementor for the domain.
const VOCABULARY_DOMAIN_PROJECT: Record<string, string> = {
  audit: "audit-dashboard",
  communications: "ucm-daily-register",
  processmapping: "processmapping",
  "research-admin": "openera",
};

export function getVocabularyDomainFraming(domain: string): ProjectFraming | undefined {
  const slug = VOCABULARY_DOMAIN_PROJECT[domain];
  if (!slug) return undefined;
  return getProjectFraming(slug);
}

/** Render owners as "Name, Name, Name +N" with optional title on the first. */
export function formatOwners(owners: ProjectOwner[], maxVisible = 3): string {
  if (owners.length === 0) return "";
  const visible = owners.slice(0, maxVisible).map((o) => o.name);
  const overflow = owners.length > maxVisible ? ` +${owners.length - maxVisible}` : "";
  return visible.join(", ") + overflow;
}
