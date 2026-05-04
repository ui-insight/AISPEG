"use client";

// ============================================================
// ProjectMap — interactive visualization of the priorities ↔ projects ↔
// work-categories mesh. Slice 3 (this file): pillar coloring + hierarchical
// edge bundling on the left arc. Slice 4 layers on interaction; slice 5
// mounts the component under /explore behind a Tiles | Map toggle.
//
// Bundling: each left-side edge (project → priority) routes through its
// pillar centroid before reaching the priority dot. d3-shape's
// `curveBundle.beta(0.5)` smooths [project, centroid, priority] into a
// trunked curve; many edges sharing a centroid produce the visible
// pillar trunks. Right-side edges (project → category) stay 2-point
// (essentially straight) — there's no intermediate grouping defined for
// categories in v1.
// ============================================================

import { line as d3Line, curveBundle } from "d3-shape";

import {
  buildProjectMapGraph,
  type ProjectMapGraph,
} from "@/lib/project-map-graph";

const VIEW_W = 1100;
const VIEW_H = 900;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const R = 380;
const PILLAR_CENTROID_R = R * 0.55;     // trunk converges here before fanning
const PROJECT_HALF_HEIGHT = 320;
const ARC_LABEL_OFFSET = 8;
const PILLAR_LABEL_OFFSET = 38;          // pillar code outside the arc labels
const PROJECT_LABEL_OFFSET = 10;
const NODE_R = 4;
const PROJECT_NODE_R = 5;
const BUNDLE_BETA = 0.5;                 // 0 = pure spline, 1 = straight

// Pillar palette — see issue #204. ui-gold is reserved (per .impeccable.md)
// so no pillar gets it. Keys must match Pillar.code in lib/strategic-plan.
//
// Tailwind v4 scans this file for class strings, so the literals here
// are sufficient to generate the utilities.
const PILLAR_FILL: Record<string, string> = {
  A: "fill-brand-huckleberry",
  B: "fill-brand-lupine",
  C: "fill-brand-clearwater",
  D: "fill-brand-silver",
  E: "fill-ui-charcoal",
};
const PILLAR_TEXT: Record<string, string> = {
  A: "fill-brand-huckleberry",
  B: "fill-brand-lupine",
  C: "fill-brand-clearwater",
  D: "fill-brand-silver",
  E: "fill-ui-charcoal",
};
const PILLAR_STROKE: Record<string, string> = {
  A: "stroke-brand-huckleberry/40",
  B: "stroke-brand-lupine/40",
  C: "stroke-brand-clearwater/40",
  D: "stroke-brand-silver/40",
  E: "stroke-ui-charcoal/30",
};

const FALLBACK_FILL = "fill-brand-silver";
const FALLBACK_TEXT = "fill-ink-muted";
const FALLBACK_STROKE = "stroke-brand-silver/40";

const bundleLine = d3Line<[number, number]>()
  .x((d) => d[0])
  .y((d) => d[1])
  .curve(curveBundle.beta(BUNDLE_BETA));

interface Polar {
  x: number;
  y: number;
  angleDeg: number;
}

// Sweep the left arc top-down. SVG uses y-down, so sin>0 means below
// center. θ=260° gives sin≈-0.98 (top), θ=100° gives sin≈+0.98
// (bottom); cos≈-0.17 in both, so x is to the left of center.
function leftArcAngle(i: number, n: number): number {
  if (n === 1) return 180;
  return 260 - (i / (n - 1)) * 160;
}

// Right arc: θ=-80° at top (sin≈-0.98), θ=+80° at bottom; cos≈+0.17.
function rightArcAngle(i: number, n: number): number {
  if (n === 1) return 0;
  return -80 + (i / (n - 1)) * 160;
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

// True for arc labels on the left half — text would render upside-down
// without a 180° flip.
function shouldFlipLabel(angleDeg: number): boolean {
  const wrapped = ((angleDeg % 360) + 360) % 360;
  return wrapped > 90 && wrapped < 270;
}

export default function ProjectMap() {
  const graph: ProjectMapGraph = buildProjectMapGraph("public");

  // Per-priority angle + screen position.
  const priorityPos = new Map<string, Polar>();
  graph.priorities.forEach((p, i) => {
    priorityPos.set(p.code, polar(leftArcAngle(i, graph.priorities.length), R));
  });

  // Pillar centroid: mean angle of the pillar's priorities, projected onto
  // the trunk radius. All edges entering a pillar pass through this point,
  // which is what produces the visible bundling.
  const pillarCentroid = new Map<string, Polar>();
  const pillarMembers = new Map<string, string[]>();
  graph.priorities.forEach((p) => {
    const list = pillarMembers.get(p.pillar) ?? [];
    list.push(p.code);
    pillarMembers.set(p.pillar, list);
  });
  for (const [pillar, codes] of pillarMembers) {
    const angles = codes
      .map((c) => priorityPos.get(c)?.angleDeg)
      .filter((a): a is number => typeof a === "number");
    const meanAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
    pillarCentroid.set(pillar, polar(meanAngle, PILLAR_CENTROID_R));
  }

  // Pillar code → label anchor (for the small group header outside the arc).
  const pillarLabelPos = new Map<string, Polar>();
  for (const [pillar, codes] of pillarMembers) {
    const angles = codes
      .map((c) => priorityPos.get(c)?.angleDeg)
      .filter((a): a is number => typeof a === "number");
    const meanAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
    pillarLabelPos.set(pillar, polar(meanAngle, R + PILLAR_LABEL_OFFSET));
  }

  // Pillar lookup for any priority code (used by edge coloring).
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

  return (
    <>
      <div className="hidden md:block">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Project Map — strategic priorities on the left grouped by pillar, projects in the middle, work categories on the right; bundled curves trunk through each pillar centroid before fanning to individual priorities."
        >
          <g fill="none" strokeWidth={0.7}>
            {graph.links.map((link, idx) => {
              const proj = projectPos.get(link.project);
              if (!proj) return null;

              if (link.side === "left") {
                const target = priorityPos.get(link.target);
                if (!target) return null;
                const pillar = pillarOf.get(link.target);
                const centroid = pillar
                  ? pillarCentroid.get(pillar)
                  : undefined;
                const points: Array<[number, number]> = centroid
                  ? [[proj.x, proj.y], [centroid.x, centroid.y], [target.x, target.y]]
                  : [[proj.x, proj.y], [target.x, target.y]];
                const d = bundleLine(points) ?? "";
                const stroke =
                  (pillar && PILLAR_STROKE[pillar]) || FALLBACK_STROKE;
                return (
                  <path
                    key={`L|${link.project}|${link.target}|${idx}`}
                    d={d}
                    className={stroke}
                  />
                );
              }

              const target = categoryPos.get(link.target);
              if (!target) return null;
              const points: Array<[number, number]> = [
                [proj.x, proj.y],
                [target.x, target.y],
              ];
              const d = bundleLine(points) ?? "";
              return (
                <path
                  key={`R|${link.project}|${link.target}|${idx}`}
                  d={d}
                  className="stroke-brand-silver/40"
                />
              );
            })}
          </g>

          <g>
            {graph.priorities.map((p) => {
              const pos = priorityPos.get(p.code);
              if (!pos) return null;
              const flip = shouldFlipLabel(pos.angleDeg);
              const label = polar(pos.angleDeg, R + ARC_LABEL_OFFSET);
              const rotation = flip ? pos.angleDeg + 180 : pos.angleDeg;
              const fill = PILLAR_FILL[p.pillar] || FALLBACK_FILL;
              const text = PILLAR_TEXT[p.pillar] || FALLBACK_TEXT;
              return (
                <g key={p.code}>
                  <circle cx={pos.x} cy={pos.y} r={NODE_R} className={fill} />
                  <text
                    x={label.x}
                    y={label.y}
                    transform={`rotate(${rotation}, ${label.x}, ${label.y})`}
                    textAnchor={flip ? "end" : "start"}
                    dy="0.32em"
                    className={`text-[9px] ${text}`}
                  >
                    {p.code}
                  </text>
                </g>
              );
            })}
          </g>

          <g>
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
                  className={`text-[14px] font-black ${text}`}
                >
                  {pillar}
                </text>
              );
            })}
          </g>

          <g>
            {graph.categories.map((c) => {
              const pos = categoryPos.get(c.slug);
              if (!pos) return null;
              const flip = shouldFlipLabel(pos.angleDeg);
              const label = polar(pos.angleDeg, R + ARC_LABEL_OFFSET);
              const rotation = flip ? pos.angleDeg + 180 : pos.angleDeg;
              return (
                <g key={c.slug}>
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
                    className="fill-ink-muted text-[10px]"
                  >
                    {c.label}
                  </text>
                </g>
              );
            })}
          </g>

          <g>
            {graph.projects.map((p) => {
              const pos = projectPos.get(p.slug);
              if (!pos) return null;
              return (
                <g key={p.slug}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={PROJECT_NODE_R}
                    className="fill-brand-black"
                  />
                  <text
                    x={pos.x + PROJECT_LABEL_OFFSET}
                    y={pos.y}
                    dy="0.32em"
                    className="fill-brand-black text-[10px] font-medium"
                  >
                    {p.name}
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
    </>
  );
}
