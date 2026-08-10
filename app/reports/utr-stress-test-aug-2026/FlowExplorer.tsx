"use client";

// UTR flow explorer — d3-sankey with the Lot Allocation Flow Explorer
// interaction set: left-click a node to highlight its full genealogy
// (every demand line through it, upstream and downstream), right-click
// to zoom the diagram to that genealogy, hover for per-band detail.
//
// Four layers: individual demand lines (one thin band each) →
// ingestion source → routing under the draft → deployment target.
// Every link carries exactly one demand line, so genealogy is exact.
// Demand-line labels appear only when few enough lines are visible to
// stay legible (i.e. after zooming); identity is otherwise on hover.
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
  SOURCE_LABEL,
  SOURCE_ORDER,
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
  layer: 0 | 1 | 2 | 3;
  cls: RouteClass | "neutral" | "unit";
  /** Within-column ordering key. */
  sortKey: number;
}
interface LinkExtra {
  /** The single demand line this band carries (its unit id). */
  unitId: string;
  cls: RouteClass;
  name: string;
}
type SNode = SankeyNode<NodeExtra, LinkExtra>;
type SLink = SankeyLink<NodeExtra, LinkExtra>;

const HEIGHT = 940;
const MIN_WIDTH = 960;
/** Demand-line labels render only when this few lines are visible. */
const UNIT_LABEL_LIMIT = 45;

function nodeId(layer: number, key: string): string {
  return `${layer}:${key}`;
}

/** Unit ids passing through a node. */
function unitsThrough(units: FlowUnit[], id: string): Set<string> {
  const layerStr = id.slice(0, 1);
  const key = id.slice(2);
  return new Set(
    units
      .filter((u) =>
        layerStr === "0"
          ? u.id === key
          : layerStr === "1"
            ? u.source === key
            : layerStr === "2"
              ? u.route === key
              : u.destination === key
      )
      .map((u) => u.id)
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function buildGraph(units: FlowUnit[], width: number, marginLeft: number) {
  const nodeMap = new Map<string, NodeExtra>();
  for (const u of units) {
    const routeIdx = ROUTE_ORDER.indexOf(u.route);
    const sourceIdx = SOURCE_ORDER.indexOf(u.source);
    const uid = nodeId(0, u.id);
    if (!nodeMap.has(uid)) {
      nodeMap.set(uid, {
        id: uid,
        label: u.name,
        layer: 0,
        cls: "unit",
        // Group lines by their source, then by the route they feed —
        // keeps the thin bands from crossing.
        sortKey: sourceIdx * 100 + routeIdx,
      });
    }
    const sid = nodeId(1, u.source);
    if (!nodeMap.has(sid)) {
      nodeMap.set(sid, {
        id: sid,
        label: SOURCE_LABEL[u.source],
        layer: 1,
        cls: "neutral",
        sortKey: sourceIdx,
      });
    }
    const rid = nodeId(2, u.route);
    if (!nodeMap.has(rid)) {
      nodeMap.set(rid, {
        id: rid,
        label: ROUTE_META[u.route].label,
        layer: 2,
        cls: ROUTE_META[u.route].cls,
        sortKey: routeIdx,
      });
    }
    const did = nodeId(3, u.destination);
    if (!nodeMap.has(did)) {
      nodeMap.set(did, {
        id: did,
        label: DESTINATION_LABEL[u.destination],
        layer: 3,
        cls: "neutral",
        sortKey: 0, // destinations sort by value
      });
    }
  }

  // Three links per demand line — genealogy stays exact per line.
  const links: Array<
    LinkExtra & { source: string; target: string; value: number }
  > = [];
  for (const u of units) {
    const cls = ROUTE_META[u.route].cls;
    const base = { unitId: u.id, cls, name: u.name, value: 1 };
    links.push({ ...base, source: nodeId(0, u.id), target: nodeId(1, u.source) });
    links.push({ ...base, source: nodeId(1, u.source), target: nodeId(2, u.route) });
    links.push({ ...base, source: nodeId(2, u.route), target: nodeId(3, u.destination) });
  }

  const layout = sankey<NodeExtra, LinkExtra>()
    .nodeId((d) => d.id)
    .nodeWidth(10)
    .nodePadding(units.length > UNIT_LABEL_LIMIT ? 3 : 8)
    .nodeAlign((d) => d.layer)
    .nodeSort((a, b) => {
      if (a.layer !== b.layer) return 0;
      if (a.layer === 3) return (b.value ?? 0) - (a.value ?? 0);
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
      return a.label.localeCompare(b.label);
    })
    .extent([
      [marginLeft, 8],
      [width - 190, HEIGHT - 8],
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

  const unitById = useMemo(() => {
    const m = new Map<string, FlowUnit>();
    for (const u of units) m.set(u.id, u);
    return m;
  }, [units]);

  const visibleUnits = useMemo(() => {
    if (!zoomed) return units;
    const keep = unitsThrough(units, zoomed);
    return units.filter((u) => keep.has(u.id));
  }, [units, zoomed]);

  const showUnitLabels = visibleUnits.length <= UNIT_LABEL_LIMIT;
  const marginLeft = showUnitLabels ? 250 : 16;

  const graph = useMemo(
    () => buildGraph(visibleUnits, width, marginLeft),
    [visibleUnits, width, marginLeft]
  );

  // Label de-collision: within each labeled column, nudge label centers
  // apart so 14px-tall text never overlaps even where adjacent nodes are
  // only a few units tall.
  const labelY = useMemo(() => {
    const MIN_GAP = 13;
    const out = new Map<string, number>();
    for (const layer of [1, 2, 3]) {
      const col = (graph.nodes as SNode[])
        .filter((n) => n.layer === layer)
        .sort((a, b) => (a.y0 ?? 0) - (b.y0 ?? 0));
      let prev = -Infinity;
      for (const n of col) {
        const center = ((n.y0 ?? 0) + (n.y1 ?? 0)) / 2;
        const y = Math.max(center, prev + MIN_GAP);
        out.set(n.id, y);
        prev = y;
      }
      // Walk back up if the column overflowed the bottom edge.
      let limit = HEIGHT - 8;
      for (let i = col.length - 1; i >= 0; i--) {
        const id = col[i].id;
        const y = Math.min(out.get(id) ?? 0, limit);
        out.set(id, y);
        limit = y - MIN_GAP;
      }
    }
    return out;
  }, [graph]);

  const highlightUnits = useMemo(() => {
    if (!selected) return null;
    return unitsThrough(visibleUnits, selected);
  }, [visibleUnits, selected]);

  const nodeActive = (n: SNode): boolean => {
    if (!highlightUnits) return true;
    const own = unitsThrough(visibleUnits, n.id);
    for (const k of own) if (highlightUnits.has(k)) return true;
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
        <span>Hover a line for its name · left-click to highlight genealogy · right-click to zoom</span>
        <span>Zooming in far enough labels the individual lines</span>
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
          aria-label="Sankey diagram: individual demand lines flowing through ingestion sources and draft-process routing to deployment targets"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          {/* Links */}
          <g fill="none">
            {(graph.links as SLink[]).map((l, i) => {
              const active = !highlightUnits || highlightUnits.has(l.unitId);
              const unit = unitById.get(l.unitId);
              return (
                <path
                  key={`${l.unitId}-${i}`}
                  d={sankeyLinkHorizontal()(l) ?? undefined}
                  stroke={CLASS_COLOR[l.cls]}
                  strokeWidth={Math.max(1, l.width ?? 1)}
                  strokeOpacity={active ? (highlightUnits ? 0.75 : 0.4) : 0.05}
                  style={{ transition: "stroke-opacity 150ms" }}
                  onMouseMove={(e) =>
                    showTooltip(e, l.name, 1, [], unit?.summary)
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </g>

          {/* Nodes */}
          {(graph.nodes as SNode[]).map((n) => {
            const active = nodeActive(n);
            const isUnit = n.cls === "unit";
            const unit = isUnit ? unitById.get(n.id.slice(2)) : undefined;
            const color = isUnit
              ? unit
                ? CLASS_COLOR[ROUTE_META[unit.route].cls]
                : "var(--color-ink)"
              : n.cls === "neutral"
                ? "var(--color-ink)"
                : CLASS_COLOR[n.cls as RouteClass];
            const labelLeft = n.layer === 0;
            const showLabel = !isUnit || showUnitLabels;
            const x0 = n.x0 ?? 0;
            const x1 = n.x1 ?? 0;
            const y0 = n.y0 ?? 0;
            const y1 = n.y1 ?? 0;
            return (
              <g
                key={n.id}
                opacity={active ? 1 : 0.25}
                style={{ transition: "opacity 150ms", cursor: "pointer" }}
                onClick={() =>
                  setSelected((cur) => (cur === n.id ? null : n.id))
                }
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelected(null);
                  setZoomed((cur) => (cur === n.id ? null : n.id));
                }}
                onMouseMove={(e) =>
                  showTooltip(
                    e,
                    n.label,
                    n.value ?? 0,
                    isUnit
                      ? []
                      : visibleUnits
                          .filter((u) => unitsThrough([u], n.id).size > 0)
                          .map((u) => u.name),
                    unit?.summary
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
                  rx={isUnit ? 1 : 2}
                  stroke="var(--color-surface)"
                  strokeWidth={isUnit ? 0.5 : 1}
                />
                {showLabel && (
                  <text
                    x={labelLeft ? x0 - 8 : x1 + 8}
                    y={isUnit ? (y0 + y1) / 2 : labelY.get(n.id) ?? (y0 + y1) / 2}
                    dy="0.35em"
                    textAnchor={labelLeft ? "end" : "start"}
                    className="select-none"
                    fontSize={isUnit ? 10 : 12}
                    fontWeight={
                      n.id === selected || n.id === zoomed ? 700 : 500
                    }
                    fill="var(--color-ink)"
                  >
                    {truncate(n.label, isUnit ? 38 : 34)}
                    {!isUnit && (
                      <tspan fill="var(--color-ink-subtle)" fontWeight={500}>
                        {` · ${n.value ?? 0}`}
                      </tspan>
                    )}
                  </text>
                )}
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
