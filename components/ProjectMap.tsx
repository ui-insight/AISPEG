"use client";

// ============================================================
// ProjectMap — interactive visualization of the priorities ↔ projects ↔
// work-categories mesh. Slice 2 of epic #201: static layout, straight
// links, responsive hide. Slice 3 layers on hierarchical edge bundling
// + pillar coloring; slice 4 adds interaction; slice 5 mounts under
// /explore behind a Tiles | Map toggle.
//
// The component is a pure declarative SVG: layout math runs on each
// render off the typed graph from lib/project-map-graph. No d3
// dependency yet — slice 3 brings d3-shape's `lineRadial` +
// `curveBundle` for the curves and d3-selection for any imperative
// touch-ups.
// ============================================================

import {
  buildProjectMapGraph,
  type ProjectMapGraph,
} from "@/lib/project-map-graph";

const VIEW_W = 1100;
const VIEW_H = 900;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const R = 380;
const PROJECT_HALF_HEIGHT = 320;
const ARC_LABEL_OFFSET = 8;
const PROJECT_LABEL_OFFSET = 10;
const NODE_R = 4;
const PROJECT_NODE_R = 5;

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

  const priorityPos = new Map<string, Polar>();
  graph.priorities.forEach((p, i) => {
    priorityPos.set(p.code, polar(leftArcAngle(i, graph.priorities.length), R));
  });

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
          aria-label="Project Map — strategic priorities on the left, projects in the middle, work categories on the right, with lines linking each project to its declared alignments."
        >
          <g
            stroke="currentColor"
            strokeWidth={0.6}
            fill="none"
            className="text-brand-silver/40"
          >
            {graph.links.map((link, idx) => {
              const proj = projectPos.get(link.project);
              const target =
                link.side === "left"
                  ? priorityPos.get(link.target)
                  : categoryPos.get(link.target);
              if (!proj || !target) return null;
              return (
                <line
                  key={`${link.project}|${link.side}|${link.target}|${idx}`}
                  x1={proj.x}
                  y1={proj.y}
                  x2={target.x}
                  y2={target.y}
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
              return (
                <g key={p.code}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_R}
                    className="fill-brand-huckleberry"
                  />
                  <text
                    x={label.x}
                    y={label.y}
                    transform={`rotate(${rotation}, ${label.x}, ${label.y})`}
                    textAnchor={flip ? "end" : "start"}
                    dy="0.32em"
                    className="fill-ink-muted text-[9px]"
                  >
                    {p.code}
                  </text>
                </g>
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
                    className="fill-brand-clearwater"
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
