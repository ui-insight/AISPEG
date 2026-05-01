// scripts/migrate.ts
//
// Applies pending SQL migrations from db/migrations/ to the database
// pointed at by DATABASE_URL. Tracks applied migrations in a
// schema_migrations table (created by 005 onward).
//
// Usage:
//   npm run migrate
//
// Behaviour:
//   1. Connects to DATABASE_URL.
//   2. If schema_migrations exists, reads applied versions.
//   3. If schema_migrations does not exist BUT the applications table does,
//      backfills 001-004 as already applied (legacy DB; their schemas are
//      present from the docker-entrypoint-initdb.d auto-load).
//   4. Applies any *.sql file in db/migrations/ whose stem is not already
//      in schema_migrations, in lexicographic order.
//   5. Each migration runs as one PostgreSQL statement batch — the file
//      itself is responsible for BEGIN / COMMIT.

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "db", "migrations");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Set it in .env.local or the environment.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

async function tableExists(name: string): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [name]
  );
  return result.rows[0]?.exists === true;
}

async function ensureSchemaMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function getAppliedVersions(): Promise<Set<string>> {
  const result = await pool.query<{ version: string }>(
    `SELECT version FROM schema_migrations`
  );
  return new Set(result.rows.map((r) => r.version));
}

async function backfillLegacyMigrations(): Promise<void> {
  // If applications table exists but schema_migrations is empty, the DB
  // was bootstrapped from docker-entrypoint-initdb.d before this runner
  // existed. Mark 001-004 as already applied so we don't re-run them
  // (001 in particular uses CREATE TABLE without IF NOT EXISTS and would
  // fail).
  const applicationsExists = await tableExists("applications");
  if (!applicationsExists) return;

  const applied = await getAppliedVersions();
  const legacy = ["001_initial", "002_extended_questions", "003_application_registry", "004_seed_applications"];
  for (const version of legacy) {
    if (!applied.has(version)) {
      await pool.query(
        `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING`,
        [version]
      );
      console.log(`  ↳ marked ${version} as applied (legacy backfill)`);
    }
  }
}

function listMigrations(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

async function applyMigration(filename: string): Promise<void> {
  const version = filename.replace(/\.sql$/, "");
  const sqlPath = join(MIGRATIONS_DIR, filename);
  const sql = readFileSync(sqlPath, "utf8");

  console.log(`Applying ${version} ...`);
  // The migration files wrap themselves in BEGIN / COMMIT, so we just
  // execute the file content. If it doesn't contain its own COMMIT, the
  // runner falls back to a single-statement transaction by default.
  await pool.query(sql);

  // Most migrations from 005 onward record themselves; older ones won't.
  // Idempotent insert covers both cases.
  await pool.query(
    `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING`,
    [version]
  );
  console.log(`  ↳ ${version} applied`);
}

async function main(): Promise<void> {
  console.log(`Connecting to ${databaseUrl?.replace(/\/\/[^@]+@/, "//***@")}`);

  await ensureSchemaMigrationsTable();
  await backfillLegacyMigrations();

  const applied = await getAppliedVersions();
  const all = listMigrations();
  const pending = all.filter((f) => !applied.has(f.replace(/\.sql$/, "")));

  if (pending.length === 0) {
    console.log("No pending migrations. Database is up to date.");
    return;
  }

  console.log(`${pending.length} pending migration(s): ${pending.join(", ")}`);
  for (const f of pending) {
    await applyMigration(f);
  }
  console.log(`\nDone. Applied ${pending.length} migration(s).`);
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
