// ============================================================
// Pillar framing — stakeholder-readable orientation per pillar
// ============================================================
// One- or two-sentence plain-language framing for each strategic-plan
// pillar, drawn from a synthesis of the pillar name and its constituent
// priorities. The upstream submodule
// (vendor/strategic-plan/docs/) does not currently carry per-pillar
// framing, so these defaults are authored here and refined by IIDS over
// time. Tracked under #106 — refine the wording as stakeholder
// feedback comes in; the keys must stay aligned with the catalog.
// ============================================================

export const PILLAR_FRAMING: Record<string, string> = {
  A: "Centers the undergraduate experience — instruction, achievement, and well-being. Priorities span high-impact teaching, first-year support, AI literacy across disciplines, and campus belonging.",
  B: "Embeds applied, hands-on learning into every UI degree path. Priorities expand research opportunities, workforce and community partnerships, and the systems that make 100% participation achievable.",
  C: "Extends UI's reach beyond the residential cohort. Priorities span online learners, targeted regional investment, transfer pathways, and continuing education for in-demand careers.",
  D: "Concentrates research investment in high-impact areas and connects UI's research enterprise to Idaho. Priorities cover focus areas, infrastructure, industry partnerships, agency collaboration, and the state's healthcare-worker shortage.",
  E: "Modernizes UI's data, processes, and workforce so the institution can deliver on the other four pillars. Priorities cover the data warehouse, AI-driven process automation, faculty and staff support, and a culture of efficient execution.",
};

export function getPillarFraming(code: string): string | undefined {
  return PILLAR_FRAMING[code];
}
