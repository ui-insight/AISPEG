/**
 * Generates a human-readable markdown summary of governance catalog and
 * vocabulary changes between a base ref and the current head.
 *
 * Inputs (env or CLI args):
 *   BASE_CATALOG_PATH    path to base lib/governance/catalog.ts        (required)
 *   BASE_VOCAB_PATH      path to base lib/governance/vocabularies.ts   (required)
 *   HEAD_CATALOG_PATH    path to head lib/governance/catalog.ts        (default: lib/governance/catalog.ts)
 *   HEAD_VOCAB_PATH      path to head lib/governance/vocabularies.ts   (default: lib/governance/vocabularies.ts)
 *   OUTPUT_PATH          file to write markdown to                     (default: stdout)
 *
 * The script imports the generated TS modules dynamically (they are valid
 * ESM/CJS and are emitted by `npm run build:governance`). It does not parse
 * the upstream JSON directly — the typed catalog is the contract.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type {
  Project,
  Table,
  Column,
  VocabularyGroup,
  VocabularyValue,
} from "../lib/governance/types";

interface CatalogModule {
  projects: Project[];
  tables: Table[];
}

interface VocabModule {
  vocabularyGroups: VocabularyGroup[];
}

const HEAD_CATALOG_PATH = process.env.HEAD_CATALOG_PATH
  ? resolve(process.env.HEAD_CATALOG_PATH)
  : resolve("lib/governance/catalog.ts");
const HEAD_VOCAB_PATH = process.env.HEAD_VOCAB_PATH
  ? resolve(process.env.HEAD_VOCAB_PATH)
  : resolve("lib/governance/vocabularies.ts");
const BASE_CATALOG_PATH = process.env.BASE_CATALOG_PATH
  ? resolve(process.env.BASE_CATALOG_PATH)
  : "";
const BASE_VOCAB_PATH = process.env.BASE_VOCAB_PATH
  ? resolve(process.env.BASE_VOCAB_PATH)
  : "";
const OUTPUT_PATH = process.env.OUTPUT_PATH || "";

async function loadCatalog(path: string): Promise<CatalogModule> {
  if (!existsSync(path)) {
    return { projects: [], tables: [] };
  }
  const mod = await import(path);
  return {
    projects: Array.isArray(mod.projects) ? (mod.projects as Project[]) : [],
    tables: Array.isArray(mod.tables) ? (mod.tables as Table[]) : [],
  };
}

async function loadVocab(path: string): Promise<VocabModule> {
  if (!existsSync(path)) {
    return { vocabularyGroups: [] };
  }
  const mod = await import(path);
  return {
    vocabularyGroups: Array.isArray(mod.vocabularyGroups)
      ? (mod.vocabularyGroups as VocabularyGroup[])
      : [],
  };
}

function tableKey(t: Table): string {
  return `${t.project}::${t.name}`;
}

function columnKey(t: Table, c: Column): string {
  return `${t.project}::${t.name}::${c.name}`;
}

function vocabGroupKey(g: VocabularyGroup): string {
  return `${g.domain}::${g.group}`;
}

function vocabValueKey(g: VocabularyGroup, v: VocabularyValue): string {
  return `${g.domain}::${g.group}::${v.code}`;
}

interface TableDiff {
  added: Table[];
  removed: Table[];
}

interface ColumnDiff {
  added: { table: Table; column: Column }[];
  removed: { table: Table; column: Column }[];
}

interface VocabGroupDiff {
  added: VocabularyGroup[];
  removed: VocabularyGroup[];
}

interface VocabValueDiff {
  added: { group: VocabularyGroup; value: VocabularyValue }[];
  removed: { group: VocabularyGroup; value: VocabularyValue }[];
}

function diffTables(base: Table[], head: Table[]): TableDiff {
  const baseByKey = new Map(base.map((t) => [tableKey(t), t]));
  const headByKey = new Map(head.map((t) => [tableKey(t), t]));
  const added: Table[] = [];
  const removed: Table[] = [];
  for (const [k, t] of headByKey) if (!baseByKey.has(k)) added.push(t);
  for (const [k, t] of baseByKey) if (!headByKey.has(k)) removed.push(t);
  return { added, removed };
}

function diffColumns(base: Table[], head: Table[]): ColumnDiff {
  const baseByKey = new Map(base.map((t) => [tableKey(t), t]));
  const headByKey = new Map(head.map((t) => [tableKey(t), t]));
  const added: ColumnDiff["added"] = [];
  const removed: ColumnDiff["removed"] = [];
  // Only diff columns for tables that exist in BOTH base and head.
  // Columns of fully added/removed tables are covered by the table diff itself.
  for (const [k, headT] of headByKey) {
    const baseT = baseByKey.get(k);
    if (!baseT) continue;
    const baseCols = new Map(headT.columns.map((c) => [c.name, c])); // placeholder
    const baseColMap = new Map(baseT.columns.map((c) => [c.name, c]));
    const headColMap = new Map(headT.columns.map((c) => [c.name, c]));
    void baseCols;
    for (const [cName, c] of headColMap) {
      if (!baseColMap.has(cName)) added.push({ table: headT, column: c });
    }
    for (const [cName, c] of baseColMap) {
      if (!headColMap.has(cName)) removed.push({ table: headT, column: c });
    }
  }
  return { added, removed };
}

function diffVocabGroups(
  base: VocabularyGroup[],
  head: VocabularyGroup[],
): VocabGroupDiff {
  const baseByKey = new Map(base.map((g) => [vocabGroupKey(g), g]));
  const headByKey = new Map(head.map((g) => [vocabGroupKey(g), g]));
  const added: VocabularyGroup[] = [];
  const removed: VocabularyGroup[] = [];
  for (const [k, g] of headByKey) if (!baseByKey.has(k)) added.push(g);
  for (const [k, g] of baseByKey) if (!headByKey.has(k)) removed.push(g);
  return { added, removed };
}

function diffVocabValues(
  base: VocabularyGroup[],
  head: VocabularyGroup[],
): VocabValueDiff {
  const baseByKey = new Map(base.map((g) => [vocabGroupKey(g), g]));
  const headByKey = new Map(head.map((g) => [vocabGroupKey(g), g]));
  const added: VocabValueDiff["added"] = [];
  const removed: VocabValueDiff["removed"] = [];
  // Only diff values for groups that exist in BOTH base and head.
  for (const [k, headG] of headByKey) {
    const baseG = baseByKey.get(k);
    if (!baseG) continue;
    const baseValMap = new Map(baseG.values.map((v) => [v.code, v]));
    const headValMap = new Map(headG.values.map((v) => [v.code, v]));
    for (const [code, v] of headValMap) {
      if (!baseValMap.has(code)) added.push({ group: headG, value: v });
    }
    for (const [code, v] of baseValMap) {
      if (!headValMap.has(code)) removed.push({ group: headG, value: v });
    }
  }
  return { added, removed };
}

const MARKER = "<!-- governance-bot:catalog-changes -->";

function escapeMd(s: string): string {
  return s.replace(/\|/g, "\\|");
}

function bulletList(lines: string[]): string {
  return lines.length ? lines.map((l) => `- ${l}`).join("\n") : "_(none)_";
}

function summarizeProjectsChanged(
  tableDiff: TableDiff,
  colDiff: ColumnDiff,
): Set<string> {
  const projects = new Set<string>();
  for (const t of tableDiff.added) projects.add(t.project);
  for (const t of tableDiff.removed) projects.add(t.project);
  for (const { table } of colDiff.added) projects.add(table.project);
  for (const { table } of colDiff.removed) projects.add(table.project);
  return projects;
}

function summarizeDomainsChanged(
  groupDiff: VocabGroupDiff,
  valueDiff: VocabValueDiff,
): Set<string> {
  const domains = new Set<string>();
  for (const g of groupDiff.added) domains.add(g.domain);
  for (const g of groupDiff.removed) domains.add(g.domain);
  for (const { group } of valueDiff.added) domains.add(group.domain);
  for (const { group } of valueDiff.removed) domains.add(group.domain);
  return domains;
}

function renderMarkdown(
  tableDiff: TableDiff,
  colDiff: ColumnDiff,
  groupDiff: VocabGroupDiff,
  valueDiff: VocabValueDiff,
): string {
  const tablesAdded = tableDiff.added.length;
  const tablesRemoved = tableDiff.removed.length;
  const colsAdded = colDiff.added.length;
  const colsRemoved = colDiff.removed.length;
  const groupsAdded = groupDiff.added.length;
  const groupsRemoved = groupDiff.removed.length;
  const valuesAdded = valueDiff.added.length;
  const valuesRemoved = valueDiff.removed.length;

  const totalChanges =
    tablesAdded +
    tablesRemoved +
    colsAdded +
    colsRemoved +
    groupsAdded +
    groupsRemoved +
    valuesAdded +
    valuesRemoved;

  const lines: string[] = [];
  lines.push(MARKER);
  lines.push("## Governance catalog changes");
  lines.push("");

  if (totalChanges === 0) {
    lines.push(
      "No structural changes detected in the typed catalog or vocabularies " +
        "between this PR and the base branch. (The vendored sources may have " +
        "changed in ways that do not affect `lib/governance/{catalog,vocabularies}.ts`.)",
    );
    return lines.join("\n");
  }

  const projectsChanged = summarizeProjectsChanged(tableDiff, colDiff);
  const domainsChanged = summarizeDomainsChanged(groupDiff, valueDiff);

  // High-level headline.
  const headlineParts: string[] = [];
  if (tablesAdded || tablesRemoved) {
    headlineParts.push(
      `**${tablesAdded}** table(s) added, **${tablesRemoved}** removed across ${projectsChanged.size} project(s)`,
    );
  }
  if (colsAdded || colsRemoved) {
    headlineParts.push(
      `**${colsAdded}** column(s) added, **${colsRemoved}** removed`,
    );
  }
  if (groupsAdded || groupsRemoved) {
    headlineParts.push(
      `**${groupsAdded}** vocabulary group(s) added, **${groupsRemoved}** removed`,
    );
  }
  if (valuesAdded || valuesRemoved) {
    headlineParts.push(
      `**${valuesAdded}** vocabulary value(s) added, **${valuesRemoved}** removed across ${domainsChanged.size} domain(s)`,
    );
  }
  lines.push(headlineParts.join(". ") + ".");
  lines.push("");

  // Tables
  if (tablesAdded || tablesRemoved) {
    lines.push("<details>");
    lines.push(
      `<summary><strong>Tables</strong> (+${tablesAdded} / -${tablesRemoved})</summary>`,
    );
    lines.push("");
    if (tablesAdded) {
      lines.push("**Added**");
      lines.push("");
      lines.push(
        bulletList(
          tableDiff.added
            .slice()
            .sort((a, b) =>
              `${a.project}::${a.name}`.localeCompare(`${b.project}::${b.name}`),
            )
            .map(
              (t) =>
                `\`${escapeMd(t.project)}\`: \`${escapeMd(t.name)}\` ` +
                `(${t.kind}, ${t.classification}, ${t.columns.length} columns)`,
            ),
        ),
      );
      lines.push("");
    }
    if (tablesRemoved) {
      lines.push("**Removed**");
      lines.push("");
      lines.push(
        bulletList(
          tableDiff.removed
            .slice()
            .sort((a, b) =>
              `${a.project}::${a.name}`.localeCompare(`${b.project}::${b.name}`),
            )
            .map((t) => `\`${escapeMd(t.project)}\`: \`${escapeMd(t.name)}\``),
        ),
      );
      lines.push("");
    }
    lines.push("</details>");
    lines.push("");
  }

  // Columns
  if (colsAdded || colsRemoved) {
    lines.push("<details>");
    lines.push(
      `<summary><strong>Columns</strong> on existing tables (+${colsAdded} / -${colsRemoved})</summary>`,
    );
    lines.push("");
    if (colsAdded) {
      lines.push("**Added**");
      lines.push("");
      lines.push(
        bulletList(
          colDiff.added
            .slice()
            .sort((a, b) =>
              `${a.table.project}::${a.table.name}::${a.column.name}`.localeCompare(
                `${b.table.project}::${b.table.name}::${b.column.name}`,
              ),
            )
            .map(
              ({ table, column }) =>
                `\`${escapeMd(table.project)}\`: \`${escapeMd(table.name)}.${escapeMd(column.name)}\` ` +
                `(${escapeMd(column.type)})`,
            ),
        ),
      );
      lines.push("");
    }
    if (colsRemoved) {
      lines.push("**Removed**");
      lines.push("");
      lines.push(
        bulletList(
          colDiff.removed
            .slice()
            .sort((a, b) =>
              `${a.table.project}::${a.table.name}::${a.column.name}`.localeCompare(
                `${b.table.project}::${b.table.name}::${b.column.name}`,
              ),
            )
            .map(
              ({ table, column }) =>
                `\`${escapeMd(table.project)}\`: \`${escapeMd(table.name)}.${escapeMd(column.name)}\``,
            ),
        ),
      );
      lines.push("");
    }
    lines.push("</details>");
    lines.push("");
  }

  // Vocabulary groups
  if (groupsAdded || groupsRemoved) {
    lines.push("<details>");
    lines.push(
      `<summary><strong>Vocabulary groups</strong> (+${groupsAdded} / -${groupsRemoved})</summary>`,
    );
    lines.push("");
    if (groupsAdded) {
      lines.push("**Added**");
      lines.push("");
      lines.push(
        bulletList(
          groupDiff.added
            .slice()
            .sort((a, b) =>
              `${a.domain}::${a.group}`.localeCompare(`${b.domain}::${b.group}`),
            )
            .map(
              (g) =>
                `\`${escapeMd(g.domain)}\`: \`${escapeMd(g.group)}\` ` +
                `(${g.values.length} values)`,
            ),
        ),
      );
      lines.push("");
    }
    if (groupsRemoved) {
      lines.push("**Removed**");
      lines.push("");
      lines.push(
        bulletList(
          groupDiff.removed
            .slice()
            .sort((a, b) =>
              `${a.domain}::${a.group}`.localeCompare(`${b.domain}::${b.group}`),
            )
            .map(
              (g) => `\`${escapeMd(g.domain)}\`: \`${escapeMd(g.group)}\``,
            ),
        ),
      );
      lines.push("");
    }
    lines.push("</details>");
    lines.push("");
  }

  // Vocabulary values
  if (valuesAdded || valuesRemoved) {
    lines.push("<details>");
    lines.push(
      `<summary><strong>Vocabulary values</strong> on existing groups (+${valuesAdded} / -${valuesRemoved})</summary>`,
    );
    lines.push("");
    if (valuesAdded) {
      lines.push("**Added**");
      lines.push("");
      lines.push(
        bulletList(
          valueDiff.added
            .slice()
            .sort((a, b) =>
              `${a.group.domain}::${a.group.group}::${a.value.code}`.localeCompare(
                `${b.group.domain}::${b.group.group}::${b.value.code}`,
              ),
            )
            .map(
              ({ group, value }) =>
                `\`${escapeMd(group.domain)}\`: \`${escapeMd(group.group)}\`: \`${escapeMd(value.code)}\` — ${escapeMd(value.label)}`,
            ),
        ),
      );
      lines.push("");
    }
    if (valuesRemoved) {
      lines.push("**Removed**");
      lines.push("");
      lines.push(
        bulletList(
          valueDiff.removed
            .slice()
            .sort((a, b) =>
              `${a.group.domain}::${a.group.group}::${a.value.code}`.localeCompare(
                `${b.group.domain}::${b.group.group}::${b.value.code}`,
              ),
            )
            .map(
              ({ group, value }) =>
                `\`${escapeMd(group.domain)}\`: \`${escapeMd(group.group)}\`: \`${escapeMd(value.code)}\``,
            ),
        ),
      );
      lines.push("");
    }
    lines.push("</details>");
    lines.push("");
  }

  lines.push("");
  lines.push(
    "_Posted by `governance-pr-summary.yml`. This comment is updated in place across pushes — look for the marker in the raw markdown._",
  );

  return lines.join("\n");
}

async function main() {
  if (!BASE_CATALOG_PATH || !BASE_VOCAB_PATH) {
    console.error(
      "BASE_CATALOG_PATH and BASE_VOCAB_PATH env vars are required.",
    );
    process.exit(2);
  }

  // Touch readFileSync to silence unused-import in some toolchains.
  void readFileSync;

  const [baseCat, headCat, baseVoc, headVoc] = await Promise.all([
    loadCatalog(BASE_CATALOG_PATH),
    loadCatalog(HEAD_CATALOG_PATH),
    loadVocab(BASE_VOCAB_PATH),
    loadVocab(HEAD_VOCAB_PATH),
  ]);

  const tableDiff = diffTables(baseCat.tables, headCat.tables);
  const colDiff = diffColumns(baseCat.tables, headCat.tables);
  const groupDiff = diffVocabGroups(
    baseVoc.vocabularyGroups,
    headVoc.vocabularyGroups,
  );
  const valueDiff = diffVocabValues(
    baseVoc.vocabularyGroups,
    headVoc.vocabularyGroups,
  );

  const md = renderMarkdown(tableDiff, colDiff, groupDiff, valueDiff);

  if (OUTPUT_PATH) {
    writeFileSync(OUTPUT_PATH, md);
    console.error(`Wrote ${md.length} bytes to ${OUTPUT_PATH}`);
  } else {
    process.stdout.write(md);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
