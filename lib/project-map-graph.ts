// ============================================================
// Project Map — graph data adapter
// ============================================================
// Server-side adapter that converts the typed portfolio +
// strategic-plan + work-categories modules into a graph shape ready
// for the bundled-network renderer on /explore (Map view).
//
// The renderer is dumb: this module is responsible for visibility
// filtering, stable ordering, and producing every node + link the
// view will draw. Empty seats (a priority with zero alignments, a
// project with zero categories) are part of the signal — they render.
//
// See issue #202 (and epic #201) for the contract.
// ============================================================

import {
  computePublicStage,
  getPubliclyVisible,
  type PublicStage,
} from "./portfolio";
import { pillars, priorities } from "./strategic-plan/catalog";
import {
  WORK_CATEGORIES,
  WORK_CATEGORY_LABELS,
  type WorkCategory,
} from "./work-categories";

export interface ProjectMapPriority {
  code: string;        // "A.1"
  text: string;        // priority text from catalog
  pillar: string;      // "A"
  pillarName: string;  // pillar.name from catalog
}

export interface ProjectMapProject {
  slug: string;
  name: string;
  tagline: string | null;
  homeUnits: string[];
  publicStage: PublicStage;
}

export interface ProjectMapCategory {
  slug: WorkCategory;
  label: string;
}

export interface ProjectMapLink {
  project: string;            // project slug
  side: "left" | "right";     // priority side or category side
  target: string;             // priority code or category slug
}

export interface ProjectMapGraph {
  priorities: ProjectMapPriority[];
  projects: ProjectMapProject[];
  categories: ProjectMapCategory[];
  links: ProjectMapLink[];
}

// `audience` is reserved for a future "internal" variant that surfaces
// Internal-only entries under /internal. v1 is public-only.
export function buildProjectMapGraph(
  _audience: "public",
): ProjectMapGraph {
  const pillarNameByCode = new Map(pillars.map((p) => [p.code, p.name]));

  const mapPriorities: ProjectMapPriority[] = [...priorities]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((p) => ({
      code: p.code,
      text: p.text,
      pillar: p.pillar,
      pillarName: pillarNameByCode.get(p.pillar) ?? p.pillar,
    }));

  const sourceProjects = getPubliclyVisible();

  const mapProjects: ProjectMapProject[] = [...sourceProjects]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline || null,
      homeUnits: p.homeUnits,
      publicStage: computePublicStage(p.status),
    }));

  // WORK_CATEGORIES is the declared display order — use it directly.
  const mapCategories: ProjectMapCategory[] = WORK_CATEGORIES.map((slug) => ({
    slug,
    label: WORK_CATEGORY_LABELS[slug].label,
  }));

  const links: ProjectMapLink[] = [];
  for (const project of sourceProjects) {
    for (const code of project.strategicPlanAlignment ?? []) {
      links.push({ project: project.slug, side: "left", target: code });
    }
    for (const slug of project.workCategories ?? []) {
      links.push({ project: project.slug, side: "right", target: slug });
    }
  }

  return {
    priorities: mapPriorities,
    projects: mapProjects,
    categories: mapCategories,
    links,
  };
}
