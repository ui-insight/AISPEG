#!/usr/bin/env node
// Renders a scoping proposal to a branded PDF.
//   node .agents/skills/scope-request/scripts/render-proposal.mjs <scratch-dir>
// Reads <dir>/proposal.md and optional <dir>/figures.json. Writes <dir>/proposal.html
// and <dir>/<output>.pdf. Needs pandoc and Google Chrome (override with CHROME).
// Keep the scratch directory outside this public repo.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { figures } from "./figures.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skill = resolve(here, "..");
const repo = resolve(skill, "../../..");
const LOGO_URL = "https://content-hub.uidaho.edu/api/public/portal/35073%2F40d4121f%2Flogo.svg?v=63184872";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const REQUIRED = ["title", "output", "author", "date", "request", "requested_by", "prepared_by", "status", "recommendation", "needs", "approvers", "author_reviewed", "approved"];

const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const dir = process.argv[2] ? resolve(process.argv[2]) : fail("Usage: render-proposal.mjs <scratch-dir>");
// The repo is public, so nothing the renderer writes may land inside it.
const inside = (child, parent) => {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
};
if (!existsSync(dir)) fail(`No such directory: ${dir}`);
if (inside(realpathSync(dir), realpathSync(repo))) fail("The proposal directory must be outside this public repo, such as ../Scoping-Proposals/<request-name>.");
const source = readFileSync(join(dir, "proposal.md"), "utf8").replace(/\r\n?/g, "\n");
const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!match) fail("proposal.md must start with a --- front matter block.");

const meta = Object.fromEntries(
  match[1].split("\n").filter(Boolean).map((line) => {
    const at = line.indexOf(":");
    // One "key: value" per line. Matching outer quotes are dropped; nothing else is YAML.
    const value = line.slice(at + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    return [line.slice(0, at).trim(), value];
  }),
);
const missing = REQUIRED.filter((key) => !meta[key]);
if (missing.length) fail(`Front matter is missing: ${missing.join(", ")}`);
if (meta.author.trim().split(/\s+/).length < 2) fail("author must be the author's full name.");
if (!/^[\w][\w.-]*$/.test(meta.output) || meta.output.includes("..")) fail("output must be a plain file name, with no path.");
for (const flag of ["author_reviewed", "approved"]) {
  if (!["true", "false"].includes(meta[flag])) fail(`${flag} must be true or false.`);
}
if (meta.approved === "true" && meta.author_reviewed !== "true") fail("A report cannot be approved before the author has reviewed it.");

// The wording below is fixed so every report says the same thing. It names no
// AI tool. The responsibility statement is the author's to make, so it prints
// only after the author has reviewed the report and set author_reviewed: true.
const reviewed = meta.author_reviewed === "true";
const approved = meta.approved === "true";
const disclosure =
  "This report was generated with the help of artificial intelligence. " +
  (reviewed
    ? `${meta.author} reviewed this report and accepts responsibility for its content, including any errors.`
    : `This draft has not yet been reviewed by ${meta.author}, who will accept responsibility for its content once that review is done.`);
const approval =
  (approved ? `Approved by ${meta.approvers}. ` : `This draft requires approval by ${meta.approvers}. `) +
  (approved
    ? "This scoping document will now be submitted through the University's Unified Technology Request."
    : "Once this scoping document is approved, it will be submitted through the University's Unified Technology Request.");
const footerState = approved
  ? `Approved by ${meta.approvers}.`
  : reviewed
    ? `DRAFT. Requires approval by ${meta.approvers}.`
    : `UNREVIEWED DRAFT. Pending review by ${meta.author}. Requires approval by ${meta.approvers}.`;
const footerAi = reviewed
  ? `Generated with AI assistance. ${meta.author} accepts responsibility for this content.`
  : "Generated with AI assistance.";

const figureData = existsSync(join(dir, "figures.json")) ? JSON.parse(readFileSync(join(dir, "figures.json"), "utf8")) : {};
let figureNumber = 0;
let body = execFileSync("pandoc", ["-f", "gfm", "-t", "html", "--wrap=none"], { input: match[2], encoding: "utf8", maxBuffer: 1 << 26 });
// Pandoc's GFM reader passes raw HTML through. Markup that can restyle or
// script the page could hide the AI and approval statements, so refuse it.
const unsafe = body.match(/<\s*(style|script|link|meta|base|iframe|object|embed|svg|form)\b|\s(style|on\w+)\s*=|class\s*=\s*["']?ai-statement/i);
if (unsafe) fail(`proposal.md contains raw HTML that is not allowed: ${unsafe[0].trim()}`);
body = body.replace(/<p>\{\{figure:(\w+)\}\}<\/p>/g, (_, key) => {
  const spec = figureData[key];
  if (!spec || !figures[spec.type]) fail(`No usable figure "${key}" in figures.json.`);
  figureNumber += 1;
  let drawn;
  try {
    drawn = figures[spec.type](spec);
  } catch (error) {
    fail(`Figure "${key}": ${error.message}`);
  }
  return `<figure>${drawn}<figcaption><strong>Figure ${figureNumber}.</strong> ${esc(spec.caption)}</figcaption></figure>`;
});
if (body.includes("{{figure:")) fail("A {{figure:...}} marker must sit alone on its own line.");

// Colors have one source: the @theme block in app/globals.css.
const theme = readFileSync(join(repo, "app/globals.css"), "utf8");
const colors = [...theme.matchAll(/(--color-[\w-]+):\s*(#[0-9A-Fa-f]{3,8});/g)].map((m) => `${m[1]}: ${m[2]};`).join(" ");

// Used exactly as UCM publishes it. Do not recolor, crop, or redraw it.
const logoPath = join(dir, ".ui-logo.svg");
if (!existsSync(logoPath)) {
  const response = await fetch(LOGO_URL);
  if (!response.ok) fail(`Could not download the official logo (${response.status}).`);
  writeFileSync(logoPath, await response.text());
}

const fontFace = (file, style) =>
  `@font-face { font-family: "Public Sans"; font-style: ${style}; font-weight: 100 900; src: url("${pathToFileURL(join(skill, "assets", file)).href}") format("truetype"); }`;
const css = readFileSync(join(skill, "assets/proposal.css"), "utf8");
const glance = [
  ["Request", meta.request],
  ["Requested by", meta.requested_by],
  ["Prepared by", meta.prepared_by],
  ["Status", meta.status],
  ["Recommendation", meta.recommendation],
  ["What we need from you", meta.needs],
].map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(meta.title)}</title><meta name="author" content="${esc(meta.author)}">
<style>${fontFace("PublicSans-VariableFont_wght.ttf", "normal")}${fontFace("PublicSans-Italic-VariableFont_wght.ttf", "italic")}
:root { ${colors} --footer: ${JSON.stringify(footerState)} "\\A " ${JSON.stringify(footerAi)}; }
${css}</style></head><body>
<div class="masthead"><img src="${pathToFileURL(logoPath).href}" alt="University of Idaho"><div class="unit">Institute for Interdisciplinary Data Sciences</div></div>
<h1>${esc(meta.title)}</h1>
<p class="byline"><strong>${esc(meta.author)}</strong> · ${esc(meta.date)}</p>
<div class="rule"></div>
<table class="glance"><tbody>${glance}</tbody></table>
<div class="ai-statement"><span class="label">Use of artificial intelligence</span>${esc(disclosure)}</div>
<div class="ai-statement"><span class="label">Approval and next step</span>${esc(approval)}</div>
${body}</body></html>`;

const htmlPath = join(dir, "proposal.html");
const pdfPath = join(dir, `${meta.output}.pdf`);
writeFileSync(htmlPath, html);
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--generate-pdf-document-outline", "--virtual-time-budget=4000", `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href], { stdio: ["ignore", "ignore", "pipe"] });
console.log(`${approved ? "Approved" : reviewed ? "Reviewed, requires approval" : "UNREVIEWED DRAFT"}: ${pdfPath}`);
