// Export portfolio projects in the shape of OIT's Unified Technology
// Request form (TDX), plus a completeness report.
//
//   npm run export:utr                    # write utr-export/, print report
//   npm run export:utr -- --out <dir>     # write somewhere else
//   npm run export:utr -- --report-only   # gaps only, no files
//
// Files (the output dir is gitignored — records carry owner emails
// from lib/utr-owner-emails.ts):
//   utr-export.json   full records with per-field provenance
//   utr-export.csv    one row per project, columns = form labels
//   utr-gaps.csv      every missing field, blocking vs. recommended
//
// The CSV columns are the form's labels, not TDX's import template —
// OIT hasn't confirmed a bulk-import path yet. When they do, rename the
// columns in lib/utr-export.ts (UTR_FORM_FIELDS), not here.
//
// Exits non-zero only if utrExportOverrides names an unknown slug.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildUtrRecords,
  unknownUtrOverrideSlugs,
  utrGaps,
  utrRecordToRow,
  UTR_EXCLUDED_STATUSES,
  type UtrGap,
} from "../lib/utr-export";

const args = process.argv.slice(2);
const reportOnly = args.includes("--report-only");
const outIdx = args.indexOf("--out");
const outDir = outIdx >= 0 ? args[outIdx + 1] : "utr-export";
if (!outDir || outDir.startsWith("--")) {
  console.error("--out needs a directory");
  process.exit(1);
}

const unknown = unknownUtrOverrideSlugs();
if (unknown.length > 0) {
  console.error(`utrExportOverrides names unknown slugs: ${unknown.join(", ")}`);
  process.exit(1);
}

const records = buildUtrRecords();
const gaps: UtrGap[] = records.flatMap(utrGaps);

// A cell starting with one of these runs as a formula when the CSV is
// opened in Excel. Quoting doesn't prevent it, and prefixing an
// apostrophe would corrupt the value TDX imports, so refuse instead.
const FORMULA_LEAD = /^[=+\-@\t\r]/;
const formulaCells: string[] = [];

function csvCell(v: string): string {
  if (FORMULA_LEAD.test(v)) formulaCells.push(v.slice(0, 40));
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
function toCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvCell).join(","),
    ...rows.map((r) => headers.map((h) => csvCell(r[h] ?? "")).join(",")),
  ].join("\n") + "\n";
}

// ---- Report -------------------------------------------------------------

const blockingSlugs = new Set(
  gaps.filter((g) => g.severity === "blocking").map((g) => g.slug),
);
const byField = new Map<string, { blocking: number; recommended: number }>();
for (const g of gaps) {
  const key = g.message.split(":")[0];
  const e = byField.get(key) ?? { blocking: 0, recommended: 0 };
  e[g.severity] += 1;
  byField.set(key, e);
}

console.log(
  `UTR export: ${records.length} projects (excluding ${UTR_EXCLUDED_STATUSES.join(", ")})`,
);
console.log(
  `  ready to submit:   ${records.length - blockingSlugs.size}`,
);
console.log(`  blocked:           ${blockingSlugs.size}`);
console.log("\nGaps by field (blocking / recommended):");
for (const [field, n] of [...byField].sort((a, b) => b[1].blocking - a[1].blocking)) {
  console.log(`  ${field.padEnd(32)} ${String(n.blocking).padStart(3)} / ${n.recommended}`);
}

if (!reportOnly) {
  const exportCsv = toCsv(records.map(utrRecordToRow));
  const gapsCsv = toCsv(
    gaps.map((g) => ({ slug: g.slug, field: g.field, severity: g.severity, message: g.message })),
  );
  if (formulaCells.length > 0) {
    console.error(
      `\nRefusing to write CSV: ${formulaCells.length} cell(s) would run as spreadsheet formulas:`,
    );
    for (const c of formulaCells) console.error(`  ${JSON.stringify(c)}`);
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "utr-export.json"), JSON.stringify(records, null, 2) + "\n");
  writeFileSync(join(outDir, "utr-export.csv"), exportCsv);
  writeFileSync(join(outDir, "utr-gaps.csv"), gapsCsv);
  console.log(`\nWrote ${outDir}/utr-export.json, utr-export.csv, utr-gaps.csv`);
}
