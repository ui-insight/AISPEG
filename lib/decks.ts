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

export const decks: DeckMeta[] = [];

export function getDeckBySlug(slug: string): DeckMeta | undefined {
  return decks.find((d) => d.slug === slug);
}
