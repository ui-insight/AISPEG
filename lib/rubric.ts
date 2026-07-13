// lib/rubric.ts
//
// The AI4UI Project Prioritization Scorecard, published on
// /portfolio/pipeline. Content mirrors Colin Addington's "Prioritization
// Rubric" document (July 2026); field ids for the matching ClickUp
// instrument live in lib/clickup.ts RUBRIC_FIELDS.
//
// Each criterion is scored 1 (low) to 5 (high); scores are multiplied by
// the category weight to produce the priority score. The ClickUp formula
// is (A1–A4 × 0.10 + B1–B4 × 0.075 + C1–C3 × 0.10) × 20, on a 0–100
// scale — equivalent to the document's category weights (A 40%, B 30%,
// C 30%).

export interface RubricAnchor {
  /** The scored value the anchor defines (typically 1, 3, 5). */
  score: number;
  text: string;
}

export interface RubricCriterion {
  /** Short code as used in ClickUp field names and table headers. */
  code: string;
  /** Key into ScoredRequest.rubric (lib/clickup-data.ts). */
  key: "a1" | "a2" | "a3" | "a4" | "b1" | "b2" | "b3" | "b4" | "c1" | "c2" | "c3";
  group: "A" | "B" | "C";
  name: string;
  weight: number;
  /** Published scoring anchors from the rubric document. */
  anchors: RubricAnchor[];
}

export interface RubricGroup {
  code: "A" | "B" | "C";
  name: string;
  /** Category weight from the rubric document. */
  weight: string;
  /** The question the category answers, verbatim from the document. */
  description: string;
}

export const RUBRIC_GROUPS: readonly RubricGroup[] = [
  {
    code: "A",
    name: "Strategic Value & ROI",
    weight: "40%",
    description: "How much does this matter to the university as a whole?",
  },
  {
    code: "B",
    name: "Feasibility & Risk",
    weight: "30%",
    description: "Can we realistically build and deliver this?",
  },
  {
    code: "C",
    name: "User Value & Adoption",
    weight: "30%",
    description: "Will people use this and will it solve a real problem?",
  },
] as const;

export const RUBRIC_CRITERIA: readonly RubricCriterion[] = [
  {
    code: "A1",
    key: "a1",
    group: "A",
    weight: 0.1,
    name: "Alignment with University Strategic Plan",
    anchors: [
      { score: 1, text: "No alignment." },
      { score: 5, text: "Directly supports a core strategic priority." },
    ],
  },
  {
    code: "A2",
    key: "a2",
    group: "A",
    weight: 0.1,
    name: "Financial Impact (Savings/Revenue)",
    anchors: [
      { score: 1, text: "Minimal (<$10k/yr)." },
      { score: 3, text: "Moderate ($50k/yr)." },
      {
        score: 5,
        text: "Transformative (>$250k/yr or significant grant revenue enabled).",
      },
    ],
  },
  {
    code: "A3",
    key: "a3",
    group: "A",
    weight: 0.1,
    name: "Breadth of Impact (Number of Users/Depts)",
    anchors: [
      { score: 1, text: "Impacts a single individual." },
      { score: 3, text: "Impacts a whole department." },
      { score: 5, text: "Impacts multiple divisions or the entire campus." },
    ],
  },
  {
    code: "A4",
    key: "a4",
    group: "A",
    weight: 0.1,
    name: "Reputational Benefit & Visibility",
    anchors: [
      { score: 1, text: "Purely internal." },
      { score: 3, text: "Positive internal visibility." },
      {
        score: 5,
        text: "Positions UI as a national leader in a specific area.",
      },
    ],
  },
  {
    code: "B1",
    key: "b1",
    group: "B",
    weight: 0.075,
    name: "Technical Complexity",
    anchors: [
      { score: 1, text: "Requires novel R&D." },
      { score: 3, text: "Uses established methods." },
      {
        score: 5,
        text: "Simple application of existing IIDS software stacks.",
      },
    ],
  },
  {
    code: "B2",
    key: "b2",
    group: "B",
    weight: 0.075,
    name: "Data Availability & Quality",
    anchors: [
      { score: 1, text: "Data does not exist or is unusable." },
      { score: 3, text: "Data exists but requires significant cleaning." },
      { score: 5, text: "Data is clean and accessible." },
    ],
  },
  {
    code: "B3",
    key: "b3",
    group: "B",
    weight: 0.075,
    name: "Time to Deliver MVP (Minimum Viable Product)",
    anchors: [
      { score: 1, text: "> 9 months." },
      { score: 3, text: "4–6 months." },
      { score: 5, text: "< 3 months." },
    ],
  },
  {
    code: "B4",
    key: "b4",
    group: "B",
    weight: 0.075,
    name: "Technical Load / Maintenance",
    anchors: [
      {
        score: 1,
        text: "Requires extensive ongoing maintenance or training.",
      },
      { score: 3, text: "Typical bug squashing and support." },
      { score: 5, text: "One-time fix with no ongoing support." },
    ],
  },
  {
    code: "C1",
    key: "c1",
    group: "C",
    weight: 0.1,
    name: "Urgency & Pain Point Severity",
    anchors: [
      { score: 1, text: "“Nice to have.”" },
      { score: 3, text: "Solves a known frustration." },
      {
        score: 5,
        text: "Solves a critical compliance, security, or operational bottleneck.",
      },
    ],
  },
  {
    code: "C2",
    key: "c2",
    group: "C",
    weight: 0.1,
    name: "Depth of Impact (Improvement per User)",
    anchors: [
      { score: 1, text: "Minor convenience." },
      { score: 3, text: "Saves a user a few hours per month." },
      {
        score: 5,
        text: "Automates a major, time-consuming part of a user's job.",
      },
    ],
  },
  {
    code: "C3",
    key: "c3",
    group: "C",
    weight: 0.1,
    name: "Champion & Departmental Buy-in",
    anchors: [
      { score: 1, text: "No clear champion." },
      { score: 3, text: "A department is interested." },
      {
        score: 5,
        text: "A department head is actively advocating for the project.",
      },
    ],
  },
] as const;

/** The published formula, for display. */
export const RUBRIC_FORMULA =
  "(A1–A4 × 0.10 + B1–B4 × 0.075 + C1–C3 × 0.10) × 20";
