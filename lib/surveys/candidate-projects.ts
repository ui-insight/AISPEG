// ============================================================
// Candidate projects — the Operational Excellence survey's demand
// signal, ingested into a potential/requested-projects inventory.
// ============================================================
// Phase 2 of the survey ingest. Each candidate is a proposal derived
// from the survey, grounded in specific verbatims and cross-referenced
// against what the portfolio already runs, so we surface real gaps
// rather than duplicate existing work.
//
// These are proposals for the CADSO office and IIDS to triage — not
// commitments. No owners, dates, or ROI are asserted here; those are
// decided in intake, not inferred from a survey.
//
// Editorial note: the demand-to-project mapping is a judgment call.
// Edit this list as triage sharpens it. `relatedProjectSlugs` must
// match slugs in lib/portfolio.ts; `workCategory` must be a slug in
// lib/work-categories.ts (tsc enforces the latter).
// ============================================================

import type { CandidateProject } from "./types";

export const CANDIDATE_PROJECTS: CandidateProject[] = [
  {
    id: "reimbursement-status-tracker",
    title: "Reimbursement & payment status tracker",
    problem:
      "Travel and Accounts Payable reimbursements take weeks to months, and employees have no visibility into where a request is stuck or why — one respondent reported a 41-day Chrome River AP review and out-of-pocket bank fees.",
    shape:
      "A status view that shows an employee and approvers exactly where a reimbursement, invoice, or payment sits and what is blocking it — the same direct-register pattern already used for the intake status page, applied to finance workflows.",
    audiences: ["faculty"],
    clusters: [
      { audience: "faculty", cluster: "processes" },
      { audience: "faculty", cluster: "data-tools" },
    ],
    evidenceResponseIds: ["f19-processes", "f64-processes", "f93-processes", "f39-processes"],
    workCategory: "process",
    coverage: "partial",
    relatedProjectSlugs: ["invoice-processing"],
    note: "Invoice Processing already works the AP invoice side; the gap is the employee- and approver-facing status visibility.",
  },
  {
    id: "onboarding-access-automation",
    title: "Onboarding & access automation",
    problem:
      "New employee and TA onboarding — I-9 → EPAF → email → system access — is a multi-office, multi-day scavenger hunt that leaves new teaching staff without their systems until classes have already started.",
    shape:
      "A guided onboarding flow where approval of the I-9 automatically triggers the downstream steps (EPAF, email creation, Banner entry, Bridge/FERPA), with a checklist the new hire and their admin can both see.",
    audiences: ["faculty"],
    clusters: [{ audience: "faculty", cluster: "processes" }],
    evidenceResponseIds: ["f37-processes", "f3-processes", "f73-processes"],
    workCategory: "process",
    coverage: "gap",
  },
  {
    id: "policy-knowledge-search",
    title: "Institutional knowledge & policy search",
    problem:
      "The 2025 website/intranet migration broke findability: staff and students can't locate policies (APMs), forms, mileage rates, and how-tos that used to be a click away.",
    shape:
      "A retrieval-augmented search over policies, APMs, forms, and how-to documentation that answers a plain-language question with a cited source — the same pattern already proven on the Water Law Database.",
    audiences: ["faculty", "student"],
    clusters: [
      { audience: "faculty", cluster: "processes" },
      { audience: "faculty", cluster: "data-tools" },
      { audience: "student", cluster: "data-access" },
    ],
    evidenceResponseIds: ["f65-processes", "f22-processes", "f53-data-tools", "s44-data-access"],
    workCategory: "knowledge-retrieval",
    coverage: "partial",
    relatedProjectSlugs: ["water-law-database"],
    note: "The RAG retrieval pattern is proven on legal documents; applying it to institutional policy and how-to content is the open work.",
  },
  {
    id: "repetitive-query-assistant",
    title: "Repetitive-query response assistant",
    problem:
      "Front-line offices — financial aid especially — answer the same questions hundreds of times, while students cite slow email response as their top communication frustration.",
    shape:
      "An assistant that drafts a first response to high-volume, repetitive inbound questions for staff to review and send, cutting turnaround without removing the human. Runs on the existing MindRouter gateway.",
    audiences: ["faculty", "student"],
    clusters: [
      { audience: "faculty", cluster: "processes" },
      { audience: "student", cluster: "collaboration" },
    ],
    evidenceResponseIds: ["f56-processes", "s9-collaboration", "s7-collaboration"],
    workCategory: "knowledge-retrieval",
    coverage: "partial",
    relatedProjectSlugs: ["mindrouter"],
    note: "One financial-aid respondent proposed exactly this. MindRouter is the platform; the drafting assistant is the build.",
  },
  {
    id: "unit-budget-view",
    title: "Self-serve unit budget view",
    problem:
      "Directors and chairs can't see index/fund balances in real time and fall back on manually maintained spreadsheets; different tools give different numbers.",
    shape:
      "A self-serve dashboard showing current balances and transactions per index/fund — 'like looking at a bank account' — instead of days of human effort to assemble a picture.",
    audiences: ["faculty"],
    clusters: [
      { audience: "faculty", cluster: "data-tools" },
      { audience: "faculty", cluster: "processes" },
    ],
    evidenceResponseIds: ["f82-data-tools", "f88-data-tools", "f60-processes", "f21-processes"],
    workCategory: "executive-analytics",
    coverage: "partial",
    relatedProjectSlugs: ["audit-dashboard", "rfd-career", "oit-data-modernization"],
    note: "The dashboard pattern exists at the executive level; a unit-level, self-serve budget view is the gap, and overlaps the Huron data-modernization work.",
  },
  {
    id: "student-resource-navigator",
    title: "Student resource navigator",
    problem:
      "Students bounce across offices to answer simple questions and routinely find out about resources too late; many ask for a way to be pointed to the right place.",
    shape:
      "A secure, opt-in student assistant that routes a question to the right office or resource and answers routine 'how do I…' queries. Runs on MindRouter.",
    audiences: ["student"],
    clusters: [
      { audience: "student", cluster: "technology" },
      { audience: "student", cluster: "processes" },
      { audience: "student", cluster: "additional" },
    ],
    evidenceResponseIds: ["s53-technology", "s48-technology", "s16-additional", "s42-data-access"],
    workCategory: "knowledge-retrieval",
    coverage: "gap",
    relatedProjectSlugs: ["mindrouter"],
    note: "A vocal share of students are AI-skeptical; this must be opt-in, transparent about limits, and always offer a human path — or it will bounce the very audience it serves.",
  },
  {
    id: "grants-research-admin",
    title: "Grants & research-administration tooling",
    problem:
      "Grant submission through VERAS is duplicative (the same figures entered in multiple places) and contract approval runs long with PIs left out of the loop.",
    shape:
      "Not a new build — this demand is largely met by existing research-administration projects. The residual gap is VERAS data-entry duplication specifically.",
    audiences: ["faculty"],
    clusters: [
      { audience: "faculty", cluster: "processes" },
      { audience: "faculty", cluster: "data-tools" },
    ],
    evidenceResponseIds: ["f6-processes", "f32-processes", "f40-processes", "f92-data-tools"],
    workCategory: "research-admin",
    coverage: "covered",
    relatedProjectSlugs: ["openera", "vandalizer", "processmapping", "universo"],
    note: "OpenERA, Vandalizer, ProcessMapping, and UniVerso already address research-administration workload; surface them to this audience rather than starting over.",
  },
  {
    id: "sanctioned-ai-enablement",
    title: "Sanctioned AI access & literacy",
    problem:
      "Faculty and staff want approved AI tools and guidance on which are sanctioned; students are divided, with a pro camp asking for a secure, sanctioned option and AI literacy.",
    shape:
      "Not a new build — MindRouter is the sanctioned, on-prem AI gateway that answers the access question. The open work is enablement: publishing which tools are approved and how to use them well.",
    audiences: ["faculty", "student"],
    clusters: [
      { audience: "faculty", cluster: "data-tools" },
      { audience: "faculty", cluster: "additional" },
      { audience: "student", cluster: "technology" },
    ],
    evidenceResponseIds: ["f15-data-tools", "f9-data-tools", "f88-additional", "s48-technology"],
    workCategory: "ai-infrastructure",
    coverage: "covered",
    relatedProjectSlugs: ["mindrouter"],
    note: "The demand is met by MindRouter; the remaining gap is communication and AI literacy, not a platform.",
  },
];

// ── Ordering + accessors ─────────────────────────────────────

/** Gaps first (most actionable), then partial, then already-covered. */
const COVERAGE_ORDER: Record<CandidateProject["coverage"], number> = {
  gap: 0,
  partial: 1,
  covered: 2,
};

export function candidateProjectsByCoverage(): CandidateProject[] {
  return [...CANDIDATE_PROJECTS].sort(
    (a, b) => COVERAGE_ORDER[a.coverage] - COVERAGE_ORDER[b.coverage],
  );
}

/** Candidates whose evidence includes a given survey cluster. */
export function candidatesForCluster(
  audience: CandidateProject["audiences"][number],
  cluster: CandidateProject["clusters"][number]["cluster"],
): CandidateProject[] {
  return CANDIDATE_PROJECTS.filter((c) =>
    c.clusters.some((cl) => cl.audience === audience && cl.cluster === cluster),
  );
}

export const CANDIDATE_COVERAGE_LABEL: Record<
  CandidateProject["coverage"],
  string
> = {
  gap: "No current project",
  partial: "Partially covered",
  covered: "Already addressed",
};
