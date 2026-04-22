// ============================================================
// Portfolio — Active AI4RA & ui-insight projects
// ============================================================
// This is the stakeholder-facing portfolio. For the historical
// Feb 2026 productivity snapshot, see `projects` in lib/data.ts.

export type PortfolioStatus =
  | "Production"
  | "Active development"
  | "Beta"
  | "Research"
  | "Archived";

export type PortfolioRole =
  | "Platform"
  | "Institutional app"
  | "Governance"
  | "Infrastructure"
  | "Evaluation infrastructure"
  | "Research tool"
  | "Outreach"
  | "Community";

export type PortfolioOrg = "AI4RA" | "ui-insight";

export interface PortfolioProject {
  slug: string;
  name: string;
  org: PortfolioOrg;
  tagline: string;
  description: string;
  status: PortfolioStatus;
  role: PortfolioRole;
  tech: string[];
  features: string[];
  funding?: string;
  repoUrl: string;
  docsUrl?: string;
  liveUrl?: string;
  isPrivate: boolean;
  relatedSlugs?: string[];
  tags?: string[];
}

export const portfolioProjects: PortfolioProject[] = [
  // ==================================================
  // AI4RA — Community of practice
  // ==================================================
  {
    slug: "prompt-library",
    name: "Prompt Library",
    org: "AI4RA",
    tagline: "Versioned storage for prompts, skills, and agents across AI4RA.",
    description:
      "Canonical, versioned home for prompts, skills, agents, and related LLM components used by AI4RA applications. Feeds downstream eval infrastructure and provides a shared vocabulary for LLM-powered features across the portfolio.",
    status: "Active development",
    role: "Evaluation infrastructure",
    tech: ["Python"],
    features: [
      "Versioned prompt assets",
      "Shared skill and agent definitions",
      "Triad-aware integration with evaluation-harness",
      "Feeds evaluation-data-sets fixtures",
      "Open source",
    ],
    repoUrl: "https://github.com/AI4RA/prompt-library",
    isPrivate: false,
    relatedSlugs: ["evaluation-harness", "evaluation-data-sets"],
    tags: ["LLM", "evals", "open-source"],
  },
  {
    slug: "evaluation-harness",
    name: "Evaluation Harness",
    org: "AI4RA",
    tagline: "Triad-aware evaluation harness for AI4RA LLM components.",
    description:
      "Runs the prompt-library against evaluation-data-sets fixtures in a triad (prompt × data × model) evaluation pattern. Produces quality signal for LLM-powered features across the AI4RA ecosystem.",
    status: "Active development",
    role: "Evaluation infrastructure",
    tech: ["Python"],
    features: [
      "Triad evaluation (prompt × data × model)",
      "Integrates with prompt-library",
      "Uses evaluation-data-sets fixtures",
      "Quality signal for LLM features",
    ],
    repoUrl: "https://github.com/AI4RA/evaluation-harness",
    isPrivate: true,
    relatedSlugs: ["prompt-library", "evaluation-data-sets"],
    tags: ["LLM", "evals"],
  },
  {
    slug: "evaluation-data-sets",
    name: "Evaluation Data Sets",
    org: "AI4RA",
    tagline: "Synthetic and real fixtures for AI4RA skill evaluation.",
    description:
      "Curated synthetic and real evaluation fixtures supporting the AI4RA skill library and related LLM components. Powers reproducible quality measurement for prompts, skills, and agents.",
    status: "Active development",
    role: "Evaluation infrastructure",
    tech: ["Python"],
    features: [
      "Synthetic evaluation fixtures",
      "Real-world evaluation data",
      "Shared across prompt/skill/agent evals",
      "Reproducibility foundation",
    ],
    repoUrl: "https://github.com/AI4RA/evaluation-data-sets",
    isPrivate: true,
    relatedSlugs: ["prompt-library", "evaluation-harness"],
    tags: ["LLM", "evals"],
  },
  {
    slug: "mcp-ecfr",
    name: "eCFR MCP Server",
    org: "AI4RA",
    tagline: "Claude connector for the Electronic Code of Federal Regulations.",
    description:
      "Model Context Protocol server that exposes the Electronic Code of Federal Regulations to Claude and other MCP-compatible agents. Brings authoritative federal regulation text into AI-assisted research administration workflows.",
    status: "Active development",
    role: "Research tool",
    tech: ["Python", "MCP"],
    features: [
      "MCP server for eCFR",
      "Compatible with Claude Desktop and Claude Code",
      "Authoritative federal regulation text",
      "Supports compliance-adjacent AI workflows",
      "Open source",
    ],
    repoUrl: "https://github.com/AI4RA/mcp-ecfr",
    isPrivate: false,
    tags: ["MCP", "compliance", "open-source"],
  },
  {
    slug: "herd-survey",
    name: "Herd Survey",
    org: "AI4RA",
    tagline: "Tools for herd-survey result access and report preparation.",
    description:
      "Internal tooling that simplifies access to herd-survey results and automates parts of the report preparation workflow for participating institutions.",
    status: "Active development",
    role: "Research tool",
    tech: ["Python"],
    features: [
      "Herd-survey result access",
      "Report preparation helpers",
    ],
    repoUrl: "https://github.com/AI4RA/herd-survey",
    isPrivate: true,
    tags: ["survey", "reporting"],
  },
  {
    slug: "ai4ra-discussions",
    name: "AI4RA Discussions",
    org: "AI4RA",
    tagline: "Technical discussion hub for AI4RA contributors.",
    description:
      "Shared space for technical discussions, contribution workflows, and developer support across AI4RA repositories. Open to external research administration contributors.",
    status: "Production",
    role: "Community",
    tech: ["GitHub Discussions"],
    features: [
      "Cross-repo technical discussions",
      "Contribution workflow guidance",
      "Developer support threads",
      "Public and open to external contributors",
    ],
    repoUrl: "https://github.com/AI4RA/discussions",
    isPrivate: false,
    tags: ["community", "open-source"],
  },

  // ==================================================
  // ui-insight — University of Idaho
  // ==================================================

  // --- Flagship platforms ---
  {
    slug: "openera",
    name: "OpenERA",
    org: "ui-insight",
    tagline: "Open-source electronic research administration platform.",
    description:
      "Modern pre-award proposal management system that replaces legacy Java/JSP research administration tools. A guided React + FastAPI workspace that walks researchers from RFA intake through institutional approval, covering budget, compliance, personnel, documents, and multi-stage review.",
    status: "Active development",
    role: "Platform",
    tech: [
      "React 19",
      "TypeScript",
      "Tailwind v4",
      "FastAPI",
      "SQLAlchemy 2.0",
      "PostgreSQL 16",
    ],
    features: [
      "9-step proposal wizard (RFA → submit)",
      "IACUC, IRB, IBC protocol workspaces with full lifecycle management",
      "RFA upload with OCR + LLM extraction (scalar fields and document requirements)",
      "NSF-format budget builder with MTDC indirect calc and Excel import/export",
      "F&A distribution Sankey visualization",
      "Multi-step approval workflow (Dept Chair → Dean → OSP)",
      "Structured substantive review ledger with override rationale",
      "Personnel compliance matrix across NSF, NIH, NASA, DoD, DoE, USDA",
      "Role-based access, auto-save, AI-ready admin panel",
    ],
    repoUrl: "https://github.com/ui-insight/OpenERA",
    docsUrl: "https://ui-insight.github.io/OpenERA",
    isPrivate: false,
    relatedSlugs: ["ai4ra-udm", "data-governance", "template-app", "mindrouter"],
    tags: ["ERA", "research-admin", "open-source", "flagship"],
  },
  {
    slug: "vandalizer",
    name: "Vandalizer",
    org: "ui-insight",
    tagline: "AI-powered document intelligence for research administration.",
    description:
      "Open-source, self-hosted platform for AI-powered document review and data extraction, purpose-built for research administration offices. Processes grant proposals, award documents, and regulatory filings with configurable LLM-powered extraction workflows, chainable pipelines, and citation-backed RAG chat.",
    status: "Production",
    role: "Platform",
    tech: [
      "React 19",
      "Python 3.11+",
      "FastAPI",
      "Docker",
      "Ollama / OpenAI-compatible LLMs",
    ],
    features: [
      "Structured LLM extraction from PDFs (dates, budgets, requirements)",
      "Workflow engine: chain extraction tasks with dependency resolution",
      "RAG chat with citation-backed answers",
      "Multi-tenant team workspaces with role-based access",
      "Self-hosted; runs on a single 16GB server",
      "Air-gappable with local LLM/OCR",
      "One-command setup via ./setup.sh",
    ],
    funding: "NSF GRANTED, Award #2427549",
    repoUrl: "https://github.com/ui-insight/vandalizer",
    isPrivate: false,
    relatedSlugs: ["mindrouter", "openera"],
    tags: ["LLM", "document-intelligence", "open-source", "NSF-funded", "flagship"],
  },
  {
    slug: "ai4ra-udm",
    name: "AI4RA Unified Data Model",
    org: "ui-insight",
    tagline: "Universal data model specification for research administration.",
    description:
      "Institution-agnostic data model specification for research administration. Defines 40 tables, 8 pre-built views, naming conventions, and design patterns that institutions map their local data to for interoperability and FAIR-principled reporting.",
    status: "Production",
    role: "Governance",
    tech: ["JSON Schema", "MkDocs Material", "PostgreSQL reference implementation"],
    features: [
      "40 tables across 11 domains (Pre-Award, Post-Award, Financial, Compliance, etc.)",
      "8 pre-built reporting views (vw_Active_Awards, vw_Budget_Comparison, etc.)",
      "Complete ontology with naming conventions",
      "Flexible AllowedValues pattern + fixed CHECK constraints",
      "Interactive dashboard published on GitHub Pages",
      "Single source of truth in udm_schema.json",
      "Institutional standard across the ui-insight portfolio",
    ],
    repoUrl: "https://github.com/ui-insight/AI4RA-UDM",
    docsUrl: "https://ui-insight.github.io/AI4RA-UDM",
    isPrivate: false,
    relatedSlugs: ["data-governance", "openera"],
    tags: ["data-model", "governance", "standards", "open-source", "flagship"],
  },
  {
    slug: "mindrouter",
    name: "MindRouter",
    org: "ui-insight",
    tagline: "Production LLM load balancer with unified API surface.",
    description:
      "LLM inference load balancer fronting a heterogeneous cluster of Ollama and vLLM nodes. Provides unified OpenAI-, Ollama-, and Anthropic-compatible endpoints with fair-share scheduling, quota management, telemetry, and audit logging across the University of Idaho's on-prem AI infrastructure.",
    status: "Production",
    role: "Infrastructure",
    tech: [
      "Python 3.11+",
      "Docker",
      "Ollama",
      "vLLM",
      "Azure AD SSO",
    ],
    features: [
      "Unified API: OpenAI /v1/*, Ollama /api/*, Anthropic /anthropic/v1/*",
      "API dialect translation between Ollama and vLLM",
      "Weighted Deficit Round Robin fair-share scheduling with burst credits",
      "Per-user token quotas with role-based weights",
      "Real-time GPU/memory telemetry per node and backend",
      "Drain mode for graceful backend offlining",
      "Tool calling with cross-engine translation",
      "Voice API (TTS/STT) with quota tracking",
      "Azure AD SSO with JIT provisioning",
      "Full audit logging of prompts, responses, artifacts",
    ],
    repoUrl: "https://github.com/ui-insight/MindRouter",
    isPrivate: false,
    relatedSlugs: ["dgx-stack", "vandalizer", "auditdashboard"],
    tags: ["LLM", "infrastructure", "GPU", "production", "flagship"],
  },
  {
    slug: "stratplan-tactics",
    name: "Strategic Plan Dashboard",
    org: "ui-insight",
    tagline: "Alignment and investment portfolio for the UI 2025-2030 strategic plan.",
    description:
      "Data-driven dashboard for visualizing and analyzing how 25 academic and administrative units align their tactics with the University's 2025-2030 strategic plan. Evolving from alignment visualization into a strategic execution and investment portfolio tool.",
    status: "Production",
    role: "Institutional app",
    tech: ["React 19", "TypeScript", "Tailwind v4", "FastAPI", "PostgreSQL"],
    features: [
      "Executive overview with strategic KPIs",
      "Interactive unit-by-priority alignment matrix",
      "Synergy finder for cross-unit collaboration",
      "Coverage analysis: well-served vs. under-served priorities",
      "Investment portfolio analytics and spend concentration",
      "Redundancy detection across unit tactics",
      "Pillar deep-dive with tactic detail",
      "SPIGP tracking layer with award registry",
      "Investment metadata per tactic (funding, ROI, timeline)",
      "Execution maturity and health rollups",
    ],
    repoUrl: "https://github.com/ui-insight/StratPlanTacticsMB",
    isPrivate: false,
    relatedSlugs: ["template-app", "data-governance"],
    tags: ["strategic-planning", "analytics", "institutional"],
  },

  // --- Institutional apps ---
  {
    slug: "processmapping",
    name: "ProcessMapping",
    org: "ui-insight",
    tagline: "Process intelligence platform for Research Administration.",
    description:
      "Full-stack application plus data repository for Research Administration process intelligence. Combines canonical process-map JSON with Vandalizer-powered transcript ingest, workflow comparison, and schema-validated projection into insight-db.",
    status: "Production",
    role: "Institutional app",
    tech: ["React 19", "TypeScript", "Vite", "FastAPI", "Python 3.11+"],
    features: [
      "Interactive process map browser",
      "Step-by-step actor/system/input/output detail",
      "Workflow pipeline and task-file browsing",
      "Process-step-vs-workflow coverage analysis",
      "UTF-8 transcript ingest into starter skeletons",
      "JSON schema validation enforced",
      "Optional PostgreSQL projection via insight-db",
      "MkDocs Material governance docs",
    ],
    repoUrl: "https://github.com/ui-insight/ProcessMapping",
    isPrivate: false,
    relatedSlugs: ["vandalizer", "data-governance"],
    tags: ["process-intelligence", "research-admin"],
  },
  {
    slug: "ucm-daily-register",
    name: "UCM Daily Register",
    org: "ui-insight",
    tagline: "AI-assisted newsletter production pipeline for UCM.",
    description:
      "Editorial pipeline for the University of Idaho's University Communications and Marketing team. Submission intake, AI-assisted editing with AP and U of I style enforcement, editorial review, and Word export.",
    status: "Production",
    role: "Institutional app",
    tech: ["React 19", "TypeScript", "FastAPI", "SQLAlchemy 2.0", "Claude/OpenAI"],
    features: [
      "Community submission intake web form",
      "AI-assisted style editing (Claude or OpenAI, switchable)",
      "Word-level diff viewer with accept/reject/modify",
      "Newsletter auto-assembly by section",
      "Recurring message library with cadence rules",
      "Branded .docx export",
      "Data-driven style rules engine editable via UI",
    ],
    repoUrl: "https://github.com/ui-insight/UCMDailyRegister",
    isPrivate: false,
    relatedSlugs: ["data-governance", "mindrouter"],
    tags: ["editorial", "LLM", "institutional"],
  },
  {
    slug: "auditdashboard",
    name: "Audit Dashboard",
    org: "ui-insight",
    tagline: "AI-assisted audit observation tracker for Internal Audit.",
    description:
      "Full-stack dashboard for tracking internal audit observations, corrective action items, and responsible-party assignments. Ingests audit report PDFs via an OCR + LLM pipeline, with human review before persistence.",
    status: "Production",
    role: "Institutional app",
    tech: ["React 19", "TypeScript", "Tailwind v4", "FastAPI", "PostgreSQL 16"],
    features: [
      "PDF audit report upload → OCR (MindRouter dots.OCR) → Qwen3 extraction",
      "Human-in-the-loop review before persistence",
      "Observation tracking with severity, status, policy references",
      "Action item management with overdue highlighting",
      "Status journal with transition history",
      "Summary dashboard with severity/status breakdowns",
      "CSV export of filtered action items",
    ],
    repoUrl: "https://github.com/ui-insight/AuditDashboard",
    isPrivate: false,
    relatedSlugs: ["mindrouter", "data-governance", "template-app"],
    tags: ["audit", "LLM", "institutional"],
  },
  {
    slug: "execord",
    name: "ExecOrd",
    org: "ui-insight",
    tagline: "Executive Order compliance tracker.",
    description:
      "Executive Order compliance tracking tool with VM deployment configuration. Private institutional tooling for monitoring federal EO impacts and compliance posture.",
    status: "Active development",
    role: "Institutional app",
    tech: ["Python"],
    features: [
      "EO compliance tracking",
      "VM deployment configuration",
      "Institutional compliance posture monitoring",
    ],
    repoUrl: "https://github.com/ui-insight/ExecOrd",
    isPrivate: true,
    tags: ["compliance", "institutional"],
  },
  {
    slug: "sem-experiential",
    name: "SEM Experiential Learning",
    org: "ui-insight",
    tagline: "Experiential learning and engagement records platform.",
    description:
      "Platform for managing experiential learning and student engagement records. Supports a shared system where students, faculty, staff, and administrators track participation, manage operational workflows, and eventually produce trusted experience records. Scaffolded from TEMPLATE-app and following OpenERA patterns.",
    status: "Active development",
    role: "Institutional app",
    tech: ["React 19", "TypeScript", "FastAPI", "SQLAlchemy 2.0", "PostgreSQL"],
    features: [
      "Backend-backed MVP: organizations, events, attendance, dashboard",
      "Admin user and role management",
      "FastAPI with persisted auth, signed bearer tokens, password hashing",
      "Role checks and Alembic migrations",
      "Prototype UI for internships, transcripts, reports, notifications",
      "Roadmap, governance, security, deployment docs",
    ],
    repoUrl: "https://github.com/ui-insight/SEM-experiential",
    isPrivate: false,
    relatedSlugs: ["template-app", "openera", "data-governance"],
    tags: ["student-success", "institutional"],
  },
  {
    slug: "rfd-career",
    name: "RFD CAREER Dashboard",
    org: "ui-insight",
    tagline: "Cohort progress dashboard for CAREER Club participants.",
    description:
      "Interactive cohort dashboard for tracking participant progress through CAREER Club workbook data. Ingests rubric entry forms and visualizes cohort and individual progress.",
    status: "Active development",
    role: "Institutional app",
    tech: ["React", "TypeScript", "Vite", "FastAPI"],
    features: [
      "Cohort progress visualization",
      "Rubric Entry Form ingest (.xlsx)",
      "Participant-level progress tracking",
      "Faculty development program support",
    ],
    repoUrl: "https://github.com/ui-insight/RFD-career",
    isPrivate: false,
    relatedSlugs: ["template-app"],
    tags: ["faculty-development", "institutional"],
  },

  // --- Governance & standards ---
  {
    slug: "data-governance",
    name: "UI Insight Data Governance",
    org: "ui-insight",
    tagline: "Institutional data governance across the UI Insight portfolio.",
    description:
      "Central governance documentation for the University of Idaho's UI Insight application portfolio. Adopts the AI4RA UDM's naming conventions, design patterns, and controlled-vocabulary approach as the institutional standard across all domains.",
    status: "Production",
    role: "Governance",
    tech: ["MkDocs Material", "Python"],
    features: [
      "Adopts AI4RA UDM as institutional standard",
      "Catalogs domain-specific data models for governed applications",
      "Unified vocabulary registry",
      "Governance drift validation script",
      "Portfolio: OpenERA (32 tables), UCM Daily Register (10), Audit Dashboard (13), StratPlan, ProcessMapping",
    ],
    repoUrl: "https://github.com/ui-insight/data-governance",
    isPrivate: false,
    relatedSlugs: [
      "ai4ra-udm",
      "openera",
      "ucm-daily-register",
      "auditdashboard",
      "stratplan-tactics",
      "processmapping",
    ],
    tags: ["governance", "standards", "data-model"],
  },

  // --- Platform infrastructure ---
  {
    slug: "template-app",
    name: "TEMPLATE-app",
    org: "ui-insight",
    tagline: "Production-ready starter for AI-assisted UI business applications.",
    description:
      "Opinionated starting point for building University business applications with agentic AI development. Bakes in tech stack, documentation standards, data governance, security standards, CI/CD, and agent guidance from day one.",
    status: "Production",
    role: "Infrastructure",
    tech: [
      "React 19",
      "TypeScript",
      "Tailwind v4",
      "FastAPI",
      "SQLAlchemy",
      "PostgreSQL",
    ],
    features: [
      "React 19 + FastAPI + PostgreSQL stack",
      "MkDocs Material site scaffold",
      "Data governance: classification framework + handling rules",
      "Security: JWT, RBAC, dependency scanning, review checklist",
      "GitHub Actions CI/CD with test, lint, security scan",
      "CLAUDE.md for agentic development context",
      "Playwright e2e smoke-test scaffold",
      "CycloneDX SBOM generation",
    ],
    repoUrl: "https://github.com/ui-insight/TEMPLATE-app",
    isPrivate: false,
    relatedSlugs: [
      "openera",
      "sem-experiential",
      "rfd-career",
      "auditdashboard",
      "stratplan-tactics",
    ],
    tags: ["scaffold", "infrastructure", "agentic-dev"],
  },
  {
    slug: "dgx-stack",
    name: "DGX Stack",
    org: "ui-insight",
    tagline: "Two-container vLLM + OCR stack for NVIDIA DGX Spark.",
    description:
      "Ultra-convenient DGX Spark deployment stack that runs a multimodal LLM on Grace-Blackwell hardware. One container serves the model via vLLM, the other provides document OCR using the same model's vision capabilities.",
    status: "Production",
    role: "Infrastructure",
    tech: ["Docker", "vLLM", "NVIDIA Container Toolkit", "CUDA 13"],
    features: [
      "Gemma 4 26B MoE support (HF token + license)",
      "Qwen 3.5 35B FP8 MoE support (open access, OCR-strong)",
      "Multimodal: LLM + vision-based OCR from same model",
      "One-command ./setup.sh deployment",
      "Tuned for 128GB unified memory",
      "Interactive model/port/memory configuration",
    ],
    repoUrl: "https://github.com/ui-insight/dgx-stack",
    isPrivate: false,
    relatedSlugs: ["mindrouter", "auditdashboard"],
    tags: ["GPU", "LLM", "infrastructure"],
  },

  // --- Outreach & pedagogy ---
  {
    slug: "reach-workshop-2026",
    name: "REACH 2026 AI4RA Workshop",
    org: "ui-insight",
    tagline: "AI4RA workshop site for REACH 2026.",
    description:
      "GitHub Pages site for the REACH 2026 AI4RA workshop — 'The Intersection Between AI and Data.' Three-hour hands-on workshop for research administration professionals on building safer, more relevant, more inspectable AI-assisted workflows.",
    status: "Production",
    role: "Outreach",
    tech: ["GitHub Pages", "HTML/CSS"],
    features: [
      "Three workshop modules (AI+data science, data lakehouse, reproducibility)",
      "Presenters from University of Idaho and Southern Utah University",
      "Learning objectives: prompt structure, AI readiness, governance",
      "Hands-on activity: data-crawler-carl",
      "Lessons from the AI4RA NSF GRANTED project",
    ],
    repoUrl: "https://github.com/ui-insight/REACHWorkshop2026",
    liveUrl: "https://ui-insight.github.io/REACHWorkshop2026/",
    isPrivate: false,
    relatedSlugs: ["data-crawler-carl", "vandalizer"],
    tags: ["outreach", "workshop", "pedagogy"],
  },
  {
    slug: "data-crawler-carl",
    name: "Data Crawler Carl",
    org: "ui-insight",
    tagline: "In-browser AI CSV explorer with natural-language SQL.",
    description:
      "AI-powered CSV data explorer that runs entirely in the browser. Upload any CSV, query with natural language and SQL, and visualize with auto-generated Plotly charts. Only the schema sample leaves the browser — data stays local.",
    status: "Production",
    role: "Outreach",
    tech: ["sql.js (WebAssembly)", "PapaParse", "Plotly.js", "Google Gemini"],
    features: [
      "In-browser SQLite via sql.js WebAssembly",
      "Natural-language queries via Google Gemini",
      "Auto-executed SQL with inline results",
      "Safe chart rendering (Plotly, no code execution)",
      "Schema-only context sent to Gemini; data stays local",
      "Hands-on activity for the REACH 2026 workshop",
    ],
    repoUrl: "https://github.com/ui-insight/data-crawler-carl",
    liveUrl: "https://ui-insight.github.io/data-crawler-carl/",
    isPrivate: false,
    relatedSlugs: ["reach-workshop-2026"],
    tags: ["outreach", "workshop", "LLM", "data-exploration"],
  },
];

// ============================================================
// Helpers
// ============================================================

export function getProjectsByOrg(org: PortfolioOrg): PortfolioProject[] {
  return portfolioProjects.filter((p) => p.org === org);
}

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return portfolioProjects.find((p) => p.slug === slug);
}

export function getRelatedProjects(project: PortfolioProject): PortfolioProject[] {
  if (!project.relatedSlugs) return [];
  return project.relatedSlugs
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is PortfolioProject => p !== undefined);
}
