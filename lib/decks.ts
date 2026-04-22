// ============================================================
// Interactive presentation decks (reveal.js)
// Distinct from lib/data.ts `presentations` which catalogs PDF briefs.
// ============================================================

export interface DeckMeta {
  slug: string;
  title: string;
  subtitle?: string;
  audience: string;
  date: string;
  author: string;
  abstract: string;
  duration?: string;
  status: "Draft" | "Ready" | "Delivered";
}

export const decks: DeckMeta[] = [
  {
    slug: "operational-excellence",
    title: "AI Interventions for Operational Excellence",
    subtitle: "Approach, portfolio, and the path forward",
    audience: "Operational Excellence Strategic Plan Working Group",
    date: "Spring 2026",
    author: "Barrie Robison · AISPEG",
    abstract:
      "How AISPEG and the University of Idaho are approaching AI interventions for operational excellence — the principles that guide us, the portfolio of projects we have going, and how the pieces fit together into an institutional strategy.",
    duration: "~45 min",
    status: "Draft",
  },
];

export function getDeckBySlug(slug: string): DeckMeta | undefined {
  return decks.find((d) => d.slug === slug);
}
