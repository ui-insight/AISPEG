// list_site_areas — meta-tool that describes the site's information
// architecture. Lets the agent answer "what's on this site?" or
// "where would I find X?" by reaching for a structured map of the
// top-level surfaces and their purposes.
//
// This is intentionally hard-coded rather than scraped from the
// filesystem: the IA description is editorial and should match how
// stakeholders are told to think about the site (per CLAUDE.md), not
// the raw file tree.

import "server-only";
import type { ToolHandler, ToolResult } from "./registry";

interface SiteArea {
  name: string;
  url: string;
  purpose: string;
  example_questions?: string[];
  sub_areas?: { name: string; url: string; purpose: string }[];
}

const SITE_AREAS: SiteArea[] = [
  {
    name: "Projects",
    url: "/portfolio",
    purpose:
      "The IIDS-coordinated portfolio of AI projects across UI units. Each project lists its home unit, operational owner, lifecycle status, and active blockers.",
    example_questions: [
      "What projects is IIDS working on?",
      "Who owns DGX Stack?",
      "What's the status of MindRouter?",
    ],
  },
  {
    name: "Explore",
    url: "/explore",
    purpose:
      "Browse the portfolio by problem area instead of by home unit. Categories include automation, communication, decision support, and others.",
  },
  {
    name: "Submit a Project",
    url: "/builder-guide",
    purpose:
      "9-step assessment for submitting a new AI project idea to IIDS. Routes to a named owner with a 2-business-day SLA.",
  },
  {
    name: "Standards",
    url: "/standards",
    purpose:
      "The institutional standards ledger — the catalog of IT, data, and AI governance standards surfaced through this portal, with drafting status (not started / in discussion / in draft / approved) per entry.",
    example_questions: [
      "What standards are in draft?",
      "Which standards have been approved?",
    ],
    sub_areas: [
      {
        name: "Data Model Explorer",
        url: "/standards/data-model",
        purpose:
          "Unified Data Model (UDM) explorer — tables, columns, controlled vocabularies across governed projects.",
      },
      {
        name: "Strategic Plan Alignment",
        url: "/standards/strategic-plan",
        purpose:
          "Maps portfolio projects to the UI Strategic Plan pillars and priorities. Bidirectional — see which projects advance each priority.",
      },
    ],
  },
  {
    name: "Reports",
    url: "/reports",
    purpose:
      "Time-stamped activity reports, briefs, and external presentations. Reverse-chronological feed.",
    example_questions: [
      "What's the latest IIDS report?",
      "Show me the executive briefings.",
    ],
  },
  {
    name: "About",
    url: "/about",
    purpose:
      "Strategic frame for IIDS-coordinated AI work: the AI4RA partnership, IIDS's role as operator, and how the site fits the broader institutional initiative.",
  },
  {
    name: "AI4RA Ecosystem",
    url: "/ai4ra-ecosystem",
    purpose:
      "Deep-dive on the UI + Southern Utah University AI4RA partnership: OpenERA, Vandalizer, MindRouter, ProcessMapping, and the shared Unified Data Model.",
  },
];

export const listSiteAreasTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "list_site_areas",
      description:
        "Return the site's information architecture — every top-level surface, its purpose, and example questions it answers. Use this when the user asks 'what's on this site?', 'where would I find X?', or any meta-navigation question. Also use it as a first step when you're unsure which other tool would best answer a query.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  async execute(): Promise<ToolResult> {
    return {
      data: { areas: SITE_AREAS },
      canonicalUrl: "/",
      links: SITE_AREAS.map((a) => ({ label: a.name, url: a.url })),
    };
  },
};
