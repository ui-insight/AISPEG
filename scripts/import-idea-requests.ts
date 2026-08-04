// scripts/import-idea-requests.ts
//
// Imports an OIT IDEA form export cut (data/oit-idea/*.json, converted
// from OIT's spreadsheet export) into the request layer (ADR 0005):
//
//   1. `oit_idea_requests` — the disposable per-source projection
//      (raw export columns, verbatim; re-runnable on each new cut).
//   2. `tech_requests` — the durable canonical registry, mirrored with
//      origin 'oit-idea'. Import-owned fields (title, need statement,
//      requestor, received_at) are refreshed on re-import; site-owned
//      routing state (track, stage, disposition, links, claims) is
//      never touched after first insert. A 'received' audit event is
//      written once, on first appearance (lib/clickup-sync.ts posture).
//
// Exact-duplicate handling: the 2026-08-02 cut contains resubmissions
// (same title + same dept). The canonical row is the one OIT is
// progressing (In Progress > On Hold > Received; tie → latest
// Modified). Others are registered with disposition 'merged', a
// 'merged' audit event, and a duplicate-of link to the canonical —
// mechanical bookkeeping of exact matches only; anything fuzzier is
// triage's call, not this script's.
//
// Keys: no ticket id in the export yet, so rows key on
// sha256("<title>|<createdRaw>") — see Migration 023's header for the
// fragility note and the switch-to-real-ids plan.
//
// Usage:
//   npm run import:idea-requests                 # default: latest committed cut
//   npm run import:idea-requests -- <path.json>  # explicit cut
//   npm run import:idea-requests -- --dry-run    # parse + plan, no DB

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { Pool, type PoolClient } from "pg";

const DEFAULT_CUT = "data/oit-idea/idea-requests-2026-08-02.json";
const ACTOR = "import-idea-requests";

// OIT's workflow vocabulary as of the 2026-08-02 cut. Kept verbatim in
// the projection; an unknown value warns loudly but still imports, so
// an upstream rename degrades visibly instead of dropping rows.
const KNOWN_OIT_STATUSES = new Set(["Received", "In Progress", "On Hold"]);

// Canonical-row preference among exact duplicates: the one OIT is
// actively progressing wins.
const STATUS_RANK: Record<string, number> = {
  "In Progress": 2,
  "On Hold": 1,
  Received: 0,
};

interface IdeaExportRow {
  title: string;
  description: string;
  requestor: string;
  dept: string;
  oitStatus: string;
  createdRaw: string;
  modifiedRaw: string;
}

interface IdeaExport {
  source: string;
  sourceCut: string;
  timezone: string;
  rows: IdeaExportRow[];
}

interface PreparedRow extends IdeaExportRow {
  sourceKey: string;
  createdIso: string;
  modifiedIso: string;
  /** Source key of the canonical row this one duplicates, if any. */
  duplicateOfKey: string | null;
}

// ── Naive-timestamp → instant conversion ─────────────────────────────
//
// The export carries naive local timestamps (no offset). Interpret
// them in the export's declared timezone via Intl — two-pass offset
// estimation converges across DST boundaries.

function tzOffsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(utcMs));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) % 24,
    Number(p.minute),
    Number(p.second)
  );
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

function naiveToIso(naive: string, timeZone: string): string {
  const m = naive.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/
  );
  if (!m) throw new Error(`Unparseable timestamp: ${naive}`);
  const [, y, mo, d, h, mi, s, frac] = m;
  const ms = frac ? Math.round(Number(`0.${frac}`) * 1000) : 0;
  const wallUtc = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s),
    ms
  );
  let instant = wallUtc;
  for (let i = 0; i < 2; i++) {
    instant = wallUtc - tzOffsetMs(instant, timeZone);
  }
  return new Date(instant).toISOString();
}

// ── Load + prepare ───────────────────────────────────────────────────

function sourceKeyFor(row: IdeaExportRow): string {
  return createHash("sha256")
    .update(`${row.title}|${row.createdRaw}`)
    .digest("hex");
}

function loadExport(path: string): IdeaExport {
  const data = JSON.parse(readFileSync(path, "utf8")) as IdeaExport;
  if (!data.sourceCut || !data.timezone || !Array.isArray(data.rows)) {
    throw new Error(`${path} is not an IDEA export cut (missing sourceCut/timezone/rows).`);
  }
  for (const [i, row] of data.rows.entries()) {
    for (const field of [
      "title",
      "description",
      "requestor",
      "dept",
      "oitStatus",
      "createdRaw",
      "modifiedRaw",
    ] as const) {
      if (!row[field] || typeof row[field] !== "string") {
        throw new Error(`Row ${i + 1}: missing or non-string field '${field}'.`);
      }
    }
    if (!KNOWN_OIT_STATUSES.has(row.oitStatus)) {
      console.warn(
        `⚠ Row ${i + 1} ("${row.title}") has unrecognized OIT status "${row.oitStatus}" — imported verbatim; extend KNOWN_OIT_STATUSES if OIT renamed a stage.`
      );
    }
  }
  return data;
}

function prepare(data: IdeaExport): PreparedRow[] {
  const rows: PreparedRow[] = data.rows.map((row) => ({
    ...row,
    sourceKey: sourceKeyFor(row),
    createdIso: naiveToIso(row.createdRaw, data.timezone),
    modifiedIso: naiveToIso(row.modifiedRaw, data.timezone),
    duplicateOfKey: null,
  }));

  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.sourceKey)) {
      throw new Error(
        `Colliding source key for "${row.title}" (${row.createdRaw}) — two rows share title+created.`
      );
    }
    seen.add(row.sourceKey);
  }

  // Exact-duplicate groups: same title + same dept (case-insensitive).
  const groups = new Map<string, PreparedRow[]>();
  for (const row of rows) {
    const groupKey = `${row.title.toLowerCase()}|${row.dept.toLowerCase()}`;
    const group = groups.get(groupKey) ?? [];
    group.push(row);
    groups.set(groupKey, group);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const canonical = [...group].sort(
      (a, b) =>
        (STATUS_RANK[b.oitStatus] ?? -1) - (STATUS_RANK[a.oitStatus] ?? -1) ||
        b.modifiedRaw.localeCompare(a.modifiedRaw)
    )[0]!;
    for (const row of group) {
      if (row !== canonical) row.duplicateOfKey = canonical.sourceKey;
    }
  }

  // Canonical rows first, so duplicate-of links can resolve their
  // target's registry id in one pass.
  return rows.sort((a, b) =>
    Number(a.duplicateOfKey !== null) - Number(b.duplicateOfKey !== null)
  );
}

// ── Import ───────────────────────────────────────────────────────────

async function importCut(
  client: PoolClient,
  data: IdeaExport,
  rows: PreparedRow[]
): Promise<void> {
  const registryIdByKey = new Map<string, string>();
  let insertedCount = 0;
  let refreshedCount = 0;

  for (const row of rows) {
    await client.query(
      `INSERT INTO oit_idea_requests (
         source_key, title, description, requestor, dept, oit_status,
         created_at, modified_at, source_cut
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (source_key) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         requestor = EXCLUDED.requestor,
         dept = EXCLUDED.dept,
         oit_status = EXCLUDED.oit_status,
         created_at = EXCLUDED.created_at,
         modified_at = EXCLUDED.modified_at,
         source_cut = EXCLUDED.source_cut,
         synced_at = now()`,
      [
        row.sourceKey,
        row.title,
        row.description,
        row.requestor,
        row.dept,
        row.oitStatus,
        row.createdIso,
        row.modifiedIso,
        data.sourceCut,
      ]
    );

    // Registry mirror. Disposition is set at first insert only —
    // 'open' ('merged' for exact duplicates) — and never updated
    // here: once a row is in the registry, disposition belongs to
    // triage on the site, not to the export.
    const registryRow = await client.query<{ id: string; inserted: boolean }>(
      `INSERT INTO tech_requests (
         origin, oit_idea_key, requestor_name, requestor_unit,
         title, need_statement, disposition, received_at
       ) VALUES ('oit-idea',$1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (oit_idea_key) WHERE oit_idea_key IS NOT NULL
       DO UPDATE SET
         requestor_name = EXCLUDED.requestor_name,
         requestor_unit = EXCLUDED.requestor_unit,
         title = EXCLUDED.title,
         need_statement = EXCLUDED.need_statement,
         received_at = EXCLUDED.received_at
       RETURNING id, (xmax = 0) AS inserted`,
      [
        row.sourceKey,
        row.requestor,
        row.dept,
        row.title,
        row.description,
        row.duplicateOfKey ? "merged" : "open",
        row.createdIso,
      ]
    );
    const { id, inserted } = registryRow.rows[0]!;
    registryIdByKey.set(row.sourceKey, id);

    if (inserted) {
      insertedCount++;
      await client.query(
        `INSERT INTO tech_request_events (request_id, at, actor, event_type, note)
         VALUES ($1, $2, $3, 'received', $4)`,
        [
          id,
          row.createdIso,
          ACTOR,
          `Imported from the OIT IDEA form export (cut ${data.sourceCut}).`,
        ]
      );

      if (row.duplicateOfKey) {
        const canonicalId = registryIdByKey.get(row.duplicateOfKey);
        if (!canonicalId) {
          throw new Error(
            `Canonical row for duplicate "${row.title}" not yet imported — ordering bug.`
          );
        }
        await client.query(
          `INSERT INTO tech_request_events (request_id, at, actor, event_type, to_value, note)
           VALUES ($1, now(), $2, 'merged', $3, $4)`,
          [
            id,
            ACTOR,
            canonicalId,
            "Exact duplicate (same title + dept) in the IDEA export; merged into the submission OIT is progressing.",
          ]
        );
        await client.query(
          `INSERT INTO tech_request_links (request_id, related_request_id, link_type, created_by, note)
           VALUES ($1, $2, 'duplicate-of', $3, 'Resubmission of the same IDEA form request.')
           ON CONFLICT (request_id, related_request_id, link_type) DO NOTHING`,
          [id, canonicalId, ACTOR]
        );
      }
    } else {
      refreshedCount++;
    }
  }

  console.log(
    `\nRegistry: ${insertedCount} inserted, ${refreshedCount} refreshed (import-owned fields only).`
  );
}

// ── Main ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const path = args.find((a) => !a.startsWith("--")) ?? DEFAULT_CUT;

  const data = loadExport(path);
  const rows = prepare(data);
  const duplicates = rows.filter((r) => r.duplicateOfKey !== null);

  console.log(`Cut ${data.sourceCut} (${data.source})`);
  console.log(`${rows.length} rows, ${duplicates.length} exact duplicate(s) → ${rows.length - duplicates.length} canonical requests.`);
  const statusCounts = new Map<string, number>();
  for (const row of rows) {
    statusCounts.set(row.oitStatus, (statusCounts.get(row.oitStatus) ?? 0) + 1);
  }
  for (const [status, n] of statusCounts) console.log(`  ${status}: ${n}`);
  for (const dup of duplicates) {
    const canonical = rows.find((r) => r.sourceKey === dup.duplicateOfKey)!;
    console.log(
      `  duplicate: "${dup.title}" (${dup.oitStatus}, ${dup.createdRaw}) → canonical ${canonical.oitStatus}, ${canonical.createdRaw}`
    );
  }

  if (dryRun) {
    console.log("\n--dry-run: no database writes.");
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Set it in .env.local or the environment.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await importCut(client, data, rows);
    await client.query("COMMIT");
    console.log("Import committed.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
