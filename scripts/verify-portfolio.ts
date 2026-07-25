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

import { projects } from "../lib/portfolio.js";
import { verifyAll, type VerificationProblem } from "../lib/portfolio-verification.js";
import { priorities } from "../lib/strategic-plan/catalog.js";
import { OIT_EA_PROJECTS } from "../lib/oit-ea-portfolio.js";

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

function main(): void {
  const lifecycleProblems = verifyAll(projects);
  const stratPlanProblems = verifyStrategicPlanAlignment();
  const oitCrosswalkProblems = verifyOitCrosswalk();
  const all = [
    ...lifecycleProblems,
    ...stratPlanProblems,
    ...oitCrosswalkProblems,
  ];
  const errors = all.filter((p) => p.severity === "error");
  const warnings = all.filter((p) => p.severity === "warning");

  console.log(
    `Verifying ${projects.length} projects against ADR 0001 rules, strategic-plan alignment, and the OIT FY2027 crosswalk ...\n`
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
