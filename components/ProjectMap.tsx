"use client";

// ============================================================
// ProjectMap — interactive visualization of the priorities ↔ projects ↔
// work-categories mesh. Slice 4 (this file): hover/focus highlight,
// click navigation, hash deep links, keyboard accessibility. Slice 5
// will mount this component under /explore behind a Tiles | Map toggle.
//
// Interaction model is intentionally NOT React-state-driven. Hover
// thrash on a state that re-renders 80+ SVG elements is wasteful, so
// focus is tracked in a ref and applied imperatively: applyFocus walks
// the DOM and sets data-focus="self"|"connected" on the affected
// nodes/edges, and the dimming is done by CSS rules in globals.css
// keyed off `[data-focused]` on the SVG root.
// ============================================================

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { line as d3Line, curveBundle } from "d3-shape";

import {
  buildProjectMapGraph,
  type ProjectMapGraph,
} from "@/lib/project-map-graph";
import {
  WORK_CATEGORY_LABELS,
  type WorkCategory,
} from "@/lib/work-categories";

const VIEW_W = 1100;
const VIEW_H = 900;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const R = 380;
const PILLAR_CENTROID_R = R * 0.55;
const PROJECT_HALF_HEIGHT = 330;
const ARC_LABEL_OFFSET = 10;
const PILLAR_LABEL_OFFSET = 44;
const NODE_R = 5;
// Project markers are horizontal pills, not points. The center column
// connects on TWO sides — priority links anchor at the LEFT edge, work-
// category links anchor at the RIGHT edge. Width is set to fit the
// longest project name in the inventory at PROJECT_LABEL_FONT_PX with
// a little breathing room; if a longer entry lands, bump this. The
// label sits inside the pill so bundled curves never cross it.
const PROJECT_BOX_W = 244;
const PROJECT_BOX_H = 24;
const PROJECT_LABEL_FONT_PX = 13;
const BUNDLE_BETA = 0.5;
const TOOLTIP_OFFSET = 14;

// Categorical pillar palette — Okabe-Ito subset, defined as CSS
// variables in app/globals.css and exposed as Tailwind utilities. The
// hue is the encoding; brand restraint is preserved at the chrome
// layer. See globals.css for the reasoning.
const PILLAR_FILL: Record<string, string> = {
  A: "fill-pillar-a",
  B: "fill-pillar-b",
  C: "fill-pillar-c",
  D: "fill-pillar-d",
  E: "fill-pillar-e",
};
const PILLAR_TEXT: Record<string, string> = {
  A: "fill-pillar-a",
  B: "fill-pillar-b",
  C: "fill-pillar-c",
  D: "fill-pillar-d",
  E: "fill-pillar-e",
};
// Edges saturate to /60 so the hue actually carries on a 0.7-stroke
// path. /30-/40 was perceptible only as a wash, not as a categorical
// signal.
const PILLAR_STROKE: Record<string, string> = {
  A: "stroke-pillar-a/60",
  B: "stroke-pillar-b/60",
  C: "stroke-pillar-c/60",
  D: "stroke-pillar-d/60",
  E: "stroke-pillar-e/60",
};

const FALLBACK_FILL = "fill-ink-muted";
const FALLBACK_TEXT = "fill-ink-muted";
const FALLBACK_STROKE = "stroke-ink-muted/50";

const bundleLine = d3Line<[number, number]>()
  .x((d) => d[0])
  .y((d) => d[1])
  .curve(curveBundle.beta(BUNDLE_BETA));

interface Polar {
  x: number;
  y: number;
  angleDeg: number;
}

// Arc spans are intentionally narrower than 180° so node positions stay
// clear of the central project column. Left = 130° (priorities + pillar
// labels), right = 110° (work categories — tighter because category
// labels are full phrases, not short codes).
function leftArcAngle(i: number, n: number): number {
  if (n === 1) return 180;
  return 245 - (i / (n - 1)) * 130;
}

function rightArcAngle(i: number, n: number): number {
  if (n === 1) return 0;
  return -55 + (i / (n - 1)) * 110;
}

function polar(angleDeg: number, radius: number): Polar {
  const t = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(t),
    y: CY + radius * Math.sin(t),
    angleDeg,
  };
}

function projectY(i: number, n: number): number {
  if (n === 1) return CY;
  return (
    CY - PROJECT_HALF_HEIGHT + (i / (n - 1)) * (2 * PROJECT_HALF_HEIGHT)
  );
}

function shouldFlipLabel(angleDeg: number): boolean {
  const wrapped = ((angleDeg % 360) + 360) % 360;
  return wrapped > 90 && wrapped < 270;
}

type NodeKind = "priority" | "project" | "category";
interface FocusedNode {
  kind: NodeKind;
  id: string;
}

function nodeKey(kind: NodeKind, id: string): string {
  return `${kind}-${id}`;
}

function leftEdgeKey(project: string, code: string): string {
  return `L|${project}|${code}`;
}

function rightEdgeKey(project: string, slug: string): string {
  return `R|${project}|${slug}`;
}

// Hash format: #project-<slug>, #priority-A.1, #category-<slug>.
// Priority codes contain dots, which are valid in URL fragments and
// don't need encoding. Slugs are lowercase with hyphens.
function hashFor(node: FocusedNode | null): string {
  if (!node) return "";
  return `#${node.kind}-${node.id}`;
}

function nodeFromHash(hash: string): FocusedNode | null {
  if (!hash || hash[0] !== "#") return null;
  const m = hash.slice(1).match(/^(priority|project|category)-(.+)$/);
  if (!m) return null;
  const kind = m[1] as NodeKind;
  return { kind, id: decodeURIComponent(m[2]) };
}

interface Adjacency {
  // For each project: connected priorities, categories, edge keys.
  byProject: Map<
    string,
    { priorities: Set<string>; categories: Set<string>; edgeKeys: Set<string> }
  >;
  // For each priority/category: connected projects + edge keys.
  byPriority: Map<string, { projects: Set<string>; edgeKeys: Set<string> }>;
  byCategory: Map<string, { projects: Set<string>; edgeKeys: Set<string> }>;
}

function buildAdjacency(graph: ProjectMapGraph): Adjacency {
  const byProject: Adjacency["byProject"] = new Map();
  const byPriority: Adjacency["byPriority"] = new Map();
  const byCategory: Adjacency["byCategory"] = new Map();

  const ensureProject = (slug: string) => {
    let entry = byProject.get(slug);
    if (!entry) {
      entry = { priorities: new Set(), categories: new Set(), edgeKeys: new Set() };
      byProject.set(slug, entry);
    }
    return entry;
  };
  const ensurePriority = (code: string) => {
    let entry = byPriority.get(code);
    if (!entry) {
      entry = { projects: new Set(), edgeKeys: new Set() };
      byPriority.set(code, entry);
    }
    return entry;
  };
  const ensureCategory = (slug: string) => {
    let entry = byCategory.get(slug);
    if (!entry) {
      entry = { projects: new Set(), edgeKeys: new Set() };
      byCategory.set(slug, entry);
    }
    return entry;
  };

  // Seed every node so isolated entries (no links) still have an
  // adjacency record — keeps later lookups branch-free.
  graph.projects.forEach((p) => ensureProject(p.slug));
  graph.priorities.forEach((p) => ensurePriority(p.code));
  graph.categories.forEach((c) => ensureCategory(c.slug));

  for (const link of graph.links) {
    if (link.side === "left") {
      const ek = leftEdgeKey(link.project, link.target);
      const pr = ensureProject(link.project);
      const pri = ensurePriority(link.target);
      pr.priorities.add(link.target);
      pr.edgeKeys.add(ek);
      pri.projects.add(link.project);
      pri.edgeKeys.add(ek);
    } else {
      const ek = rightEdgeKey(link.project, link.target);
      const pr = ensureProject(link.project);
      const cat = ensureCategory(link.target);
      pr.categories.add(link.target);
      pr.edgeKeys.add(ek);
      cat.projects.add(link.project);
      cat.edgeKeys.add(ek);
    }
  }
  return { byProject, byPriority, byCategory };
}

interface ConnectedSets {
  projects: Set<string>;
  priorities: Set<string>;
  categories: Set<string>;
  edgeKeys: Set<string>;
}

function connectedFor(node: FocusedNode, adj: Adjacency): ConnectedSets {
  if (node.kind === "project") {
    const e = adj.byProject.get(node.id);
    return {
      projects: new Set(),
      priorities: e?.priorities ?? new Set(),
      categories: e?.categories ?? new Set(),
      edgeKeys: e?.edgeKeys ?? new Set(),
    };
  }
  if (node.kind === "priority") {
    const e = adj.byPriority.get(node.id);
    return {
      projects: e?.projects ?? new Set(),
      priorities: new Set(),
      categories: new Set(),
      edgeKeys: e?.edgeKeys ?? new Set(),
    };
  }
  const e = adj.byCategory.get(node.id);
  return {
    projects: e?.projects ?? new Set(),
    priorities: new Set(),
    categories: new Set(),
    edgeKeys: e?.edgeKeys ?? new Set(),
  };
}

export default function ProjectMap() {
  const graph: ProjectMapGraph = buildProjectMapGraph("public");
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef<FocusedNode | null>(null);

  const adjacency = useMemo(() => buildAdjacency(graph), [graph]);

  // Position maps. Computed once per render — graph is server-derived
  // and stable, so this is constant work.
  const priorityPos = new Map<string, Polar>();
  graph.priorities.forEach((p, i) => {
    priorityPos.set(p.code, polar(leftArcAngle(i, graph.priorities.length), R));
  });

  const pillarMembers = new Map<string, string[]>();
  graph.priorities.forEach((p) => {
    const list = pillarMembers.get(p.pillar) ?? [];
    list.push(p.code);
    pillarMembers.set(p.pillar, list);
  });

  const pillarCentroid = new Map<string, Polar>();
  const pillarLabelPos = new Map<string, Polar>();
  for (const [pillar, codes] of pillarMembers) {
    const angles = codes
      .map((c) => priorityPos.get(c)?.angleDeg)
      .filter((a): a is number => typeof a === "number");
    const meanAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
    pillarCentroid.set(pillar, polar(meanAngle, PILLAR_CENTROID_R));
    pillarLabelPos.set(pillar, polar(meanAngle, R + PILLAR_LABEL_OFFSET));
  }

  const pillarOf = new Map<string, string>();
  graph.priorities.forEach((p) => pillarOf.set(p.code, p.pillar));

  const categoryPos = new Map<string, Polar>();
  graph.categories.forEach((c, i) => {
    categoryPos.set(
      c.slug,
      polar(rightArcAngle(i, graph.categories.length), R),
    );
  });

  const projectPos = new Map<string, { x: number; y: number }>();
  graph.projects.forEach((p, i) => {
    projectPos.set(p.slug, {
      x: CX,
      y: projectY(i, graph.projects.length),
    });
  });

  // ---------------- Focus + tooltip imperative core ----------------

  function applyFocus(node: FocusedNode | null) {
    focusedRef.current = node;
    const svg = svgRef.current;
    if (!svg) return;
    // Clear all existing focus markers.
    svg
      .querySelectorAll<HTMLElement>("[data-focus]")
      .forEach((el) => el.removeAttribute("data-focus"));
    if (!node) {
      svg.removeAttribute("data-focused");
      writeHash("");
      return;
    }
    svg.setAttribute("data-focused", nodeKey(node.kind, node.id));
    const selfEl = svg.querySelector(
      `[data-node-key="${nodeKey(node.kind, node.id)}"]`,
    );
    if (selfEl) selfEl.setAttribute("data-focus", "self");
    const sets = connectedFor(node, adjacency);
    const mark = (selector: string) => {
      svg.querySelectorAll(selector).forEach((el) => {
        el.setAttribute("data-focus", "connected");
      });
    };
    sets.projects.forEach((slug) =>
      mark(`[data-node-key="${nodeKey("project", slug)}"]`),
    );
    sets.priorities.forEach((code) =>
      mark(`[data-node-key="${nodeKey("priority", code)}"]`),
    );
    sets.categories.forEach((slug) =>
      mark(`[data-node-key="${nodeKey("category", slug)}"]`),
    );
    sets.edgeKeys.forEach((key) => mark(`[data-edge-key="${key}"]`));
    writeHash(hashFor(node));
  }

  function writeHash(newHash: string) {
    if (typeof window === "undefined") return;
    if (window.location.hash === newHash) return;
    if (newHash) {
      history.replaceState(null, "", newHash);
    } else {
      // Clear hash without leaving a trailing `#`.
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }

  function showTooltip(text: string, clientX: number, clientY: number) {
    const tt = tooltipRef.current;
    if (!tt) return;
    tt.textContent = text;
    tt.style.transform = `translate(${clientX + TOOLTIP_OFFSET}px, ${clientY + TOOLTIP_OFFSET}px)`;
    tt.style.opacity = "1";
  }

  function moveTooltip(clientX: number, clientY: number) {
    const tt = tooltipRef.current;
    if (!tt || tt.style.opacity === "0") return;
    tt.style.transform = `translate(${clientX + TOOLTIP_OFFSET}px, ${clientY + TOOLTIP_OFFSET}px)`;
  }

  function hideTooltip() {
    const tt = tooltipRef.current;
    if (!tt) return;
    tt.style.opacity = "0";
  }

  function navigate(node: FocusedNode) {
    if (node.kind === "project") {
      router.push(`/portfolio/${node.id}`);
      return;
    }
    if (node.kind === "priority") {
      router.push(`/standards/strategic-plan/priorities/${node.id}`);
      return;
    }
    router.push(`/explore#category-${node.id}`);
  }

  // Initial focus from URL hash + global keyboard listener.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const initial = nodeFromHash(window.location.hash);
    if (initial) applyFocus(initial);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && focusedRef.current) {
        applyFocus(null);
        hideTooltip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // applyFocus + hideTooltip are stable closures over refs/router;
    // re-running on every render would clobber user focus. The graph
    // is server-derived and doesn't change at runtime, so the empty
    // dep array is correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Render ----------------

  return (
    <>
      <div className="hidden md:block">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="project-map h-auto w-full"
          role="img"
          aria-label="Project Map — strategic priorities on the left grouped by pillar, projects in the middle, work categories on the right; bundled curves link each project to its declared alignments. Hover or tab to a node to highlight its connections."
        >
          {/* Edges */}
          <g fill="none" strokeWidth={0.7}>
            {graph.links.map((link, idx) => {
              const proj = projectPos.get(link.project);
              if (!proj) return null;

              // Project markers are pills, so links anchor at their
              // edges, not their centers. Left links emerge from the
              // LEFT edge; right links from the RIGHT edge.
              const projLeft = proj.x - PROJECT_BOX_W / 2;
              const projRight = proj.x + PROJECT_BOX_W / 2;

              if (link.side === "left") {
                const target = priorityPos.get(link.target);
                if (!target) return null;
                const pillar = pillarOf.get(link.target);
                const centroid = pillar
                  ? pillarCentroid.get(pillar)
                  : undefined;
                const points: Array<[number, number]> = centroid
                  ? [
                      [projLeft, proj.y],
                      [centroid.x, centroid.y],
                      [target.x, target.y],
                    ]
                  : [
                      [projLeft, proj.y],
                      [target.x, target.y],
                    ];
                const d = bundleLine(points) ?? "";
                const stroke =
                  (pillar && PILLAR_STROKE[pillar]) || FALLBACK_STROKE;
                return (
                  <path
                    key={`L|${link.project}|${link.target}|${idx}`}
                    data-edge-key={leftEdgeKey(link.project, link.target)}
                    d={d}
                    className={stroke}
                  />
                );
              }

              const target = categoryPos.get(link.target);
              if (!target) return null;
              // Mirror the left side: insert a control point at a
              // smaller radius along the same angle as the target so
              // the link draws as an arc, not a straight chord.
              const control = polar(target.angleDeg, PILLAR_CENTROID_R);
              const points: Array<[number, number]> = [
                [projRight, proj.y],
                [control.x, control.y],
                [target.x, target.y],
              ];
              const d = bundleLine(points) ?? "";
              return (
                <path
                  key={`R|${link.project}|${link.target}|${idx}`}
                  data-edge-key={rightEdgeKey(link.project, link.target)}
                  d={d}
                  className="stroke-brand-silver/40"
                />
              );
            })}
          </g>

          {/* Priorities */}
          <g>
            {graph.priorities.map((p) => {
              const pos = priorityPos.get(p.code);
              if (!pos) return null;
              const flip = shouldFlipLabel(pos.angleDeg);
              const label = polar(pos.angleDeg, R + ARC_LABEL_OFFSET);
              const rotation = flip ? pos.angleDeg + 180 : pos.angleDeg;
              const fill = PILLAR_FILL[p.pillar] || FALLBACK_FILL;
              const text = PILLAR_TEXT[p.pillar] || FALLBACK_TEXT;
              const node: FocusedNode = { kind: "priority", id: p.code };
              return (
                <g
                  key={p.code}
                  className="project-map-node cursor-pointer outline-none"
                  data-node-key={nodeKey("priority", p.code)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Priority ${p.code}: ${p.text}`}
                  onMouseEnter={(e) => {
                    applyFocus(node);
                    showTooltip(
                      `${p.code} — ${p.text}`,
                      e.clientX,
                      e.clientY,
                    );
                  }}
                  onMouseMove={(e) => moveTooltip(e.clientX, e.clientY)}
                  onMouseLeave={() => {
                    applyFocus(null);
                    hideTooltip();
                  }}
                  onFocus={() => applyFocus(node)}
                  onClick={() => navigate(node)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(node);
                    }
                  }}
                >
                  <circle cx={pos.x} cy={pos.y} r={NODE_R} className={fill} />
                  <text
                    x={label.x}
                    y={label.y}
                    transform={`rotate(${rotation}, ${label.x}, ${label.y})`}
                    textAnchor={flip ? "end" : "start"}
                    dy="0.32em"
                    className={`text-[13px] font-semibold ${text}`}
                  >
                    {p.code}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Pillar group headers — purely decorative, not interactive */}
          <g aria-hidden="true">
            {Array.from(pillarMembers.keys()).map((pillar) => {
              const pos = pillarLabelPos.get(pillar);
              if (!pos) return null;
              const flip = shouldFlipLabel(pos.angleDeg);
              const rotation = flip ? pos.angleDeg + 180 : pos.angleDeg;
              const text = PILLAR_TEXT[pillar] || FALLBACK_TEXT;
              return (
                <text
                  key={`pillar-${pillar}`}
                  x={pos.x}
                  y={pos.y}
                  transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}
                  textAnchor={flip ? "end" : "start"}
                  dy="0.32em"
                  className={`text-[22px] font-black ${text}`}
                >
                  {pillar}
                </text>
              );
            })}
          </g>

          {/* Projects */}
          <g>
            {graph.projects.map((p) => {
              const pos = projectPos.get(p.slug);
              if (!pos) return null;
              const node: FocusedNode = { kind: "project", id: p.slug };
              const tooltip = p.tagline ? `${p.name} — ${p.tagline}` : p.name;
              return (
                <g
                  key={p.slug}
                  className="project-map-node cursor-pointer outline-none"
                  data-node-key={nodeKey("project", p.slug)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Project ${p.name}${p.tagline ? `: ${p.tagline}` : ""}`}
                  onMouseEnter={(e) => {
                    applyFocus(node);
                    showTooltip(tooltip, e.clientX, e.clientY);
                  }}
                  onMouseMove={(e) => moveTooltip(e.clientX, e.clientY)}
                  onMouseLeave={() => {
                    applyFocus(null);
                    hideTooltip();
                  }}
                  onFocus={() => applyFocus(node)}
                  onClick={() => navigate(node)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(node);
                    }
                  }}
                >
                  {/* Project marker is a pill, not a point — left
                      links anchor on its left edge, right links on its
                      right edge. Label sits inside the pill so bundled
                      curves never cross the project name. */}
                  <rect
                    x={pos.x - PROJECT_BOX_W / 2}
                    y={pos.y - PROJECT_BOX_H / 2}
                    width={PROJECT_BOX_W}
                    height={PROJECT_BOX_H}
                    rx={4}
                    className="fill-white stroke-brand-black"
                    strokeWidth={1}
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    dy="0.34em"
                    textAnchor="middle"
                    className={`fill-brand-black font-semibold`}
                    fontSize={PROJECT_LABEL_FONT_PX}
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Categories */}
          <g>
            {graph.categories.map((c) => {
              const pos = categoryPos.get(c.slug);
              if (!pos) return null;
              const flip = shouldFlipLabel(pos.angleDeg);
              const label = polar(pos.angleDeg, R + ARC_LABEL_OFFSET);
              const rotation = flip ? pos.angleDeg + 180 : pos.angleDeg;
              const node: FocusedNode = { kind: "category", id: c.slug };
              const meta = WORK_CATEGORY_LABELS[c.slug as WorkCategory];
              const tooltip = meta
                ? `${meta.label} — ${meta.description}`
                : c.label;
              return (
                <g
                  key={c.slug}
                  className="project-map-node cursor-pointer outline-none"
                  data-node-key={nodeKey("category", c.slug)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Work category: ${c.label}`}
                  onMouseEnter={(e) => {
                    applyFocus(node);
                    showTooltip(tooltip, e.clientX, e.clientY);
                  }}
                  onMouseMove={(e) => moveTooltip(e.clientX, e.clientY)}
                  onMouseLeave={() => {
                    applyFocus(null);
                    hideTooltip();
                  }}
                  onFocus={() => applyFocus(node)}
                  onClick={() => navigate(node)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(node);
                    }
                  }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_R}
                    className="fill-ink-muted"
                  />
                  <text
                    x={label.x}
                    y={label.y}
                    transform={`rotate(${rotation}, ${label.x}, ${label.y})`}
                    textAnchor={flip ? "end" : "start"}
                    dy="0.32em"
                    className="fill-ink-muted text-[13px]"
                  >
                    {c.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <p className="block text-sm text-ink-muted md:hidden">
        Interactive map best viewed on a wider screen — switch to Tiles to
        browse on this device.
      </p>
      {/*
        Tooltip lives outside the SVG so it can use viewport coordinates
        and isn't bound by the SVG's painter-order. Updated imperatively
        on mouse events; React never re-renders it.
      */}
      <div
        ref={tooltipRef}
        role="tooltip"
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 max-w-xs rounded border border-hairline bg-white px-2.5 py-1.5 text-xs text-brand-black shadow-md transition-opacity duration-150"
        style={{ opacity: 0 }}
      />
    </>
  );
}
