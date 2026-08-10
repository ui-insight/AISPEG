"use client";

// UTR flow explorer — d3-sankey with the Lot Allocation Flow Explorer
// interaction set: left-click a node to highlight its full genealogy
// (every unit path through it, upstream and downstream), right-click to
// zoom the diagram to that genealogy, hover for per-band detail.
//
// Links are built per distinct unit path (origin → route → destination),
// not per node pair, so genealogy highlighting is exact: clicking a
// destination lights only the origins that actually feed it.

import { useMemo, useRef, useState } from "react";
import {
  sankey,
  sankeyLinkHorizontal,
  type SankeyNode,
  type SankeyLink,
} from "d3-sankey";
import {
  ORIGIN_LABEL,
  ROUTE_META,
  DESTINATION_LABEL,
  type FlowUnit,
  type RouteClass,
} from "./flow-data";

const CLASS_COLOR: Record<RouteClass, string> = {
  clean: "var(--color-chart-clean)",
  seam: "var(--color-chart-seam)",
  muted: "var(--color-brand-silver)",
};

interface NodeExtra {
  id: string;
  label: string;
  layer: 0 | 1 | 2;
  cls: RouteClass | "origin";
}
interface LinkExtra {
  pathKey: string;
  cls: RouteClass;
  names: string[];
}
type SNode = SankeyNode<NodeExtra, LinkExtra>;
type SLink = SankeyLink<NodeExtra, LinkExtra>;

const WIDTH = 960;
const HEIGHT = 620;
const MARGIN = { top: 8, right: 200, bottom: 8, left: 150 };

// Layer-1 display order: clean tracks, then seams, then muted pools.
const ROUTE_ORDER = [
  "fast-lane",
  "track-a",
  "track-c",
  "track-d",
  "seam-estate",
  "seam-platform",
  "seam-configure",
  "seam-research",
  "seam-data-product",
  "seam-no-requestor",
  "external-tracked",
  "unclear",
];

function nodeId(layer: number, key: string): string {
  return `${layer}:${key}`;
}

function pathKeyOf(u: FlowUnit): string {
  return `${u.origin}→${u.route}→${u.destination}`;
}

/** Path keys passing through a node. */
function pathsThrough(units: FlowUnit[], id: string): Set<string> {
  const [layerStr, key] = [id.slice(0, 1), id.slice(2)];
  const field =
    layerStr === "0" ? "origin" : layerStr === "1" ? "route" : "destination";
  return new Set(
    units.filter((u) => u[field as keyof FlowUnit] === key).map(pathKeyOf)
  );
}

function buildGraph(units: FlowUnit[]) {
  const nodeMap = new Map<string, NodeExtra>();
  const add = (id: string, label: string, layer: 0 | 1 | 2, cls: NodeExtra["cls"]) => {
    if (!nodeMap.has(id)) nodeMap.set(id, { id, label, layer, cls });
  };
  for (const u of units) {
    add(nodeId(0, u.origin), ORIGIN_LABEL[u.origin], 0, "origin");
    add(nodeId(1, u.route), ROUTE_META[u.route].label, 1, ROUTE_META[u.route].cls);
    add(nodeId(2, u.destination), DESTINATION_LABEL[u.destination], 2, "muted");
  }

  // One pair of links per distinct full path.
  const byPath = new Map<string, FlowUnit[]>();
  for (const u of units) {
    const k = pathKeyOf(u);
    byPath.set(k, [...(byPath.get(k) ?? []), u]);
  }
  const links: Array<
    LinkExtra & { source: string; target: string; value: number }
  > = [];
  for (const [k, members] of byPath) {
    const { origin, route, destination } = members[0];
    const cls = ROUTE_META[route].cls;
    const names = members.map((m) => m.name);
    links.push({
      source: nodeId(0, origin),
      target: nodeId(1, route),
      value: members.length,
      pathKey: k,
      cls,
      names,
    });
    links.push({
      source: nodeId(1, route),
      target: nodeId(2, destination),
      value: members.length,
      pathKey: k,
      cls,
      names,
    });
  }

  const layout = sankey<NodeExtra, LinkExtra>()
    .nodeId((d) => d.id)
    .nodeWidth(12)
    .nodePadding(14)
    .nodeAlign((d) => d.layer)
    .nodeSort((a, b) => {
      if (a.layer !== b.layer) return 0;
      if (a.layer === 1) {
        return (
          ROUTE_ORDER.indexOf(a.id.slice(2)) - ROUTE_ORDER.indexOf(b.id.slice(2))
        );
      }
      return (b.value ?? 0) - (a.value ?? 0);
    })
    .extent([
      [MARGIN.left, MARGIN.top],
      [WIDTH - MARGIN.right, HEIGHT - MARGIN.bottom],
    ]);

  return layout({
    nodes: [...nodeMap.values()].map((n) => ({ ...n })),
    links,
  });
}

interface TooltipState {
  x: number;
  y: number;
  title: string;
  count: number;
  names: string[];
}

export default function FlowExplorer({ units }: { units: FlowUnit[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleUnits = useMemo(() => {
    if (!zoomed) return units;
    const keep = pathsThrough(units, zoomed);
    return units.filter((u) => keep.has(pathKeyOf(u)));
  }, [units, zoomed]);

  const graph = useMemo(() => buildGraph(visibleUnits), [visibleUnits]);

  const highlightPaths = useMemo(() => {
    if (!selected) return null;
    return pathsThrough(visibleUnits, selected);
  }, [visibleUnits, selected]);

  const nodeActive = (n: SNode): boolean => {
    if (!highlightPaths) return true;
    const own = pathsThrough(visibleUnits, n.id);
    for (const k of own) if (highlightPaths.has(k)) return true;
    return false;
  };

  const showTooltip = (
    e: React.MouseEvent,
    title: string,
    count: number,
    names: string[]
  ) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      title,
      count,
      names,
    });
  };

  const handleNodeClick = (n: SNode) => {
    setSelected((cur) => (cur === n.id ? null : n.id));
  };

  const handleNodeContext = (e: React.MouseEvent, n: SNode) => {
    e.preventDefault();
    setSelected(null);
    setZoomed((cur) => (cur === n.id ? null : n.id));
  };

  const reset = () => {
    setSelected(null);
    setZoomed(null);
  };

  const zoomedLabel = zoomed
    ? (graph.nodes as SNode[]).find((n) => n.id === zoomed)?.label ??
      zoomed.slice(2)
    : null;

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-600">
        <span>
          <span
            aria-hidden="true"
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[2px] align-middle"
            style={{ background: CLASS_COLOR.clean }}
          />
          Routes cleanly under the draft
        </span>
        <span>
          <span
            aria-hidden="true"
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[2px] align-middle"
            style={{ background: CLASS_COLOR.seam }}
          />
          Lands on a fringe seam
        </span>
        <span>
          <span
            aria-hidden="true"
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[2px] align-middle"
            style={{ background: CLASS_COLOR.muted }}
          />
          Outside the pipeline / unclear
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
        <span>Left-click a node to highlight its genealogy</span>
        <span>Right-click a node to zoom to it</span>
        {(selected || zoomed) && (
          <button
            type="button"
            onClick={reset}
            className="rounded border border-hairline bg-surface-alt px-2 py-0.5 font-semibold text-brand-black hover:bg-white"
          >
            Reset view{zoomed && zoomedLabel ? ` (zoomed)` : ""}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="min-w-[760px]"
          role="img"
          aria-label="Sankey diagram: demand flowing from origins through draft-process routing to proposed deployment targets"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          {/* Links */}
          <g fill="none">
            {(graph.links as SLink[]).map((l, i) => {
              const active = !highlightPaths || highlightPaths.has(l.pathKey);
              return (
                <path
                  key={`${l.pathKey}-${i}`}
                  d={sankeyLinkHorizontal()(l) ?? undefined}
                  stroke={CLASS_COLOR[l.cls]}
                  strokeWidth={Math.max(1, l.width ?? 1)}
                  strokeOpacity={active ? (highlightPaths ? 0.72 : 0.38) : 0.06}
                  style={{ transition: "stroke-opacity 150ms" }}
                  onMouseMove={(e) =>
                    showTooltip(
                      e,
                      `${(l.source as SNode).label} → ${(l.target as SNode).label}`,
                      l.value as number,
                      l.names
                    )
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </g>

          {/* Nodes */}
          {(graph.nodes as SNode[]).map((n) => {
            const active = nodeActive(n);
            const color =
              n.cls === "origin"
                ? "var(--color-ink)"
                : CLASS_COLOR[n.cls as RouteClass];
            const labelLeft = n.layer === 0;
            const x0 = n.x0 ?? 0;
            const x1 = n.x1 ?? 0;
            const y0 = n.y0 ?? 0;
            const y1 = n.y1 ?? 0;
            return (
              <g
                key={n.id}
                opacity={active ? 1 : 0.25}
                style={{ transition: "opacity 150ms", cursor: "pointer" }}
                onClick={() => handleNodeClick(n)}
                onContextMenu={(e) => handleNodeContext(e, n)}
                onMouseMove={(e) =>
                  showTooltip(
                    e,
                    n.label,
                    n.value ?? 0,
                    visibleUnits
                      .filter((u) =>
                        pathsThrough([u], n.id).size > 0
                      )
                      .map((u) => u.name)
                  )
                }
                onMouseLeave={() => setTooltip(null)}
              >
                <rect
                  x={x0}
                  y={y0}
                  width={x1 - x0}
                  height={Math.max(1, y1 - y0)}
                  fill={color}
                  rx={2}
                  stroke="var(--color-surface)"
                  strokeWidth={1}
                />
                <text
                  x={labelLeft ? x0 - 8 : x1 + 8}
                  y={(y0 + y1) / 2}
                  dy="0.35em"
                  textAnchor={labelLeft ? "end" : "start"}
                  className="select-none"
                  fontSize={12}
                  fontWeight={n.id === selected || n.id === zoomed ? 700 : 500}
                  fill="var(--color-ink)"
                >
                  {n.label}
                  <tspan fill="var(--color-ink-subtle)" fontWeight={500}>
                    {` · ${n.value ?? 0}`}
                  </tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 max-w-xs rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          style={{
            left: Math.min(tooltip.x + 14, WIDTH - 280),
            top: tooltip.y + 14,
          }}
        >
          <p className="text-xs font-bold text-brand-black">
            {tooltip.title}
            <span className="ml-1 font-semibold text-gray-500">
              · {tooltip.count} {tooltip.count === 1 ? "item" : "items"}
            </span>
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {tooltip.names.slice(0, 9).map((name) => (
              <li key={name} className="truncate text-[11px] text-gray-600">
                {name}
              </li>
            ))}
            {tooltip.names.length > 9 && (
              <li className="text-[11px] font-semibold text-gray-500">
                + {tooltip.names.length - 9} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
