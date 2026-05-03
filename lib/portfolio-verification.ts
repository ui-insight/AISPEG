// ============================================================
// Portfolio Verification — ADR 0001
// ============================================================
// Implements the measurable verification rules from
// docs/adr/0001-product-lifecycle-taxonomy.md.
//
// Each operational status has a measurable rule; this module checks each
// claim against its rule and returns a list of problems. CI runs
// `npm run verify:portfolio` to fail the build when a project's
// claimed status is inconsistent with its data.
//
// `lastCommitDate` for each repoUrl-bearing project is derived
// out-of-band by `scripts/refresh-commit-dates.ts` and committed to
// `lib/portfolio-meta.ts`. If portfolio-meta is stale or missing,
// commit-cadence rules degrade to a warning rather than a hard failure
// (see ADR — "skip gracefully").
// ============================================================

import type { Project, ProjectStatus } from "./portfolio";
import { portfolioMeta } from "./portfolio-meta";

export interface VerificationProblem {
  slug: string;
  claimedStatus: ProjectStatus;
  problem: string;
  rule: string;
  severity: "error" | "warning";
}

type Verifier = (i: Project) => VerificationProblem[];

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function daysSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function lastCommitDaysAgo(slug: string): number | null {
  const meta = portfolioMeta[slug];
  if (!meta?.lastCommitDate) return null;
  return daysSince(meta.lastCommitDate);
}

function hasPubliclyAccessibleArtifact(i: Project): boolean {
  // ADR sub-decision #4: production-grade accessibility is satisfied by
  // either a liveUrl OR a public repoUrl (the repo IS the deliverable
  // for infrastructure / scaffolds / self-hostable appliances).
  if (i.liveUrl && !i.liveUrlIsStaging) return true;
  if (i.repoUrl && !i.isPrivateRepo) return true;
  return false;
}

function problem(
  i: Project,
  rule: string,
  message: string,
  severity: "error" | "warning" = "error"
): VerificationProblem {
  return {
    slug: i.slug,
    claimedStatus: i.status,
    problem: message,
    rule,
    severity,
  };
}

// ────────────────────────────────────────────────────────────
// Per-status verifiers
// ────────────────────────────────────────────────────────────

const verifyIdea: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  const rule = "idea: no committed operationalOwner OR no committed iidsSponsor; repo empty or zero commits.";
  if (i.operationalOwners[0]?.name && i.iidsSponsor) {
    problems.push(
      problem(
        i,
        rule,
        "claims `idea` but has both an operationalOwner and an iidsSponsor — should be `approved` or further along the ladder."
      )
    );
  }
  if (i.liveUrl) {
    problems.push(problem(i, rule, "claims `idea` but has a liveUrl."));
  }
  return problems;
};

const verifyApproved: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  const rule = "approved: operationalOwner + iidsSponsor + non-empty description; no liveUrl; repo (if any) <10 commits or quiet 14d.";
  if (!i.operationalOwners[0]?.name) {
    problems.push(problem(i, rule, "claims `approved` but operationalOwners[0] is unset."));
  }
  if (!i.iidsSponsor) {
    problems.push(problem(i, rule, "claims `approved` but iidsSponsor is unset."));
  }
  if (!i.description) {
    problems.push(problem(i, rule, "claims `approved` but description is empty."));
  }
  if (i.liveUrl) {
    problems.push(problem(i, rule, "claims `approved` but has a liveUrl — should be `building` or further."));
  }
  return problems;
};

const verifyBuilding: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  const rule = "building: repoUrl set; lastCommitDate within 60d; no liveUrl (or liveUrlIsStaging); pilotCohort empty.";
  if (!i.repoUrl) {
    problems.push(problem(i, rule, "claims `building` but has no repoUrl."));
  }
  if (i.liveUrl && !i.liveUrlIsStaging) {
    problems.push(
      problem(
        i,
        rule,
        "claims `building` but has a non-staging liveUrl — set liveUrlIsStaging:true, or move to `prototype`/`piloting`/`production`."
      )
    );
  }
  if (i.pilotCohort) {
    problems.push(problem(i, rule, "claims `building` but has a pilotCohort — should be `piloting`."));
  }
  const days = lastCommitDaysAgo(i.slug);
  if (days === null) {
    if (i.repoUrl) {
      problems.push(
        problem(
          i,
          rule,
          "lastCommitDate unknown (portfolio-meta stale or missing) — cannot verify 60-day cadence.",
          "warning"
        )
      );
    }
  } else if (days > 60) {
    problems.push(
      problem(
        i,
        rule,
        `claims \`building\` but last commit on main was ${days} days ago (>60d) — likely \`prototype\` now.`
      )
    );
  }
  return problems;
};

const verifyPrototype: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  const rule = "prototype: pilotCohort empty; lastCommitDate >30d OR featureComplete:true.";
  if (i.pilotCohort) {
    problems.push(problem(i, rule, "claims `prototype` but has a pilotCohort — should be `piloting`."));
  }
  if (i.featureComplete === true) return problems; // satisfied
  const days = lastCommitDaysAgo(i.slug);
  if (days === null) {
    problems.push(
      problem(
        i,
        rule,
        "neither featureComplete:true nor a known lastCommitDate — cannot verify the prototype rule.",
        "warning"
      )
    );
  } else if (days <= 30) {
    problems.push(
      problem(
        i,
        rule,
        `claims \`prototype\` with featureComplete:false and last commit ${days} days ago (<=30d) — should be \`building\`.`
      )
    );
  }
  return problems;
};

const verifyPiloting: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  const rule = "piloting: liveUrl accessible to a named cohort; pilotCohort.size > 0 with bounded scope.";
  if (!i.liveUrl) {
    problems.push(problem(i, rule, "claims `piloting` but has no liveUrl — pilots need an accessible artifact for the cohort."));
  }
  if (!i.pilotCohort) {
    problems.push(problem(i, rule, "claims `piloting` but has no pilotCohort."));
  } else {
    if (i.pilotCohort.size <= 0) {
      problems.push(problem(i, rule, "pilotCohort.size must be > 0."));
    }
    if (!i.pilotCohort.scope) {
      problems.push(problem(i, rule, "pilotCohort.scope must be a non-empty bounded descriptor."));
    }
  }
  return problems;
};

const verifyProduction: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  const rule = "production: liveUrl OR public repoUrl (the repo as artifact); productionScope set; supportContact set.";
  if (!hasPubliclyAccessibleArtifact(i)) {
    problems.push(
      problem(
        i,
        rule,
        "claims `production` but has no publicly-accessible artifact — needs a liveUrl, or a public repoUrl (with isPrivateRepo unset/false) for repo-as-artifact deliverables."
      )
    );
  }
  if (!i.productionScope) {
    problems.push(problem(i, rule, "claims `production` but productionScope is unset."));
  }
  if (!i.supportContact) {
    problems.push(problem(i, rule, "claims `production` but supportContact is unset."));
  }
  return problems;
};

const verifyMaintained: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  const rule = "maintained: production accessibility (liveUrl or public repo); no commits to main in last 90d.";
  if (!hasPubliclyAccessibleArtifact(i)) {
    problems.push(problem(i, rule, "claims `maintained` but has no publicly-accessible artifact (liveUrl or public repoUrl)."));
  }
  if (!i.productionScope) {
    problems.push(problem(i, rule, "claims `maintained` but productionScope is unset (inherited from `production`)."));
  }
  if (!i.supportContact) {
    problems.push(problem(i, rule, "claims `maintained` but supportContact is unset (inherited from `production`)."));
  }
  const days = lastCommitDaysAgo(i.slug);
  if (days === null) {
    if (i.repoUrl) {
      problems.push(problem(i, rule, "lastCommitDate unknown — cannot verify 90-day quiet rule.", "warning"));
    }
  } else if (days < 90) {
    problems.push(
      problem(
        i,
        rule,
        `claims \`maintained\` but last commit on main was ${days} days ago (<90d) — should be \`production\`.`
      )
    );
  }
  return problems;
};

const verifySunsetting: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  const rule = "sunsetting: sunsetDate (ISO) set; replacedBy (slug or 'manual-process') set.";
  if (!i.sunsetDate) {
    problems.push(problem(i, rule, "claims `sunsetting` but sunsetDate is unset."));
  }
  if (!i.replacedBy) {
    problems.push(problem(i, rule, "claims `sunsetting` but replacedBy is unset."));
  }
  return problems;
};

const verifyArchived: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  // The ADR rule asks for liveUrl 404 / repo archived. Both checks need
  // a network round-trip; the verifier can't currently confirm either.
  // We do basic sanity: archived rows shouldn't claim a productionScope
  // or active pilotCohort, and shouldn't have a fresh commit date.
  const rule = "archived: liveUrl unreachable / repo archived; service stopped.";
  if (i.pilotCohort) {
    problems.push(problem(i, rule, "claims `archived` but still has an active pilotCohort."));
  }
  const days = lastCommitDaysAgo(i.slug);
  if (days !== null && days < 30) {
    problems.push(
      problem(
        i,
        rule,
        `claims \`archived\` but committed to main ${days} days ago — service does not appear stopped.`
      )
    );
  }
  return problems;
};

const verifyTracked: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  const rule = "tracked: trackingOnly:true; bypasses the operational ladder.";
  if (!i.trackingOnly) {
    problems.push(problem(i, rule, "claims `tracked` but trackingOnly is not true."));
  }
  return problems;
};

// ────────────────────────────────────────────────────────────
// Universal checks (apply to every status)
// ────────────────────────────────────────────────────────────

const verifyUniversal: Verifier = (i) => {
  const problems: VerificationProblem[] = [];
  if (!i.iidsSponsor) {
    problems.push(
      problem(
        i,
        "every project requires an iidsSponsor",
        "iidsSponsor is empty — every entry needs a named IIDS sponsor (the person at IIDS who owns awareness of this project)."
      )
    );
  }
  return problems;
};

const verifiers: Record<ProjectStatus, Verifier> = {
  idea: verifyIdea,
  approved: verifyApproved,
  building: verifyBuilding,
  prototype: verifyPrototype,
  piloting: verifyPiloting,
  production: verifyProduction,
  maintained: verifyMaintained,
  sunsetting: verifySunsetting,
  archived: verifyArchived,
  tracked: verifyTracked,
};

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

export function verifyProject(i: Project): VerificationProblem[] {
  return [...verifyUniversal(i), ...verifiers[i.status](i)];
}

export function verifyAll(projects: Project[]): VerificationProblem[] {
  return projects.flatMap(verifyProject);
}
