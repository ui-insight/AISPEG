import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { isCanonicalUdmTable } from "../lib/governance/canonical-udm-tables";
import type {
  Column,
  Project,
  Relationship,
  Table,
  TableKind,
  VocabularyGroup,
  VocabularyValue,
} from "../lib/governance/types";

const ROOT = join(__dirname, "..");
const VENDOR = join(ROOT, "vendor", "data-governance");
const CATALOG_DIR = join(VENDOR, "catalog");
const VOCAB_DIR = join(VENDOR, "vocabularies");
const OUT_CATALOG = join(ROOT, "lib", "governance", "catalog.ts");
const OUT_VOCAB = join(ROOT, "lib", "governance", "vocabularies.ts");

function fail(msg: string): never {
  console.error(`[build-governance-catalog] ${msg}`);
  process.exit(1);
}

function readJson(path: string): any {
  if (!existsSync(path)) fail(`missing file: ${path}`);
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (e) {
    fail(`malformed JSON at ${path}: ${(e as Error).message}`);
  }
}

function classify(name: string): "canonical-udm" | "project-extension" {
  return isCanonicalUdmTable(name) ? "canonical-udm" : "project-extension";
}

function normalizeColumn(raw: any): Column {
  const fkRaw = raw.foreign_key;
  return {
    name: String(raw.name),
    type: String(raw.type),
    nullable: typeof raw.nullable === "boolean" ? raw.nullable : undefined,
    primaryKey:
      typeof raw.primary_key === "boolean" ? raw.primary_key : undefined,
    foreignKey: fkRaw === undefined || fkRaw === null ? null : String(fkRaw),
  };
}

function normalizeField(raw: any): Column {
  // entities-shape fields: { name, type } where type may include "nullable"
  const typeStr = String(raw.type || "");
  const nullable = /\bnullable\b/i.test(typeStr);
  return {
    name: String(raw.name),
    type: typeStr,
    nullable: nullable || undefined,
    primaryKey: undefined,
    foreignKey: null,
  };
}

function normalizeRelationships(raw: any[]): Relationship[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({
    name: String(r.name ?? ""),
    target: String(r.target ?? ""),
    type: String(r.type ?? ""),
  }));
}

function normalizeUniqueConstraints(raw: any): string[][] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c) => Array.isArray(c))
    .map((c) => c.map((s: any) => String(s)));
}

function buildTablesForProject(slug: string, raw: any): Table[] {
  const out: Table[] = [];
  if (Array.isArray(raw.tables)) {
    for (const t of raw.tables) {
      const name = String(t.table_name);
      out.push({
        project: slug,
        kind: "table" as TableKind,
        name,
        modelClass: t.model_class ? String(t.model_class) : undefined,
        description: t.description ? String(t.description) : undefined,
        columns: Array.isArray(t.columns)
          ? t.columns.map(normalizeColumn)
          : [],
        uniqueConstraints: normalizeUniqueConstraints(t.unique_constraints),
        relationships: normalizeRelationships(t.relationships),
        classification: classify(name),
      });
    }
  }
  if (Array.isArray(raw.entities)) {
    for (const e of raw.entities) {
      const name = String(e.name);
      out.push({
        project: slug,
        kind: "entity" as TableKind,
        name,
        description: e.description ? String(e.description) : undefined,
        columns: Array.isArray(e.fields) ? e.fields.map(normalizeField) : [],
        uniqueConstraints: [],
        relationships: [],
        classification: classify(name),
      });
    }
  }
  if (Array.isArray(raw.projection_tables)) {
    for (const t of raw.projection_tables) {
      const name = String(t.table_name);
      out.push({
        project: slug,
        kind: "projection_table" as TableKind,
        name,
        modelClass: t.model_class ? String(t.model_class) : undefined,
        description: t.description ? String(t.description) : undefined,
        columns: Array.isArray(t.columns)
          ? t.columns.map(normalizeColumn)
          : [],
        uniqueConstraints: normalizeUniqueConstraints(t.unique_constraints),
        relationships: normalizeRelationships(t.relationships),
        classification: classify(name),
      });
    }
  }
  return out;
}

function buildProject(slug: string, raw: any, tables: Table[]): Project {
  const canonicalUdmCount = tables.filter(
    (t) => t.classification === "canonical-udm",
  ).length;
  const projectExtensionCount = tables.length - canonicalUdmCount;
  return {
    slug,
    application: String(raw.application ?? slug),
    repository: String(raw.repository ?? ""),
    domain: String(raw.domain ?? ""),
    techStack: {
      backend: raw.tech_stack?.backend
        ? String(raw.tech_stack.backend)
        : undefined,
      frontend: raw.tech_stack?.frontend
        ? String(raw.tech_stack.frontend)
        : undefined,
      database: raw.tech_stack?.database
        ? String(raw.tech_stack.database)
        : undefined,
    },
    runtimeModes: Array.isArray(raw.runtime_modes)
      ? raw.runtime_modes.map((m: any) => String(m))
      : undefined,
    tableCount: tables.length,
    canonicalUdmCount,
    projectExtensionCount,
  };
}

function buildVocabularies(): VocabularyGroup[] {
  if (!existsSync(VOCAB_DIR)) {
    fail(`missing vocabularies dir: ${VOCAB_DIR}`);
  }
  const out: VocabularyGroup[] = [];
  for (const domain of readdirSync(VOCAB_DIR)) {
    const domainDir = join(VOCAB_DIR, domain);
    const allowedPath = join(domainDir, "allowed_values.json");
    if (!existsSync(allowedPath)) continue;
    const raw = readJson(allowedPath);
    const groups = raw.value_groups;
    if (!Array.isArray(groups)) continue;
    for (const g of groups) {
      const values: VocabularyValue[] = Array.isArray(g.values)
        ? g.values.map((v: any) => ({
            code: String(v.Code ?? v.code ?? ""),
            label: String(v.Label ?? v.label ?? ""),
            displayOrder:
              typeof v.Display_Order === "number"
                ? v.Display_Order
                : typeof v.display_order === "number"
                  ? v.display_order
                  : undefined,
            description: v.Description
              ? String(v.Description)
              : v.description
                ? String(v.description)
                : undefined,
            verificationRule: v.Verification_Rule
              ? String(v.Verification_Rule)
              : v.verification_rule
                ? String(v.verification_rule)
                : undefined,
          }))
        : [];
      out.push({
        domain,
        application: raw.application ? String(raw.application) : undefined,
        group: String(g.Value_Group ?? g.value_group ?? g.group ?? ""),
        description: g.description ? String(g.description) : undefined,
        values,
      });
    }
  }
  return out;
}

function emit(path: string, contents: string) {
  writeFileSync(path, contents);
  console.log(`[build-governance-catalog] wrote ${path}`);
}

const HEADER = `// Auto-generated by scripts/build-governance-catalog.ts.
// Do not edit by hand — re-run \`npm run build:governance\` (or any \`npm run build\`)
// to regenerate from vendor/data-governance/.
`;

function main() {
  if (!existsSync(CATALOG_DIR)) {
    fail(
      `missing ${CATALOG_DIR}. Did you run \`git submodule update --init\`?`,
    );
  }
  const catalogFiles = readdirSync(CATALOG_DIR).filter((f) =>
    f.endsWith(".json"),
  );
  if (catalogFiles.length === 0) fail(`no JSON files in ${CATALOG_DIR}`);

  const allTables: Table[] = [];
  const projects: Project[] = [];

  for (const file of catalogFiles.sort()) {
    const slug = basename(file, ".json");
    const raw = readJson(join(CATALOG_DIR, file));
    const tables = buildTablesForProject(slug, raw);
    allTables.push(...tables);
    projects.push(buildProject(slug, raw, tables));
  }

  const vocabularyGroups = buildVocabularies();

  emit(
    OUT_CATALOG,
    HEADER +
      `import type { Project, Table } from "./types";\n\n` +
      `export const projects: Project[] = ${JSON.stringify(projects, null, 2)};\n\n` +
      `export const tables: Table[] = ${JSON.stringify(allTables, null, 2)};\n\n` +
      `export function getProject(slug: string): Project | undefined {\n` +
      `  return projects.find((p) => p.slug === slug);\n` +
      `}\n\n` +
      `export function getTablesForProject(slug: string): Table[] {\n` +
      `  return tables.filter((t) => t.project === slug);\n` +
      `}\n`,
  );

  emit(
    OUT_VOCAB,
    HEADER +
      `import type { VocabularyGroup } from "./types";\n\n` +
      `export const vocabularyGroups: VocabularyGroup[] = ${JSON.stringify(vocabularyGroups, null, 2)};\n`,
  );

  console.log(
    `[build-governance-catalog] ${projects.length} projects, ${allTables.length} tables, ${vocabularyGroups.length} vocabulary groups`,
  );
}

main();
