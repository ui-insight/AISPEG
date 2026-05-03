// scripts/seed-portfolio.ts
//
// Ports the typed `interventions` array from lib/portfolio.ts into the
// `applications` table, and auto-derives initial blocker rows from the
// existing portfolio metadata.
//
// Idempotent: TRUNCATEs applications + blockers (CASCADE) and reseeds.
// Safe to re-run during the Sprint 2 → Sprint 3 transition while
// lib/portfolio.ts is still the source of truth. Once ClickUp wiring
// lands in Sprint 3, this script becomes a one-time tool and lib/portfolio.ts
// retires.
//
// Auto-derived blockers (low-fidelity, placeholder until Colin's ClickUp
// data is the source):
//   - visibility:"Partial"           → "legal-embargo" blocker
//   - institutionalReviewStatus:     → "oit-review" blocker
//     "Under OIT review"
//
// Usage:
//   npm run seed:portfolio

import { Pool } from "pg";
import {
  interventions,
  type Intervention,
  type Visibility,
} from "../lib/portfolio.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Set it in .env.local or the environment.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

// Placeholder date for auto-derived blockers. The portfolio doesn't carry
// per-blocker dates yet; refine entries individually in Sprint 3 via
// ClickUp wiring or by editing the rows in the DB directly.
const PLACEHOLDER_BLOCKER_SINCE = "2026-03-01";

// ────────────────────────────────────────────────────────────────────
// Wizard-shape enrichment
// ────────────────────────────────────────────────────────────────────
//
// lib/portfolio.ts doesn't carry the wizard's classification dimensions
// (sensitivity, data_sources, integrations, university_systems,
// output_types, complexity, userbase, auth_level). The applications
// table needs them populated for the similarity engine to find matches
// when a Submit-a-Project assessment runs.
//
// This is a best-guess heuristic mapping per slug, using exactly the
// label vocabulary from lib/builder-guide-data.ts. Refine the mapping
// here when an entry is misclassified, or hand-edit the row in the DB.
// Sprint 3+ ClickUp wiring becomes the canonical source.

interface WizardShape {
  sensitivity: string[];
  complexity: string | null;
  userbase: string | null;
  auth_level: string | null;
  integrations: string[];
  data_sources: string[];
  university_systems: string[];
  output_types: string[];
}

const wizardShapeBySlug: Record<string, WizardShape> = {
  stratplan: {
    sensitivity: ["No sensitive data"],
    complexity: "Multiple data sources",
    userbase: "University-wide",
    auth_level: "Role-based access",
    integrations: ["University APIs", "AI / LLM integration"],
    data_sources: ["Custom / internal APIs", "Flat files / spreadsheets"],
    university_systems: ["CAS / SSO"],
    output_types: ["Read-only reporting"],
  },
  "audit-dashboard": {
    sensitivity: ["PII", "Financial data"],
    complexity: "Multiple data sources",
    userbase: "My department",
    auth_level: "Role-based access",
    integrations: ["AI / LLM integration", "File storage"],
    data_sources: ["Flat files / spreadsheets", "Custom / internal APIs"],
    university_systems: ["CAS / SSO"],
    output_types: ["Creates / modifies records", "Generates documents"],
  },
  "ucm-daily-register": {
    sensitivity: ["No sensitive data"],
    complexity: "Multiple data sources",
    userbase: "University-wide",
    auth_level: "University SSO",
    integrations: ["External SaaS APIs", "AI / LLM integration", "Email / notifications"],
    data_sources: ["Custom / internal APIs", "Flat files / spreadsheets"],
    university_systems: ["CAS / SSO"],
    output_types: ["Generates documents", "Sends notifications"],
  },
  "embargoed-osp": {
    sensitivity: ["Research / IRB", "PII"],
    complexity: "Complex pipelines",
    userbase: "My department",
    auth_level: "Role-based access",
    integrations: ["External SaaS APIs", "University APIs"],
    data_sources: ["Custom / internal APIs"],
    university_systems: ["CAS / SSO"],
    output_types: ["Creates / modifies records"],
  },
  vandalizer: {
    sensitivity: ["No sensitive data"],
    complexity: "Simple CRUD",
    userbase: "University-wide",
    auth_level: "University SSO",
    integrations: ["AI / LLM integration"],
    data_sources: ["Flat files / spreadsheets"],
    university_systems: ["CAS / SSO"],
    output_types: ["Generates documents"],
  },
  processmapping: {
    sensitivity: ["No sensitive data"],
    complexity: "Multiple data sources",
    userbase: "University-wide",
    auth_level: "University SSO",
    integrations: ["University APIs", "AI / LLM integration"],
    data_sources: ["Custom / internal APIs"],
    university_systems: ["CAS / SSO"],
    output_types: ["Creates / modifies records", "Read-only reporting"],
  },
  execord: {
    sensitivity: ["PII"],
    complexity: "Multiple data sources",
    userbase: "My department",
    auth_level: "Role-based access",
    integrations: ["AI / LLM integration", "Email / notifications"],
    data_sources: ["Custom / internal APIs", "Flat files / spreadsheets"],
    university_systems: ["CAS / SSO"],
    output_types: ["Creates / modifies records", "Triggers workflows"],
  },
  "sem-experiential": {
    sensitivity: ["FERPA", "PII"],
    complexity: "Simple CRUD",
    userbase: "College-wide",
    auth_level: "Role-based access",
    integrations: ["University APIs"],
    data_sources: ["Banner / SIS", "Custom / internal APIs"],
    university_systems: ["Banner Student", "CAS / SSO"],
    output_types: ["Creates / modifies records", "Read-only reporting"],
  },
  "rfd-career": {
    sensitivity: ["FERPA", "PII"],
    complexity: "Multiple data sources",
    userbase: "My department",
    auth_level: "Role-based access",
    integrations: ["University APIs"],
    data_sources: ["Banner / SIS", "Custom / internal APIs"],
    university_systems: ["Banner Student", "CAS / SSO"],
    output_types: ["Read-only reporting", "Generates documents"],
  },
  mindrouter: {
    sensitivity: ["No sensitive data"],
    complexity: "Real-time / streaming",
    userbase: "University-wide",
    auth_level: "Role-based access",
    integrations: ["AI / LLM integration"],
    data_sources: ["Custom / internal APIs"],
    university_systems: ["CAS / SSO"],
    output_types: ["Exposes an API"],
  },
  "dgx-stack": {
    sensitivity: ["No sensitive data"],
    complexity: "Real-time / streaming",
    userbase: "University-wide",
    auth_level: "Role-based access",
    integrations: ["AI / LLM integration"],
    data_sources: ["None / generates its own data"],
    university_systems: ["CAS / SSO"],
    output_types: ["Exposes an API"],
  },
  "template-app": {
    sensitivity: ["No sensitive data"],
    complexity: "Static content",
    userbase: "Just me / my team",
    auth_level: "University SSO",
    integrations: ["None / standalone"],
    data_sources: ["None / generates its own data"],
    university_systems: [],
    output_types: ["Read-only reporting"],
  },
  "oit-data-modernization": {
    sensitivity: ["FERPA", "PII", "Financial data"],
    complexity: "Complex pipelines",
    userbase: "University-wide",
    auth_level: "Role-based access",
    integrations: ["University APIs"],
    data_sources: ["Banner / SIS", "Custom / internal APIs"],
    university_systems: ["Banner Student", "Banner Finance", "Banner HR"],
    output_types: ["Read-only reporting"],
  },
  nexus: {
    sensitivity: ["FERPA", "PII"],
    complexity: "Multiple data sources",
    userbase: "University-wide",
    auth_level: "Role-based access",
    integrations: ["University APIs", "AI / LLM integration"],
    data_sources: ["Banner / SIS", "Custom / internal APIs"],
    university_systems: ["Banner Student", "VandalWeb", "CAS / SSO"],
    output_types: ["Read-only reporting", "Creates / modifies records"],
  },
};

// Default for slugs not in the map — leaves wizard fields empty so
// similarity simply returns no match for them.
const EMPTY_SHAPE: WizardShape = {
  sensitivity: [],
  complexity: null,
  userbase: null,
  auth_level: null,
  integrations: [],
  data_sources: [],
  university_systems: [],
  output_types: [],
};

function visibilityTier(v: Visibility): "public" | "embargoed" | "internal" {
  switch (v) {
    case "Public":
      return "public";
    case "Partial":
      return "embargoed";
    case "Internal-only":
      return "internal";
  }
}

// Portfolio entries don't carry a tier; default to 2 (Standard Web App)
// which fits most IIDS-built interventions. Tracked entries get tier 1.
function inferTier(i: Intervention): number {
  if (i.trackingOnly) return 1;
  return 2;
}

interface BlockerSeed {
  category: string;
  named_party: string | null;
  since: string;
  public_text: string | null;
  internal_text: string | null;
  severity: "low" | "medium" | "high";
}

function deriveBlockers(i: Intervention): BlockerSeed[] {
  const blockers: BlockerSeed[] = [];

  if (i.visibility === "Partial") {
    blockers.push({
      category: "legal-embargo",
      named_party: null,
      since: PLACEHOLDER_BLOCKER_SINCE,
      public_text:
        "Deployment details (pilot scope, timelines, configuration) held back from the public site.",
      internal_text:
        "Auto-seeded from visibility:Partial during the Sprint 2 portfolio import. Refine with the actual embargo source (vendor terms, legal review, partner request) and the date the embargo took effect.",
      severity: "medium",
    });
  }

  if (i.institutionalReviewStatus === "Under OIT review") {
    blockers.push({
      category: "oit-review",
      named_party: "OIT",
      since: PLACEHOLDER_BLOCKER_SINCE,
      public_text:
        "Awaiting OIT institutional review.",
      internal_text:
        "Auto-seeded from institutionalReviewStatus:'Under OIT review'. Refine with the actual submission date, the named OIT contact, and any blocker-specific detail (security review, integration review, etc.).",
      severity: "medium",
    });
  }

  return blockers;
}

async function seedIntervention(i: Intervention): Promise<{ id: string; blockers: number }> {
  const tier = inferTier(i);
  const visibility_tier = visibilityTier(i.visibility);
  const home_unit_primary = i.homeUnits[0] ?? null;
  const owner_primary = i.operationalOwners[0] ?? null;
  const wizard = wizardShapeBySlug[i.slug] ?? EMPTY_SHAPE;

  const insert = await pool.query<{ id: string }>(
    `INSERT INTO applications (
       slug, name, tagline, description,
       owner_name, department,
       home_units, operational_owners, build_participants, tags,
       tier, status, visibility_tier,
       ai4ra_relationship, dual_destiny_planned, external_deployments,
       institutional_review_status,
       repo_url, docs_url, live_url, is_private_repo,
       funding,
       operational_function, operational_excellence_outcome,
       features, tech,
       tracking_only, related_slugs,
       sensitivity, complexity, userbase, auth_level,
       integrations, data_sources, university_systems, output_types,
       work_categories
     )
     VALUES (
       $1, $2, $3, $4,
       $5, $6,
       $7, $8::jsonb, $9, $10,
       $11, $12, $13,
       $14, $15, $16,
       $17,
       $18, $19, $20, $21,
       $22,
       $23, $24,
       $25, $26,
       $27, $28,
       $29, $30, $31, $32,
       $33, $34, $35, $36,
       $37
     )
     RETURNING id`,
    [
      i.slug,
      i.name,
      i.tagline,
      i.description,
      owner_primary?.name ?? null,
      home_unit_primary, // legacy `department` column populated for backward compat
      i.homeUnits,
      JSON.stringify(i.operationalOwners),
      i.buildParticipants,
      i.tags ?? [],
      tier,
      i.status,
      visibility_tier,
      i.ai4raRelationship,
      i.dualDestinyPlanned ?? false,
      i.externalDeployments ?? [],
      i.institutionalReviewStatus ?? null,
      i.repoUrl ?? null,
      i.docsUrl ?? null,
      i.liveUrl ?? null,
      i.isPrivateRepo ?? false,
      i.funding ?? null,
      i.operationalFunction,
      i.operationalExcellenceOutcome,
      i.features ?? [],
      i.tech ?? [],
      i.trackingOnly ?? false,
      i.relatedSlugs ?? [],
      wizard.sensitivity,
      wizard.complexity,
      wizard.userbase,
      wizard.auth_level,
      wizard.integrations,
      wizard.data_sources,
      wizard.university_systems,
      wizard.output_types,
      i.workCategories ?? [],
    ]
  );

  const applicationId = insert.rows[0]!.id;

  const blockers = deriveBlockers(i);
  for (const b of blockers) {
    await pool.query(
      `INSERT INTO blockers (
         application_id, category, named_party, since,
         public_text, internal_text, severity
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [applicationId, b.category, b.named_party, b.since, b.public_text, b.internal_text, b.severity]
    );
  }

  return { id: applicationId, blockers: blockers.length };
}

async function main(): Promise<void> {
  console.log(
    `Connecting to ${databaseUrl?.replace(/\/\/[^@]+@/, "//***@")}`
  );
  console.log(`Seeding ${interventions.length} interventions from lib/portfolio.ts ...\n`);

  // TRUNCATE in a transaction. CASCADE drops dependent blockers automatically;
  // similarity_matches FK uses ON DELETE CASCADE so those go too. Submissions
  // have submission_id ON DELETE SET NULL, so they survive.
  await pool.query("BEGIN");
  try {
    await pool.query("TRUNCATE TABLE applications RESTART IDENTITY CASCADE");

    let totalBlockers = 0;
    for (const i of interventions) {
      const result = await seedIntervention(i);
      const blockerNote = result.blockers > 0 ? ` [+${result.blockers} blocker${result.blockers > 1 ? "s" : ""}]` : "";
      console.log(`  ↳ ${i.slug.padEnd(30)} ${i.name}${blockerNote}`);
      totalBlockers += result.blockers;
    }

    await pool.query("COMMIT");
    console.log(
      `\nSeeded ${interventions.length} interventions and ${totalBlockers} auto-derived blocker(s).`
    );
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
