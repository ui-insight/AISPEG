// Draws the three proposal figures as inline SVG from figures.json. Static
// output for a PDF, so identity is carried by labels and line style, never
// by color alone. Colors are CSS variables resolved from app/globals.css.

// Canvas width in SVG units. The PDF text column is about 490pt wide, so sizes
// here print at roughly 0.85 scale. Keep labels at 9 units or larger.
const W = 580;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, maxChars) {
  const lines = [];
  let line = "";
  for (const word of String(text).split(/\s+/)) {
    if (line && (line + " " + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function text(x, y, value, { size = 11, weight = 400, fill = "var(--color-ink)", anchor = "start" } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(value)}</text>`;
}

const svg = (width, height, alt, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(alt).replace(/"/g, "&quot;")}">${body}</svg>`;

// ── Comparable builds: first commit to latest commit, one row per project ──
export function comparables({ items, alt }) {
  const left = 158, right = W - 4, top = 8, rowH = 46;
  const dates = items.flatMap((i) => [new Date(i.start), new Date(i.end)]);
  const min = new Date(Math.min(...dates)), max = new Date(Math.max(...dates));
  const t0 = new Date(Date.UTC(min.getUTCFullYear(), Math.floor(min.getUTCMonth() / 3) * 3, 1));
  const t1 = new Date(Date.UTC(max.getUTCFullYear(), max.getUTCMonth() + 1, 1));
  const x = (d) => left + ((new Date(d) - t0) / (t1 - t0)) * (right - left);
  const height = top + rowH * items.length + 24;
  let body = "";
  for (let d = new Date(t0); d <= t1; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 3, 1))) {
    const px = x(d);
    body += `<line x1="${px}" x2="${px}" y1="${top}" y2="${height - 20}" stroke="var(--color-hairline)"/>`;
    body += text(px, height - 6, d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }), { size: 9, fill: "var(--color-ink-muted)", anchor: "middle" });
  }
  items.forEach((item, i) => {
    const y = top + rowH * i + rowH / 2;
    const days = Math.round((new Date(item.end) - new Date(item.start)) / 864e5);
    const length = days < 120 ? `${days} days` : `${Math.round(days / 30.4)} months`;
    const span = item.active ? `${length}, still active` : length;
    const a = x(item.start), b = Math.max(x(item.end), a + 4);
    body += text(0, y - 3, item.name, { size: 11, weight: 700 });
    body += text(0, y + 11, `${item.status}, ${item.commits} commits`, { size: 9.5, fill: "var(--color-ink-muted)" });
    body += `<rect x="${a}" y="${y + 1}" width="${b - a}" height="11" rx="4" fill="var(--color-chart-clean)"/>`;
    const fromStart = a + span.length * 5.4 < right;
    body += text(fromStart ? a : b, y - 4, span, { size: 9.5, anchor: fromStart ? "start" : "end" });
  });
  return svg(W, height, alt, body);
}

// ── Connections: the proposal in the center, linked work on either side ──
export function connections({ center, nodes, alt }) {
  const cardW = 188, cardH = 80, gap = 14, midW = 146;
  const midX = (W - midW) / 2;
  const sides = { left: [], right: [] };
  const titles = new Set(nodes.map((n) => n.title));
  if (titles.size !== nodes.length) throw new Error("connection node titles must be unique.");
  for (const n of nodes) {
    if (n.via && !nodes.some((m) => m.title === n.via && !m.via)) throw new Error(`"${n.title}" has via "${n.via}", which is not a direct node.`);
  }
  const direct = nodes.filter((n) => !n.via);
  direct.forEach((node, i) => {
    const side = i % 2 === 0 ? "left" : "right";
    sides[side].push(node);
    nodes.filter((n) => n.via === node.title).forEach((child) => sides[side].push(child));
  });
  const height = Math.max(sides.left.length, sides.right.length) * (cardH + gap) + 26;
  const plotH = height - 26;
  const place = new Map();
  for (const [side, list] of Object.entries(sides)) {
    const offset = (plotH - (list.length * (cardH + gap) - gap)) / 2;
    list.forEach((node, i) => place.set(node.title, { x: side === "left" ? 0 : W - cardW, y: offset + i * (cardH + gap), side }));
  }
  const cy = plotH / 2, midH = 92;
  let edges = "", cards = "";
  for (const node of nodes) {
    const p = place.get(node.title);
    const dash = node.kind === "request" ? ` stroke-dasharray="5 4"` : "";
    if (node.via) {
      const parent = place.get(node.via);
      const cx = p.x + cardW / 2;
      edges += `<line x1="${cx}" y1="${parent.y + cardH}" x2="${cx}" y2="${p.y}" stroke="var(--color-ink-muted)" stroke-width="1.2"${dash}/>`;
    } else {
      const x1 = p.side === "left" ? p.x + cardW : p.x;
      const x2 = p.side === "left" ? midX : midX + midW;
      const y2 = Math.min(cy + midH / 2 - 8, Math.max(cy - midH / 2 + 8, p.y + cardH / 2));
      edges += `<line x1="${x1}" y1="${p.y + cardH / 2}" x2="${x2}" y2="${y2}" stroke="var(--color-ink-muted)" stroke-width="1.2"${dash}/>`;
    }
    cards += `<rect x="${p.x}" y="${p.y}" width="${cardW}" height="${cardH}" rx="4" fill="var(--color-surface)" stroke="var(--color-ink)" stroke-width="0.8"${dash}/>`;
    cards += text(p.x + 9, p.y + 16, node.title, { size: 10.5, weight: 700 });
    cards += text(p.x + 9, p.y + 29, node.status, { size: 9, fill: "var(--color-ink-muted)" });
    wrap(node.adds, 35).slice(0, 3).forEach((line, i) => (cards += text(p.x + 9, p.y + 43 + i * 11.5, line, { size: 9.4 })));
  }
  cards += `<rect x="${midX}" y="${cy - midH / 2}" width="${midW}" height="${midH}" rx="4" fill="var(--color-surface-dark)"/>`;
  const titleLines = wrap(center.title, 20);
  titleLines.forEach((line, i) => (cards += text(W / 2, cy - 22 + i * 15, line, { size: 11.5, weight: 800, fill: "var(--color-brand-white)", anchor: "middle" })));
  cards += text(W / 2, cy - 22 + titleLines.length * 15 + 3, center.status, { size: 9.2, fill: "var(--color-brand-white)", anchor: "middle" });
  const ly = height - 8;
  const legend =
    `<line x1="0" x2="28" y1="${ly - 3}" y2="${ly - 3}" stroke="var(--color-ink-muted)" stroke-width="1.2"/>` +
    text(34, ly, "Existing project", { size: 9, fill: "var(--color-ink-muted)" }) +
    `<line x1="130" x2="158" y1="${ly - 3}" y2="${ly - 3}" stroke="var(--color-ink-muted)" stroke-width="1.2" stroke-dasharray="5 4"/>` +
    text(164, ly, "Open request", { size: 9, fill: "var(--color-ink-muted)" });
  return svg(W, height, alt, edges + cards + legend);
}

// ── Data flow: stages left to right, with the university boundary drawn ──
export function dataFlow({ columns, boundaryLabel, boundaryColumns, excluded, alt }) {
  if (!columns?.length || columns.some((c) => !c.items?.length)) throw new Error("every data-flow column needs at least one item.");
  if (!Number.isInteger(boundaryColumns) || boundaryColumns < 1 || boundaryColumns > columns.length) {
    throw new Error(`boundaryColumns must be a whole number from 1 to ${columns.length}.`);
  }
  const n = columns.length, gutter = 26, pad = 9;
  const colW = (W - pad * 2 - gutter * (n - 1)) / n;
  const itemH = 62, itemGap = 8, top = 44;
  const rows = Math.max(...columns.map((c) => c.items.length));
  const bottom = top + rows * (itemH + itemGap) - itemGap + pad;
  const colX = (i) => pad + i * (colW + gutter);
  let body = "";
  const boxW = colX(boundaryColumns - 1) + colW + pad / 2 + 4;
  body += `<rect x="0.5" y="0.5" width="${boxW}" height="${bottom}" rx="5" fill="var(--color-surface-alt)" stroke="var(--color-ink)" stroke-width="1" stroke-dasharray="6 4"/>`;
  body += text(pad, 15, boundaryLabel, { size: 9.5, weight: 700 });
  columns.forEach((col, i) => {
    const cx = colX(i);
    body += text(cx, 34, col.title, { size: 10.5, weight: 800 });
    const span = col.items.length * (itemH + itemGap) - itemGap;
    const start = top + (rows * (itemH + itemGap) - itemGap - span) / 2;
    col.items.forEach((item, j) => {
      const y = start + j * (itemH + itemGap);
      body += `<rect x="${cx}" y="${y}" width="${colW}" height="${itemH}" rx="4" fill="var(--color-surface)" stroke="var(--color-ink)" stroke-width="0.7"/>`;
      wrap(item.label, Math.floor(colW / 5.3)).slice(0, 3).forEach((line, k) => (body += text(cx + 7, y + 15 + k * 11.5, line, { size: 9.4, weight: 600 })));
      body += text(cx + 7, y + itemH - 7, item.risk, { size: 9, fill: "var(--color-ink-muted)" });
    });
    if (i < n - 1) {
      const ay = top + (rows * (itemH + itemGap) - itemGap) / 2, ax = cx + colW + 3, bx = cx + colW + gutter - 4;
      body += `<line x1="${ax}" x2="${bx - 5}" y1="${ay}" y2="${ay}" stroke="var(--color-ink)" stroke-width="1.4"/><path d="M${bx - 6} ${ay - 4} L${bx} ${ay} L${bx - 6} ${ay + 4} Z" fill="var(--color-ink)"/>`;
    }
  });
  body += text(0, bottom + 18, excluded, { size: 9.5, weight: 700 });
  return svg(W, bottom + 24, alt, body);
}

export const figures = { comparables, connections, dataFlow };
