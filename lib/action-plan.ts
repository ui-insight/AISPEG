export interface ActionPlanIssueRef {
  number: number;
  title: string;
}

export interface ActionPlanMilestone {
  title: string;
  window: string;
  description: string;
  issueNumbers: number[];
}

export interface ActionPlanWorkstream {
  name: string;
  ownerRole: string;
  goal: string;
  epic: ActionPlanIssueRef;
  existingIssues: ActionPlanIssueRef[];
  executionIssues: ActionPlanIssueRef[];
}

export const actionPlanTracker: ActionPlanIssueRef = {
  number: 18,
  title: "[Action Plan] OIT March 2026 AI Next Steps Execution Plan",
};

export const actionPlanMilestones: ActionPlanMilestone[] = [
  {
    title: "2026 Action Plan",
    window: "Annual",
    description:
      "Umbrella milestone for the action-plan tracker and the five major execution epics.",
    issueNumbers: [18, 19, 20, 21, 22, 23],
  },
  {
    title: "2026 Q2 - Foundation Decisions",
    window: "Q2 2026",
    description:
      "Architecture, governance, and operating decisions needed before broader rollout.",
    issueNumbers: [1, 2, 14, 26, 27, 29, 30, 32],
  },
  {
    title: "2026 Q3 - Controls and Standards",
    window: "Q3 2026",
    description:
      "Controls, standards, documentation, and synthesis work needed for repeatable delivery.",
    issueNumbers: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 24, 25, 31, 33, 35, 36, 37],
  },
  {
    title: "2026 Q4 - Modernization and Scale",
    window: "Q4 2026",
    description:
      "Modernization, product-team execution, and scale-out work planned for the end of 2026.",
    issueNumbers: [3, 28, 34, 38, 39, 40],
  },
];

export const actionPlanWorkstreams: ActionPlanWorkstream[] = [
  {
    name: "Architecture",
    ownerRole: "Architecture / Infrastructure Lead",
    goal:
      "Define the single enterprise AI architecture, operating model, and platform capacity required to support institutional delivery.",
    epic: {
      number: 23,
      title: "[Architecture] Single enterprise AI architecture and infrastructure",
    },
    existingIssues: [
      {
        number: 14,
        title: "Establish governance-ready database for documents and structured data",
      },
    ],
    executionIssues: [
      {
        number: 30,
        title: "[Architecture] Approve canonical enterprise AI reference architecture",
      },
      {
        number: 29,
        title:
          "[Architecture] Define on-prem and cloud AI infrastructure operating model and security boundaries",
      },
      {
        number: 28,
        title: "[Architecture] Publish institutional data lake adoption roadmap",
      },
      {
        number: 26,
        title:
          "[Architecture] Produce 2026-2027 GPU, compute, storage, and network capacity roadmap",
      },
    ],
  },
  {
    name: "Governance",
    ownerRole: "Governance Lead with OIT/Security",
    goal:
      "Make approved tooling, repository controls, exception handling, and compliance monitoring explicit and reviewable.",
    epic: {
      number: 22,
      title: "[Governance] Controlled tooling, repositories, and development policy",
    },
    existingIssues: [
      {
        number: 1,
        title: "Secure enterprise agreement with Anthropic for institutional AI tool use",
      },
      {
        number: 4,
        title:
          "Formalize CLAUDE.md rules section — separate context from normative rules",
      },
      {
        number: 6,
        title: "Create agent coordination documentation",
      },
      {
        number: 8,
        title: "Expand PR template with agent attribution metadata",
      },
      {
        number: 11,
        title: "Create skill definition template for new Claude Code skills",
      },
      {
        number: 13,
        title: "Update onboarding guide to include AI tooling setup",
      },
    ],
    executionIssues: [
      {
        number: 27,
        title:
          "[Governance] Require approved institutional repositories and toolchain for non-research AI development",
      },
      {
        number: 25,
        title:
          "[Governance] Define exception process for decentralized or learning-only AI builds",
      },
      {
        number: 24,
        title: "[Governance] Build repository compliance dashboard for standards adoption",
      },
    ],
  },
  {
    name: "Standards",
    ownerRole: "Standards Program Lead",
    goal:
      "Operationalize the institutional standards roadmap across code, security, QA, accessibility, UX, and integration.",
    epic: {
      number: 19,
      title: "[Standards] Institutional AI development standards rollout",
    },
    existingIssues: [
      {
        number: 5,
        title: "Add backend pytest CI gate to prevent silent breakage",
      },
      {
        number: 7,
        title: "Add SECURITY.md and CODE_OF_CONDUCT.md",
      },
      {
        number: 9,
        title: "Add GitHub issue templates for bugs and feature requests",
      },
      {
        number: 10,
        title: "Create Architecture Decision Records (ADRs) for key design decisions",
      },
      {
        number: 12,
        title: "Enforce linting in CI (Ruff, ESLint)",
      },
    ],
    executionIssues: [
      {
        number: 35,
        title: "[Standards] Publish accessibility standard and runtime testing rollout",
      },
      {
        number: 36,
        title:
          "[Standards] Create institutional UX standard and shared design pattern library",
      },
      {
        number: 31,
        title: "[Standards] Create integration and API standard with review process",
      },
    ],
  },
  {
    name: "Operating Model",
    ownerRole: "AISPEG Chair / Strategic Lead",
    goal:
      "Clarify decision rights, planning cadence, and how cross-functional product teams get formed and prioritized.",
    epic: {
      number: 21,
      title: "[Operating Model] AISPEG governance and cross-functional product teams",
    },
    existingIssues: [
      {
        number: 2,
        title: "Align AISPEG efforts with University of Idaho strategic plan",
      },
    ],
    executionIssues: [
      {
        number: 32,
        title:
          "[Operating Model] Define AISPEG charter, decision rights, and review cadence",
      },
      {
        number: 33,
        title: "[Operating Model] Create AI workflow intake and prioritization rubric",
      },
      {
        number: 34,
        title: "[Operating Model] Launch first cross-functional AI product team pilot",
      },
    ],
  },
  {
    name: "Modernization",
    ownerRole: "Modernization / Procurement Lead",
    goal:
      "Shift the institution toward build-first modernization with disciplined vendor, contract, and data-repatriation decisions.",
    epic: {
      number: 20,
      title: "[Modernization] Vendor, contract, and data repatriation strategy",
    },
    existingIssues: [
      {
        number: 3,
        title: "Comprehensive audit of institutional data locked behind vendor contracts",
      },
    ],
    executionIssues: [
      {
        number: 40,
        title:
          "[Modernization] Rank legacy contracts by replacement value, timing, and repatriation feasibility",
      },
      {
        number: 39,
        title:
          "[Modernization] Define institutional build-vs-buy rubric for AI-era software decisions",
      },
      {
        number: 38,
        title:
          "[Modernization] Standardize contract clauses for data repatriation and renewal limits",
      },
    ],
  },
];

export const actionPlanSynthesis = {
  ownerRole: "Roadmap / Program Lead",
  issue: {
    number: 37,
    title: "[Synthesis] Convert approved roadmap inputs into 2026 execution roadmap",
  },
  goal:
    "Translate research-oriented roadmap inputs into approved execution work without letting parallel roadmaps diverge.",
  inputIssues: [
    {
      number: 15,
      title: "[Roadmap Input] Intent engineering as a required layer for agent strategy",
    },
    {
      number: 16,
      title: "[Roadmap Input] Six-axis difficulty mapping for AI workflow strategy",
    },
  ],
};
