import { DocPage, InfoBox } from "@/components/DocPage";

export default function DeploymentDocsPage() {
  return (
    <DocPage
      title="Deployment & Operations"
      subtitle="Docker deployment, database migrations, environment variables, and server management."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Deployment" },
      ]}
    >
      <h2>Infrastructure</h2>
      <p>
        The site runs on University of Idaho Insight infrastructure:
      </p>
      <ul>
        <li><strong>Host</strong>: <code>openera.insight.uidaho.edu</code></li>
        <li><strong>Deploy user</strong>: <code>devops</code></li>
        <li><strong>Network</strong>: <code>10.10.9.0/24</code> subnet (not Docker default <code>172.x.x.x</code>)</li>
        <li><strong>Production URL</strong>: <code>https://aispeg.insight.uidaho.edu</code> (port 9260)</li>
        <li><strong>Dev URL</strong>: <code>https://aispeg-dev.insight.uidaho.edu</code> (port 9270)</li>
      </ul>

      <h2>Docker Compose</h2>
      <p>
        The application uses Docker Compose with profile-based separation of production and dev environments.
        Each profile runs two containers: the Next.js application and a PostgreSQL 16 instance.
      </p>

      <h3>Deploy Production</h3>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
ssh devops@openera.insight.uidaho.edu
cd /home/devops/AISPEG
git pull origin main
docker compose --profile prod up -d --build
      `}</pre>

      <h3>Deploy Dev</h3>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
docker compose --profile dev up -d --build
      `}</pre>

      <h3>View Logs</h3>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
docker compose --profile prod logs -f
docker compose --profile dev logs -f
      `}</pre>

      <h3>Stop</h3>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
docker compose --profile prod down
docker compose --profile dev down
      `}</pre>

      <h2>Container Layout</h2>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
Container                  IP            Port Mapping
──────────────────────────────────────────────────────
aispeg-postgres-prod      10.10.9.10    (internal only)
aispeg-prod               10.10.9.20    9260 → 3000
aispeg-postgres-dev       10.10.9.11    (internal only)
aispeg-dev                10.10.9.21    9270 → 3000
      `}</pre>

      <h2>Environment Variables</h2>
      <p>
        Environment variables are set in <code>.env</code> on the server (not checked into git)
        and/or in <code>docker-compose.yml</code> with defaults:
      </p>

      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
# Database (defaults in docker-compose.yml)
POSTGRES_DB=aispeg
POSTGRES_USER=aispeg
POSTGRES_PASSWORD=aispeg_secret
DATABASE_URL=postgresql://aispeg:aispeg_secret@10.10.9.10:5432/aispeg

# GitHub (optional, for future template automation)
GITHUB_TOKEN=

# MindRouter AI (required for AI features)
MINDROUTER_API_KEY=mr2_...
MINDROUTER_BASE_URL=https://mindrouter.uidaho.edu
MINDROUTER_MODEL=qwen/qwen3.6-27b
      `}</pre>

      <InfoBox type="warning" title="Security">
        The <code>.env</code> file contains secrets and must never be committed to git.
        The <code>.gitignore</code> should exclude it. On the server, ensure file permissions
        restrict access to the devops user only.
      </InfoBox>

      <h2>Database Migrations</h2>
      <p>
        Migrations live in <code>db/migrations/</code>, numbered sequentially and applied in
        that order. They are a mix of schema changes (<code>007_lifecycle_taxonomy.sql</code>)
        and data migrations (<code>016_update_ucm_and_water_law_statuses.sql</code>).
      </p>

      <h3>Running Migrations</h3>
      <p>
        <code>scripts/migrate.ts</code> is the only thing that applies migrations. It records
        each one in the <code>schema_migrations</code> table and skips anything already
        recorded, so it is safe to run at any time.
      </p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
# Local, against the dev database
npm run migrate

# Dev deployment — applied automatically by the migrate-dev
# one-shot before the app container starts
docker compose --profile dev up -d --build

# Production — deliberate, run on demand
ssh devops@openera.insight.uidaho.edu
docker compose --profile migrate run --rm migrate-prod

# Verify what has been applied
docker exec aispeg-postgres-prod \\
  psql -U aispeg -d aispeg -c 'select version from schema_migrations order by version'
      `}</pre>

      <InfoBox type="warning" title="Never pipe a .sql file straight into psql">
        A hand-applied migration changes the schema without recording itself in
        <code>schema_migrations</code>, so the runner will later try to apply it again and
        fail on the second attempt. Individual migrations are <em>not</em> reliably
        idempotent — several add columns without an <code>IF NOT EXISTS</code> guard, and the
        data migrations would duplicate rows. Idempotency lives in the runner, not the files.
      </InfoBox>

      <h2>Port Mapping (All Insight Apps)</h2>
      <p>
        The Insight server hosts multiple applications with dedicated port ranges:
      </p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
URL                                        Port
─────────────────────────────────────────────────
openera.insight.uidaho.edu                 9200
openera-dev.insight.uidaho.edu             9210
strategicplan.insight.uidaho.edu           9220
strategicplan-dev.insight.uidaho.edu       9230
processmapping.insight.uidaho.edu          9240
processmapping-dev.insight.uidaho.edu      9250
aispeg.insight.uidaho.edu                  9260  ◄── This app
aispeg-dev.insight.uidaho.edu              9270
ucmnews.insight.uidaho.edu                 9280
ucmnews-dev.insight.uidaho.edu             9290
      `}</pre>

      <h2>Dockerfile</h2>
      <p>The Dockerfile uses a multi-stage build for minimal production images:</p>
      <ol>
        <li><strong>deps</strong> — Installs npm dependencies</li>
        <li><strong>builder</strong> — Copies source, runs <code>next build</code></li>
        <li><strong>runner</strong> — Minimal Alpine image with standalone Next.js output</li>
      </ol>
      <p>
        The final image runs as a non-root <code>nextjs</code> user and exposes port 3000.
      </p>

      <h2>Database Backup</h2>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
# Dump production database
ssh devops@openera.insight.uidaho.edu \\
  "docker exec aispeg-postgres-prod \\
   pg_dump -U aispeg aispeg" > backup.sql

# Restore to dev
ssh devops@openera.insight.uidaho.edu \\
  "docker exec -i aispeg-postgres-dev \\
   psql -U aispeg -d aispeg_dev" < backup.sql
      `}</pre>

      <h2>Local Development</h2>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
# Install dependencies
npm install

# Start dev server (no database required for most pages)
npm run dev

# Build for production
npm run build

# Lint
npm run lint
      `}</pre>
      <p>
        For local database development, set <code>DATABASE_URL</code> in a local <code>.env</code>
        file pointing to a local PostgreSQL instance.
      </p>
    </DocPage>
  );
}
