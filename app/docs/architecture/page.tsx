import { DocPage, InfoBox } from "@/components/DocPage";

export default function ArchitectureDocsPage() {
  return (
    <DocPage
      title="Architecture & Data Model"
      subtitle="System architecture, database schema, data flow, and the similarity detection engine."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Architecture" },
      ]}
    >
      <h2>System Overview</h2>
      <p>
        The site is a Next.js 16 application with a PostgreSQL backend, deployed as Docker
        containers on University of Idaho Insight infrastructure. It integrates with MindRouter,
        the university&apos;s on-prem LLM inference cluster, for AI-powered features.
      </p>

      <h3>Component Diagram</h3>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
┌──────────────────────────────────────────────────────────────────┐
│                            Browser                               │
│ ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌──────┐ ┌───────────┐ │
│ │ Portfolio │ │ Builder  │ │ Site      │ │Admin │ │ Internal  │ │
│ │ + Pipeline│ │ Guide    │ │ Assistant │ │Pages │ │ (ops only)│ │
│ └─────┬─────┘ └────┬─────┘ └─────┬─────┘ └──┬───┘ └─────┬─────┘ │
└───────┼────────────┼─────────────┼──────────┼───────────┼────────┘
        │            │             │          │           │
        ▼            ▼             ▼          ▼           ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Next.js (App Router)                       │
│  Server components read lib/* directly — most pages make no API  │
│  call at all. Route handlers exist for mutations and the agent:  │
│                                                                  │
│  /api/submissions  /api/registry   /api/ai/analyze-idea          │
│  /api/.../notes    /api/.../promote  /api/ai/refine              │
│  /api/.../similarity  /api/similarity/preview                    │
│  /api/ask (agent loop)         /internal/sync (ClickUp trigger)  │
└───┬────────────────────┬───────────────────┬─────────────────────┘
    │                    │                   │
    ▼                    ▼                   ▼
┌─────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  PostgreSQL 16  │ │ MindRouter (LLM) │ │  External / vendored │
│ submissions     │ │ OpenAI-compatible│ │ ClickUp  (pull-only) │
│ submission_*    │ │ qwen3.6-27b      │ │ GitHub Issues        │
│ applications    │ │ mindrouter       │ │ vendor/data-         │
│ blockers        │ │   .uidaho.edu    │ │   governance (submod)│
│ similarity_*    │ └──────────────────┘ │ vendor/strategic-plan│
│ clickup_*       │                      └──────────────────────┘
│ tech_request*   │      Typed TS modules (lib/*) are the source
│ roi_claims      │      of truth for taxonomies and narrative —
│ agent_queries   │      generated catalogs come from the
│ schema_migrations│     submodules at build time.
└─────────────────┘
      `}</pre>

      <InfoBox type="info" title="Server components, not a REST client">
        Most of this site never touches its own API. Pages are server
        components that import <code>lib/*</code> and query Postgres directly.
        The route handlers above exist for mutations (the wizard, the admin
        surfaces), for the agent loop, and for the sync trigger — not as a
        data-access layer for the UI.
      </InfoBox>

      <h2>Database Schema</h2>

      <h3>submissions</h3>
      <p>Stores every idea submitted through the Builder Guide wizard.</p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
id               UUID PRIMARY KEY
idea_text        TEXT           -- Free-text idea description
answers          JSONB          -- Complete quiz answers (all steps)
score            INTEGER        -- Computed complexity score
tier             INTEGER        -- 1-4 tier classification
submitter_name   TEXT           -- Optional contact info
submitter_email  TEXT
department       TEXT
status           TEXT           -- new | reviewed | in-progress | archived
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
      `}</pre>

      <h3>submission_details</h3>
      <p>Denormalized quiz answers for efficient querying and similarity detection.</p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
id                UUID PRIMARY KEY
submission_id     UUID FK → submissions
sensitivity       TEXT[]         -- FERPA, HIPAA, PII, CUI, etc.
complexity        TEXT           -- Static, CRUD, Multi-source, Real-time
userbase          TEXT           -- Team, Department, College, University, External
auth_level        TEXT           -- None, Password, SSO, RBAC, Multi-tenant
integrations      TEXT[]         -- University APIs, SaaS, AI/LLM, etc.
data_sources      TEXT[]         -- Banner, Canvas, LDAP, Slate, etc.
university_systems TEXT[]        -- VandalWeb, Banner Student/Finance/HR, etc.
output_types      TEXT[]         -- Reporting, Records, Notifications, etc.
      `}</pre>

      <h3>applications</h3>
      <p>The application registry — every app in the university portfolio.</p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
id                UUID PRIMARY KEY
name              TEXT           -- Application name
description       TEXT           -- What it does
owner_name        TEXT           -- Who owns it
owner_email       TEXT
department        TEXT
github_repo       TEXT           -- e.g. "ui-insight/my-app"
url               TEXT           -- Production URL
tier              INTEGER        -- 1-4
status            TEXT           -- idea | approved | in-development |
                                 -- staging | production | retired
proposed_deployment_environment TEXT
                                 -- OIT-hosted/Azure/OCI/on-prem, IIDS,
                                 -- external, not-applicable, or TBD
enterprise_replacement_status TEXT -- yes | no | to-be-determined
existing_enterprise_system_name TEXT
existing_enterprise_system_annual_cost_usd NUMERIC(14,2)
existing_enterprise_system_renewal_date DATE
sensitivity       TEXT[]         -- Same dimensions as submission_details
complexity        TEXT
userbase          TEXT
auth_level        TEXT
integrations      TEXT[]
data_sources      TEXT[]
university_systems TEXT[]
output_types      TEXT[]
submission_id     UUID FK → submissions  -- Provenance link
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ    -- Auto-updated via trigger

-- Portfolio identity (Migration 005). lib/portfolio.ts is the typed
-- shadow and seed source; lib/work.ts is the runtime read path.
slug              TEXT           -- Stable public identifier
tagline           TEXT
home_units        TEXT[]         -- Whose work depends on this
operational_owners JSONB         -- [{name, title}] — rendered publicly
build_participants TEXT[]        -- Who actually built it
visibility_tier   TEXT           -- public | embargoed | internal
clickup_task_id   TEXT           -- Reverse pointer (ADR 0004)

-- Lifecycle taxonomy (Migration 007, ADR 0001). No CHECK constraint —
-- the typed union in lib/portfolio.ts is the source of truth, and
-- npm run verify:portfolio enforces the per-status evidence rules.
status            TEXT           -- 12 values: idea | scoping | approved |
                                 -- building | prototype | piloting |
                                 -- production | maintained | paused |
                                 -- sunsetting | archived | tracked
iids_sponsor      TEXT
feature_complete  BOOLEAN
live_url_is_staging BOOLEAN
pilot_cohort      JSONB          -- {size, scope, namedUsers[]}
production_scope  TEXT           -- home-unit | institution-wide | external
support_contact   TEXT
sunset_date       DATE
replaced_by       TEXT
tracking_only     BOOLEAN

-- Strategic-plan alignment (Migration 008, ADR 0002)
strategic_plan_alignment TEXT[]  -- Priority codes, e.g. {A.1, D.3}

-- ClickUp-synced narrative (Migration 011, ADR 0004)
status_summary        TEXT
status_summary_at     TIMESTAMPTZ
status_summary_source TEXT
      `}</pre>

      <InfoBox type="tip" title="Why no CHECK constraints on the enums">
        <code>status</code>, <code>visibility_tier</code>, and the alignment
        codes are all validated by typed TypeScript modules and by{" "}
        <code>npm run verify:portfolio</code> in CI, not by the database. That
        is deliberate — adding a lifecycle state should be a code change with a
        governance record (an ADR amendment plus a vocabulary registration),
        not a migration. See ADR 0001.
      </InfoBox>

      <h3>similarity_matches</h3>
      <p>Pre-computed overlap scores between submissions and registry applications.</p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
id               UUID PRIMARY KEY
submission_id    UUID FK → submissions
application_id   UUID FK → applications
score            REAL           -- 0.0 to 1.0
overlap_details  JSONB          -- Which dimensions overlap
created_at       TIMESTAMPTZ
UNIQUE(submission_id, application_id)
      `}</pre>

      <h3>submission_notes</h3>
      <p>Admin review notes attached to submissions.</p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
id               UUID PRIMARY KEY
submission_id    UUID FK → submissions
author           TEXT
content          TEXT
created_at       TIMESTAMPTZ
      `}</pre>

      <h3>blockers</h3>
      <p>
        The friction ledger — what is stalling a project, and who is named. One
        row per active blocker, categorised against the 14-category taxonomy in{" "}
        <code>lib/work.ts</code>.
      </p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
id               UUID PRIMARY KEY
application_id   UUID FK → applications ON DELETE CASCADE
category         TEXT           -- oit-review | unit-engagement |
                                -- legal-embargo | funding | ...14 total
named_party      TEXT           -- e.g. 'OIT', 'Unit X'
since            DATE           -- Drives the public day counter
public_text      TEXT           -- Safe for /portfolio
internal_text    TEXT           -- No surface reads this as of 2026-07-27
severity         TEXT           -- low | medium | high
resolved_at      DATE
      `}</pre>

      <h3>clickup_projects · clickup_status_updates · clickup_requests · clickup_sync_runs</h3>
      <p>
        Projection tables for the read-only ClickUp ingestion (ADR 0004,
        Migrations 010–011). These carry <strong>no foreign keys</strong> to{" "}
        <code>applications</code> — the seed script truncates that table with
        CASCADE, which would silently wipe synced data. Synced rows key on
        ClickUp ids and join to portfolio slugs at read time via{" "}
        <code>lib/clickup-map.ts</code>, so seed and sync are order-independent
        and each is individually idempotent.
      </p>
      <p>
        <code>clickup_sync_runs</code> records freshness so a surface can say
        how stale it is rather than implying it is live.
      </p>

      <h3>tech_requests + tech_request_events, tech_request_links, tech_request_project_links, roi_claims</h3>
      <p>
        The Unified Technology Request registry (ADR 0005 Phase 1, Migration
        018). One <code>tech_requests</code> row per request regardless of
        origin (<code>tdx</code> | <code>clickup</code> |{" "}
        <code>site-submission</code> | <code>direct</code>), with an append-only
        event trail, a request↔request and request↔project link graph, and an
        ROI claims ledger. Backs <code>/portfolio/pipeline</code>, the single
        all-origin request queue.
      </p>
      <p>
        Project links use <code>application_slug</code> as a soft key rather
        than a foreign key, for the same re-seed reason as the ClickUp tables.
      </p>

      <h3>agent_queries</h3>
      <p>
        Observability for the site assistant (ADR 0007, Migration 009). Every{" "}
        <code>POST /api/ask</code> is recorded — message, response, tools
        called, citation count, iterations, truncation, latency, outcome, HTTP
        status, model. Reviewable at <code>/internal/agent-log</code>.
      </p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
id               BIGSERIAL PRIMARY KEY
created_at       TIMESTAMPTZ
ip_hash          TEXT           -- SHA-256 of '<ip>:<AGENT_LOG_SALT>'.
                                -- Never the raw IP — no PII at rest.
audience         TEXT           -- CHECK (public | internal)
message          TEXT
response         TEXT           -- Null if the request errored early
tool_calls       TEXT[]         -- Names, in call order
citation_count   INTEGER
iterations       INTEGER
truncated        BOOLEAN
latency_ms       INTEGER
outcome          TEXT           -- ok | mindrouter_error | tool_error |
                                -- rate_limited | bad_request |
                                -- unconfigured | internal_error
http_status      INTEGER
model            TEXT
error_message    TEXT
      `}</pre>

      <h3>schema_migrations</h3>
      <p>
        Applied-migration ledger written by <code>scripts/migrate.ts</code>,
        which is the only thing that applies migrations. Piping a{" "}
        <code>.sql</code> file straight into <code>psql</code> changes the
        schema without recording it here, and the runner will later try to
        apply it again and fail — individual migration files are not reliably
        idempotent. Idempotency lives in the runner.
      </p>

      <h2>Indexes</h2>
      <p>
        Array columns on the <code>applications</code> table use <strong>GIN indexes</strong>
        for efficient overlap queries. This means PostgreSQL can quickly find all applications
        that share a data source or university system with a given submission — even with
        thousands of records.
      </p>

      <h2>Similarity Detection Engine</h2>
      <p>
        The similarity engine (<code>lib/similarity.ts</code>) computes a weighted score across
        8 dimensions using a Jaccard-like coefficient:
      </p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
Dimension            Weight    Method
─────────────────────────────────────
data_sources          25%     Jaccard (intersection / union)
university_systems    25%     Jaccard
sensitivity           15%     Jaccard
integrations          10%     Jaccard
output_types          10%     Jaccard
complexity             5%     Exact match (0 or 1)
userbase               5%     Exact match
auth_level             5%     Exact match
                     ─────
                     100%
      `}</pre>

      <InfoBox type="info" title="Why these weights?">
        Data sources and university systems carry 50% of the total weight because they are the
        strongest signal for application overlap. Two apps that both read from Banner Student
        are much more likely to be duplicates than two apps that both happen to use SSO.
      </InfoBox>

      <h2>Data Flow</h2>

      <h3>Submission Flow</h3>
      <ol>
        <li>User completes the Builder Guide wizard</li>
        <li>Client POSTs to <code>/api/submissions</code></li>
        <li>Server inserts into <code>submissions</code> + <code>submission_details</code></li>
        <li>Submission appears on the admin dashboard with status &ldquo;new&rdquo;</li>
      </ol>

      <h3>AI Analysis Flow</h3>
      <ol>
        <li>User clicks &ldquo;Analyze&rdquo; on the idea step</li>
        <li>Client POSTs idea text to <code>/api/ai/analyze-idea</code></li>
        <li>Server sends to MindRouter with structured JSON output mode</li>
        <li>LLM returns structured suggestions (sensitivity, systems, risks, etc.)</li>
        <li>Client displays analysis and offers &ldquo;Apply Suggestions&rdquo;</li>
      </ol>

      <h3>Promote Flow</h3>
      <ol>
        <li>Admin clicks &ldquo;Promote to Registry&rdquo; on a submission</li>
        <li>Server POSTs to <code>/api/submissions/[id]/promote</code></li>
        <li>New <code>applications</code> row created with all classification data</li>
        <li>Submission status set to &ldquo;in-progress&rdquo;</li>
        <li>Admin redirected to the new registry entry</li>
      </ol>

      <h3>Assistant Flow</h3>
      <ol>
        <li>User asks a question in the floating chat widget</li>
        <li>Client POSTs to <code>/api/ask</code>; rate limit checked per IP hash</li>
        <li>
          The agent loop (<code>lib/agent/loop.ts</code>) calls MindRouter with
          the message plus 25 read-only tool definitions
        </li>
        <li>
          Tools execute against site data and return a payload plus a{" "}
          <code>canonicalUrl</code>; the loop accumulates those as citations
        </li>
        <li>
          The model composes an answer, or refuses if no tool returned relevant
          data — see ADR 0007&apos;s strict-citation policy
        </li>
        <li>The turn is logged to <code>agent_queries</code></li>
      </ol>

      <h2>Project Structure</h2>
      <p>
        Abbreviated — see <code>CLAUDE.md</code> for the annotated tree, which
        is kept current as the normative reference.
      </p>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
app/
  layout.tsx              # Root layout: Sidebar + site-assistant widget
  page.tsx                # Landing — three-lane steering page
  portfolio/              # Projects inventory
    pipeline/             # Unified all-origin request queue (ADR 0005)
  builder-guide/          # Submit-a-Project assessment
  intake/[token]/         # Submitter-visible status page
  coordination/           # PROCESS surfaces (ADR 0006)
  standards/              # REFERENCE surfaces
    data-model/           # Data Governance Explorer
    strategic-plan/       # Strategic Plan Alignment Explorer + map
  reports/                # Reports surface
  about/, ai4ra-ecosystem/
  internal/               # Ops only — sync trigger, agent log
  admin/                  # Submissions + registry admin
  api/                    # See the API Reference page
  docs/                   # Documentation pages (you are here)
components/
  Sidebar.tsx             # Navigation sidebar
  SectionSubNav.tsx       # Shared sub-nav for Standards + Coordination
  PortfolioCard.tsx       # Project card
  PortfolioFilters.tsx    # Two-tier stage / status filter
  ProjectDetail.tsx       # Project detail composition
  ChatWidget.tsx          # Site assistant (ADR 0007)
  IssueCard.tsx           # GitHub issue card
  DocPage.tsx             # Documentation layout components
lib/
  portfolio.ts            # Projects inventory + lifecycle (typed)
  work.ts                 # Postgres read path for /portfolio
  utr.ts, requests.ts     # Request registry (ADR 0005)
  clickup*.ts             # ClickUp ingestion (ADR 0004)
  agent/                  # Site assistant — tools, loop, logging
  governance/             # UDM catalog modules (generated + curated)
  strategic-plan/         # Pillars + priorities (generated + curated)
  surveys/                # Operational Excellence survey
  standards-watch.ts      # Standards ledger entries
  builder-guide-data.ts   # Quiz steps, scoring, tiers
  similarity.ts           # Similarity detection engine
  github.ts               # GitHub Issues API
  mindrouter.ts           # MindRouter LLM client
  db.ts                   # PostgreSQL connection pool
db/
  migrations/             # SQL migrations (001-004; 005 in Sprint 2)
      `}</pre>
    </DocPage>
  );
}
