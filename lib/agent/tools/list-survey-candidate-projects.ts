// list_survey_candidate_projects — the Operational Excellence survey's
// demand signal turned into a potential-projects inventory (phase 2 of
// the survey ingest). Each candidate names the survey clusters that
// evidence it, its "by problem" category, and — honestly — how much of
// the demand the current portfolio already covers. These are proposals
// for triage, not commitments: no owners, dates, or ROI are asserted.

import "server-only";
import {
  candidateProjectsByCoverage,
  CANDIDATE_COVERAGE_LABEL,
} from "@/lib/surveys/candidate-projects";
import type { ToolHandler, ToolResult } from "./registry";

const CANONICAL_URL = "/standards/operational-excellence";

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const listSurveyCandidateProjectsTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "list_survey_candidate_projects",
      description:
        "Potential projects derived from the Operational Excellence survey's demand signal — the data-backed answer to 'what projects emerge from the faculty/staff (or student) survey'. Each candidate carries the problem in respondents' terms, a proposed shape, the survey clusters evidencing it, a coverage verdict against the current portfolio (gap = no current project, partial, covered), and related portfolio slugs. These are proposals awaiting triage — never present them as approved or resourced work.",
      parameters: {
        type: "object",
        properties: {
          coverage: {
            type: "string",
            description:
              "Optional filter: 'gap' (unmet demand), 'partial', or 'covered'. Omit for all, sorted gap-first.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const coverageFilter = pickString(rawArgs, "coverage");
    const all = candidateProjectsByCoverage();
    const filtered =
      coverageFilter === "gap" ||
      coverageFilter === "partial" ||
      coverageFilter === "covered"
        ? all.filter((c) => c.coverage === coverageFilter)
        : all;

    return {
      data: {
        total: all.length,
        returned: filtered.length,
        note: "Proposals derived from survey demand, awaiting CADSO/IIDS triage — not commitments.",
        candidates: filtered.map((c) => ({
          id: c.id,
          title: c.title,
          problem: c.problem,
          shape: c.shape,
          audiences: c.audiences,
          evidenceClusters: c.clusters,
          workCategory: c.workCategory,
          coverage: c.coverage,
          coverageLabel: CANDIDATE_COVERAGE_LABEL[c.coverage],
          relatedProjects: (c.relatedProjectSlugs ?? []).map(
            (slug) => `/portfolio/${slug}`
          ),
          note: c.note ?? null,
        })),
      },
      canonicalUrl: CANONICAL_URL,
      links: filtered
        .flatMap((c) => c.relatedProjectSlugs ?? [])
        .filter((slug, i, arr) => arr.indexOf(slug) === i)
        .map((slug) => ({ label: slug, url: `/portfolio/${slug}` })),
    };
  },
};
