"use client";

// UTR flow explorer — d3-sankey with the Lot Allocation Flow Explorer
// interaction set: left-click a node to highlight its full genealogy
// (every unit path through it, upstream and downstream), right-click to
// zoom the diagram to that genealogy, hover for per-band detail.
//
// Links are built per distinct unit path (source → route → destination),
// not per node pair, so genealogy highlighting is exact: clicking a
// destination lights only the sources that actually feed it.
//
// The diagram bleeds out of the article column to the right edge of
// the viewport (measured at runtime); on narrow screens it scrolls
// inside its own container instead of widening the page.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  sankey,
  sankeyLinkHorizontal,
  type SankeyNode,
  type SankeyLink,
} from "d3-sankey";
import {
  ORIGIN_ORDER,
  ROUTE_META,
  ROUTE_ORDER,
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
  cls: RouteClass | "origin" | "project";
  /** Within-column ordering key. */
  sortKey: number;
}
interface LinkExtra {
  pathKey: string;
  cls: RouteClass;
  names: string[];
}
type SNode = SankeyNode<NodeExtra, LinkExtra>;
type SLink = SankeyLink<NodeExtra, LinkExtra>;

const HEIGHT = 940;
const MIN_WIDTH = 940;
const MARGIN = { top: 8, right: 190, bottom: 8, left: 216 };

function nodeId(layer: number, key: string): string {
  return `${layer}:${key}`;
}

function pathKeyOf(u: FlowUnit): string {
  return `${u.sourceKey}→${u.route}→${u.destination}`;
}

/** Path keys passing through a node. */
function pathsThrough(units: FlowUnit[], id: string): Set<string> {
  const layerStr = id.slice(0, 1);
  const key = id.slice(2);
  return new Set(
    units
      .filter((u) =>
        layerStr === "0"
          ? u.sourceKey === key
          : layerStr === "1"
            ? u.route === key
            : u.destination === key
      )
      .map(pathKeyOf)
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function buildGraph(units: FlowUnit[], width: number) {
  const nodeMap = new Map<string, NodeExtra>();
  for (const u of units) {
    const sid = nodeId(0, u.sourceKey);
    if (!nodeMap.has(sid)) {
      nodeMap.set(sid, {
        id: sid,
        label: u.sourceLabel,
        layer: 0,
        cls: u.isProject ? "project" : "origin",
        // Registry origins first in fixed order, then projects grouped
        // by the route they feed (reduces crossings), ties by name.
        sortKey: u.isProject
          ? 100 + ROUTE_ORDER.indexOf(u.route)
          : ORIGIN_ORDER.indexOf(u.sourceKey as (typeof ORIGIN_ORDER)[number]),
      });
    }
    const rid = nodeId(1, u.route);
    if (!nodeMap.has(rid)) {
      nodeMap.set(rid, {
        id: rid,
        label: ROUTE_META[u.route].label,
        layer: 1,
        cls: ROUTE_META[u.route].cls,
        sortKey: ROUTE_ORDER.indexOf(u.route),
      });
    }
    const did = nodeId(2, u.destination);
    if (!nodeMap.has(did)) {
      nodeMap.set(did, {
        id: did,
        label: DESTINATION_LABEL[u.destination],
        layer: 2,
        cls: "muted",
        sortKey: 0, // destinations sort by value (assigned below)
      });
    }
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
    const { sourceKey, route, destination } = members[0];
    const cls = ROUTE_META[route].cls;
    const names = members.map((m) => m.name);
    links.push({
      source: nodeId(0, sourceKey),
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
    .nodePadding(8)
    .nodeAlign((d) => d.layer)
    .nodeSort((a, b) => {
      if (a.layer !== b.layer) return 0;
      if (a.layer === 2) return (b.value ?? 0) - (a.value ?? 0);
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
      return a.label.localeCompare(b.label);
    })
    .extent([
      [MARGIN.left, MARGIN.top],
      [width - MARGIN.right, HEIGHT - MARGIN.bottom],
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
  summary?: string;
}

export default function FlowExplorer({ units }: { units: FlowUnit[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [width, setWidth] = useState(1100);
  const containerRef = useRef<HTMLDivElement>(null);

  // Bleed to the right edge of the viewport: the drawing width is the
  // distance from the container's left edge to the viewport edge, never
  // narrower than MIN_WIDTH (which then scrolls inside the container).
  useEffect(() => {
    const measure = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setWidth(Math.max(MIN_WIDTH, Math.floor(window.innerWidth - rect.left - 28)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const visibleUnits = useMemo(() => {
    if (!zoomed) return units;
    const keep = pathsThrough(units, zoomed);
    return units.filter((u) => keep.has(pathKeyOf(u)));
  }, [units, zoomed]);

  const graph = useMemo(
    () => buildGraph(visibleUnits, width),
    [visibleUnits, width]
  );

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
    names: string[],
    summary?: string
  ) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      title,
      count,
      names,
      summary,
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

  return (
    <div ref={containerRef} className="relative" style={{ width }}>
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
            Reset view{zoomed ? " (zoomed)" : ""}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          style={{ minWidth: MIN_WIDTH }}
          role="img"
          aria-label="Sankey diagram: demand flowing from sources through draft-process routing to proposed deployment targets"
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
            const isProject = n.cls === "project";
            const color =
              n.cls === "origin" || isProject
                ? "var(--color-ink)"
                : CLASS_COLOR[n.cls as RouteClass];
            const labelLeft = n.layer === 0;
            const x0 = n.x0 ?? 0;
            const x1 = n.x1 ?? 0;
            const y0 = n.y0 ?? 0;
            const y1 = n.y1 ?? 0;
            const own = visibleUnits.filter(
              (u) => pathsThrough([u], n.id).size > 0
            );
            const summary =
              isProject && own.length === 1 ? own[0].summary : undefined;
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
                    isProject ? [] : own.map((u) => u.name),
                    summary
                  )
                }
                onMouseLeave={() => setTooltip(null)}
              >
                <rect
                  x={x0}
                  y={y0}
                  width={x1 - x0}
                  height={Math.max(1.5, y1 - y0)}
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
                  fontSize={isProject ? 10 : 12}
                  fontWeight={n.id === selected || n.id === zoomed ? 700 : 500}
                  fill="var(--color-ink)"
                >
                  {truncate(n.label, isProject ? 30 : 34)}
                  {!isProject && (
                    <tspan fill="var(--color-ink-subtle)" fontWeight={500}>
                      {` · ${n.value ?? 0}`}
                    </tspan>
                  )}
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
            left: Math.min(tooltip.x + 14, width - 300),
            top: tooltip.y + 14,
          }}
        >
          <p className="text-xs font-bold text-brand-black">
            {tooltip.title}
            {tooltip.count > 1 && (
              <span className="ml-1 font-semibold text-gray-500">
                · {tooltip.count} items
              </span>
            )}
          </p>
          {tooltip.summary ? (
            <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600">
              {tooltip.summary}
            </p>
          ) : (
            tooltip.names.length > 0 && (
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
            )
          )}
        </div>
      )}
    </div>
  );
}
