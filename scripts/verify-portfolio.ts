// scripts/verify-portfolio.ts
//
// Runs the lifecycle-taxonomy verifier (lib/portfolio-verification.ts)
// against the publicly-visible projects and exits non-zero with a
// formatted report if any errors are found.
//
// Warnings (e.g. "lastCommitDate unknown — cannot verify cadence") do
// NOT fail the build — they're surfaced for awareness so a stale
// portfolio-meta doesn't gate CI.
//
// Usage:
//   npm run verify:portfolio
//
// CI:
//   wired into .github/workflows/ci.yml as a separate job.

import {
  projects,
  OPERATIONAL_LABEL,
  PUBLIC_STAGE_LABEL,
} from "../lib/portfolio.js";
import { verifyAll, type VerificationProblem } from "../lib/portfolio-verification.js";
import { priorities } from "../lib/strategic-plan/catalog.js";
import { OIT_EA_PROJECTS } from "../lib/oit-ea-portfolio.js";
import { vocabularyGroups } from "../lib/governance/vocabularies.js";

function format(p: VerificationProblem): string {
  const tag = p.severity === "error" ? "ERROR " : "WARN  ";
  return `  [${tag}] ${p.slug.padEnd(28)} (${p.claimedStatus})\n           ${p.problem}\n           rule: ${p.rule}`;
}

function verifyStrategicPlanAlignment(): VerificationProblem[] {
  const validCodes = new Set(priorities.map((p) => p.code));
  const problems: VerificationProblem[] = [];
  for (const i of projects) {
    const codes = i.strategicPlanAlignment ?? [];
    for (const code of codes) {
      if (!validCodes.has(code)) {
        problems.push({
          slug: i.slug,
          claimedStatus: i.status,
          problem: `unknown strategic-plan priority code "${code}" — not present in lib/strategic-plan/catalog.ts`,
          rule: "strategic-plan-alignment",
          severity: "error",
        });
      }
    }
  }
  return problems;
}

// The crosswalk in lib/oit-ea-portfolio.ts is the one seam between OIT's
// FY2027 inventory and ours. A `portfolioSlug` that no longer resolves —
// or a claimed match with no stated basis — is drift, not a match.
function verifyOitCrosswalk(): VerificationProblem[] {
  const validSlugs = new Set(projects.map((p) => p.slug));
  const problems: VerificationProblem[] = [];
  for (const row of OIT_EA_PROJECTS) {
    if (row.portfolioSlug === undefined) continue;
    if (!validSlugs.has(row.portfolioSlug)) {
      problems.push({
        slug: row.portfolioSlug,
        claimedStatus: "tracked",
        problem: `OIT crosswalk row "${row.name}" points at slug "${row.portfolioSlug}", which is not present in lib/portfolio.ts`,
        rule: "oit-crosswalk",
        severity: "error",
      });
    }
    if (!row.crosswalkConfidence || !row.crosswalkNote) {
      problems.push({
        slug: row.portfolioSlug,
        claimedStatus: "tracked",
        problem: `OIT crosswalk row "${row.name}" claims a match without both crosswalkConfidence and crosswalkNote`,
        rule: "oit-crosswalk",
        severity: "error",
      });
    }
  }
  return problems;
}

// The `iids-portfolio` domain in vendor/data-governance registers this
// site's own taxonomies (ADR 0001, "Governance registration shape"). That
// registration is only worth anything if it matches the union it claims to
// describe — and nothing else checks it: the Governance Drift workflow
// validates the vendored registry's internal consistency and its remote
// repo canaries, and it doesn't run on lib/portfolio.ts at all.
//
// That gap was not hypothetical. ADR 0001's 2026-07-24 amendment added
// `scoping` and named "add it upstream" as a follow-up; the follow-up was
// missed, a project shipped claiming `scoping`, and the vocabulary went
// three days without the code while every check stayed green. A July 2026
// documentation audit found it by hand. This function is what should have
// found it.
//
// Both directions are errors. A value in the union but not the vocabulary
// means the registry is lying about what statuses exist; a value in the
// vocabulary but not the union means a code was retired without being
// deregistered, and a stakeholder reading the Data Model explorer sees a
// state the site can no longer produce.
function verifyGovernanceVocabularyParity(): VerificationProblem[] {
  const problems: VerificationProblem[] = [];

  const pairs: {
    group: string;
    // Keys of an exhaustive Record<Union, string>, so tsc guarantees this
    // is the whole union — no second list to keep in sync here.
    union: string[];
  }[] = [
    { group: "ProjectStatus", union: Object.keys(OPERATIONAL_LABEL) },
    { group: "PublicStage", union: Object.keys(PUBLIC_STAGE_LABEL) },
  ];

  for (const { group, union } of pairs) {
    const registered = vocabularyGroups.find(
      (g) => g.domain === "iids-portfolio" && g.group === group
    );

    if (!registered) {
      problems.push({
        slug: `iids-portfolio/${group}`,
        claimedStatus: "tracked",
        problem: `no "${group}" vocabulary group registered under the iids-portfolio domain — expected one per ADR 0001. Did the submodule bump drop it, or was build:governance not re-run?`,
        rule: "governance-vocab-parity",
        severity: "error",
      });
      continue;
    }

    const codes = new Set(registered.values.map((v) => v.code));
    const unionSet = new Set(union);

    for (const value of union) {
      if (!codes.has(value)) {
        problems.push({
          slug: `iids-portfolio/${group}`,
          claimedStatus: "tracked",
          problem: `"${value}" is in the ${group} union in lib/portfolio.ts but not registered in the vendored vocabulary. Add it upstream in ui-insight/data-governance (vocabularies/iids-portfolio/allowed_values.json), bump the submodule, then re-run npm run build:governance.`,
          rule: "governance-vocab-parity",
          severity: "error",
        });
      }
    }

    for (const code of codes) {
      if (!unionSet.has(code)) {
        problems.push({
          slug: `iids-portfolio/${group}`,
          claimedStatus: "tracked",
          problem: `"${code}" is registered in the vendored ${group} vocabulary but is not a member of the union in lib/portfolio.ts. Either the code was retired without deregistering it upstream, or the submodule is ahead of this repo.`,
          rule: "governance-vocab-parity",
          severity: "error",
        });
      }
    }
  }

  return problems;
}

function main(): void {
  const lifecycleProblems = verifyAll(projects);
  const stratPlanProblems = verifyStrategicPlanAlignment();
  const oitCrosswalkProblems = verifyOitCrosswalk();
  const vocabParityProblems = verifyGovernanceVocabularyParity();
  const all = [
    ...lifecycleProblems,
    ...stratPlanProblems,
    ...oitCrosswalkProblems,
    ...vocabParityProblems,
  ];
  const errors = all.filter((p) => p.severity === "error");
  const warnings = all.filter((p) => p.severity === "warning");

  console.log(
    `Verifying ${projects.length} projects against ADR 0001 rules, strategic-plan alignment, the OIT FY2027 crosswalk, and iids-portfolio vocabulary parity ...\n`
  );

  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`);
    for (const w of warnings) console.log(format(w));
    console.log();
  }

  if (errors.length > 0) {
    console.log(`Errors (${errors.length}):`);
    for (const e of errors) console.log(format(e));
    console.log(`\nVerification FAILED. Fix the data in lib/portfolio.ts (or refine the rule in lib/portfolio-verification.ts + the ADR).`);
    process.exit(1);
  }

  console.log(
    `Verification PASSED — ${projects.length} projects, 0 errors, ${warnings.length} warning(s).`
  );
}

main();
