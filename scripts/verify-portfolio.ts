// scripts/verify-portfolio.ts
//
// Runs the lifecycle-taxonomy verifier (lib/portfolio-verification.ts)
// against the publicly-visible interventions and exits non-zero with a
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

import { interventions } from "../lib/portfolio.js";
import { verifyAll, type VerificationProblem } from "../lib/portfolio-verification.js";

function format(p: VerificationProblem): string {
  const tag = p.severity === "error" ? "ERROR " : "WARN  ";
  return `  [${tag}] ${p.slug.padEnd(28)} (${p.claimedStatus})\n           ${p.problem}\n           rule: ${p.rule}`;
}

function main(): void {
  const all = verifyAll(interventions);
  const errors = all.filter((p) => p.severity === "error");
  const warnings = all.filter((p) => p.severity === "warning");

  console.log(`Verifying ${interventions.length} interventions against ADR 0001 rules ...\n`);

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
    `Verification PASSED — ${interventions.length} interventions, 0 errors, ${warnings.length} warning(s).`
  );
}

main();
