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
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Builder Guide │  │ Admin Pages  │  │ AI Chat Panel    │  │
│  │ (Wizard)      │  │ (Dashboard)  │  │ (MindRouter)     │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                        │
│  /api/submissions  /api/registry  /api/ai/analyze-idea      │
│  /api/.../notes    /api/.../similarity  /api/ai/refine      │
│  /api/.../promote                                           │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
             ▼                               ▼
┌────────────────────────┐    ┌──────────────────────────────┐
│     PostgreSQL 16      │    │   MindRouter (On-Prem LLM)   │
│  ┌──────────────────┐  │    │  OpenAI-compatible API        │
│  │ submissions      │  │    │  gpt-oss-120b model           │
│  │ submission_details│  │    │  https://mindrouter.uidaho.edu│
│  │ submission_notes  │  │    └──────────────────────────────┘
│  │ applications     │  │
│  │ similarity_matches│  │
│  └──────────────────┘  │
└────────────────────────┘
      `}</pre>

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
      `}</pre>

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

      <h2>Project Structure</h2>
      <pre className="not-prose rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{`
app/
  layout.tsx              # Root layout with Sidebar
  page.tsx                # Landing — four-card steering page
  portfolio/              # The Work — interventions inventory
  builder-guide/          # Submit-a-Project assessment
  reports/                # Reports surface
  standards/              # Standards ledger
  ai4ra-ecosystem/        # AI4RA partnership reference
  admin/
    submissions/          # Submission list + detail
    registry/             # App registry list + detail + new
  api/
    submissions/          # CRUD + notes + similarity + promote
    registry/             # CRUD
    ai/                   # analyze-idea + refine (MindRouter)
  docs/                   # Documentation pages (you are here)
components/
  Sidebar.tsx             # Navigation sidebar
  PortfolioCard.tsx       # Intervention card
  IssueCard.tsx           # GitHub issue card
  DocPage.tsx             # Documentation layout components
lib/
  portfolio.ts            # Interventions inventory (typed)
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
