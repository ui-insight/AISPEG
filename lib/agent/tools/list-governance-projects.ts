// list_governance_projects — the apps that participate in the
// AI4RA Unified Data Model. Sourced from the vendored governance
// catalog so it stays in lockstep with what /standards/data-model
// renders.

import "server-only";
import { projects as governanceProjects } from "@/lib/governance/catalog";
import type { ToolHandler, ToolResult } from "./registry";

export const listGovernanceProjectsTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "list_governance_projects",
      description:
        "Return the apps participating in the AI4RA Unified Data Model (UDM) — their names, domains, table counts, and where they sit in the data-governance catalog. Use for questions about data governance, the UDM, or which projects share a data model.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  async execute(): Promise<ToolResult> {
    return {
      data: {
        total: governanceProjects.length,
        projects: governanceProjects.map((p) => ({
          slug: p.slug,
          application: p.application,
          domain: p.domain,
          repository: p.repository,
          tableCount: p.tableCount,
          canonicalUdmCount: p.canonicalUdmCount,
          projectExtensionCount: p.projectExtensionCount,
          url: `/standards/data-model/projects/${p.slug}`,
        })),
      },
      canonicalUrl: "/standards/data-model",
      links: governanceProjects.map((p) => ({
        label: p.application,
        url: `/standards/data-model/projects/${p.slug}`,
      })),
    };
  },
};
