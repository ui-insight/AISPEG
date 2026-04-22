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
    subtitle: "A tour of where we've been and where we're going.",
    audience: "Operational Excellence Strategic Plan Working Group",
    date: "April 22, 2026",
    author: "Barrie Robison · Lead, University of Idaho AI Initiative",
    abstract:
      "From the AI4RA beginning (July 1, 2025) through infrastructure investment, early wins across domains, the Feb 2026 agentic-development inflection, and the portfolio of AI interventions now underway at UI. Ends with a call to action for the Operational Excellence working group.",
    duration: "~45 min",
    status: "Ready",
  },
];

export function getDeckBySlug(slug: string): DeckMeta | undefined {
  return decks.find((d) => d.slug === slug);
}
