// lookup_portfolio_entry — fetch a single portfolio entry by slug.
// Complements search_portfolio (which returns shallow rows) with a
// detailed view including description, features, owners, and active
// blockers.

import "server-only";
import { getApplicationBySlug } from "@/lib/work";
import type { ToolHandler, ToolResult } from "./registry";

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const lookupPortfolioEntryTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "lookup_portfolio_entry",
      description:
        "Fetch the full record for a single project by its slug. Returns description, features, owners, status detail, repo/docs/live URLs, and currently active blockers (public-tier text only). Use this when the user asks about a specific project by name and search_portfolio returned the slug.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description:
              "The project's URL slug (e.g. 'mindrouter', 'openera', 'ucm-daily-register'). Use the slug returned by search_portfolio.",
          },
        },
        required: ["slug"],
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs, ctx): Promise<ToolResult> {
    const slug = pickString(rawArgs, "slug");
    if (!slug) {
      return {
        data: { error: "slug is required" },
        canonicalUrl: "/portfolio",
      };
    }
    const app = await getApplicationBySlug(slug, { audience: ctx.audience });
    if (!app) {
      return {
        data: { found: false, slug },
        canonicalUrl: "/portfolio",
      };
    }
    return {
      data: {
        found: true,
        slug: app.slug,
        name: app.name,
        tagline: app.tagline,
        description: app.description,
        homeUnits: app.homeUnits,
        operationalOwners: app.operationalOwners,
        buildParticipants: app.buildParticipants,
        status: app.status,
        iidsSponsor: app.iidsSponsor || null,
        institutionalReviewStatus: app.institutionalReviewStatus ?? null,
        productionScope: app.productionScope ?? null,
        supportContact: app.supportContact ?? null,
        ai4raRelationship: app.ai4raRelationship,
        repoUrl: app.repoUrl ?? null,
        docsUrl: app.docsUrl ?? null,
        liveUrl: app.liveUrl ?? null,
        funding: app.funding ?? null,
        operationalFunction: app.operationalFunction,
        operationalExcellenceOutcome: app.operationalExcellenceOutcome,
        features: app.features,
        tech: app.tech,
        workCategories: app.workCategories,
        strategicPlanAlignment: app.strategicPlanAlignment,
        activeBlockers: app.activeBlockers.map((b) => ({
          category: b.category,
          severity: b.severity,
          since: b.since,
          publicText: b.publicText,
        })),
        url: `/portfolio/${app.slug}`,
      },
      canonicalUrl: `/portfolio/${app.slug}`,
    };
  },
};
