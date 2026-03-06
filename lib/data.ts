// ============================================================
// Key Metrics
// ============================================================

export const keyMetrics = {
  totalCommits: 830,
  netNewLines: 237900,
  totalLinesAdded: 273611,
  totalLinesDeleted: 35711,
  uniqueFiles: 3132,
  activeRepos: 11,
  pullRequests: 116,
  issuesTracked: 164,
  calendarDays: 26,
  contributors: 8,
  commitsPerDay: 32,
  linesPerDay: 9150,
  productivityMultiplier: "10-16x",
  manualEstimate: "72-108 months for a single developer",
};

// ============================================================
// Projects (enriched with activity report detail)
// ============================================================

export const projects = [
  {
    name: "Vandalizer",
    daysActive: 25,
    netNewLines: 80691,
    linesAdded: 85916,
    linesDeleted: 5225,
    filesChanged: 1083,
    commits: 54,
    contributors: "John Brunsfeld (29), ViaJables (25)",
    activePeriod: "Feb 2-26",
    lowEstimate: "538 days (24.4 mo)",
    highEstimate: "807 days (36.7 mo)",
    multiplier: "22-32x",
    description:
      "AI-powered document intelligence platform with LLM extraction workflows, RAG chat, and team collaboration. Completely refactored codebase from Flask to React and FastAPI in less than one week. Deploy as Open Source in Q1 2026, part of the AI4RA Community of Practice.",
  },
  {
    name: "OpenERA",
    daysActive: 12,
    netNewLines: 62500,
    linesAdded: 68410,
    linesDeleted: 5910,
    filesChanged: 1153,
    commits: 185,
    contributors: "ProfessorPolymorphic (166), dependabot[bot] (17), sheneman (2)",
    activePeriod: "Feb 14-25",
    lowEstimate: "417 days (18.9 mo)",
    highEstimate: "625 days (28.4 mo)",
    multiplier: "35-52x",
    description:
      "Open-source electronic research administration platform (React + FastAPI). Replaces legacy pre-award systems with a modern platform guiding researchers from opportunity discovery through institutional approval. Created by a researcher with no software development experience in one weekend. 77 pull requests, 58 issues tracked.",
  },
  {
    name: "mindrouter2",
    daysActive: 18,
    netNewLines: 37191,
    linesAdded: 38175,
    linesDeleted: 984,
    filesChanged: 153,
    commits: 169,
    contributors: "sheneman (168), Luke Sheneman (1)",
    activePeriod: "Feb 9-26",
    lowEstimate: "248 days (11.3 mo)",
    highEstimate: "372 days (16.9 mo)",
    multiplier: "14-21x",
    description:
      "GPU-enabled AI router with admin UI and Docker orchestration. Provides fair, efficient access to shared GPU clusters by routing AI requests across heterogeneous backends (Ollama, vLLM). Now v0.18.7 operational on UI Research Computing infrastructure with 63 available models and 225M+ total tokens served.",
  },
  {
    name: "proposalforge",
    daysActive: 6,
    netNewLines: 18814,
    linesAdded: 20173,
    linesDeleted: 1359,
    filesChanged: 268,
    commits: 60,
    contributors: "sheneman (60)",
    activePeriod: "Feb 21-26",
    lowEstimate: "125 days (5.7 mo)",
    highEstimate: "188 days (8.5 mo)",
    multiplier: "21-31x",
    description:
      "AI-powered proposal generation with LangGraph pipeline. Full stack includes FastAPI, a LangGraph agent pipeline, Celery task queuing, PostgreSQL, MinIO object storage, and Docker Compose orchestration. Proposal wizard integrated with UDM and Lakehouse.",
  },
  {
    name: "StratPlanTactics",
    daysActive: 2,
    netNewLines: 18555,
    linesAdded: 19805,
    linesDeleted: 1250,
    filesChanged: 164,
    commits: 35,
    contributors: "ProfessorPolymorphic (24), dependabot[bot] (11)",
    activePeriod: "Feb 24-25",
    lowEstimate: "124 days (5.6 mo)",
    highEstimate: "186 days (8.4 mo)",
    multiplier: "62-93x",
    description:
      "Strategic plan dashboard — alignment tool for 21 units, 337 tactics. Built in just 2 days with 20 pull requests and 7 issues tracked.",
  },
  {
    name: "Lakehouse",
    daysActive: 23,
    netNewLines: 9875,
    linesAdded: 12745,
    linesDeleted: 2870,
    filesChanged: 89,
    commits: 245,
    contributors: "Nathan Layman (245)",
    activePeriod: "Feb 4-26",
    lowEstimate: "66 days (3.0 mo)",
    highEstimate: "99 days (4.5 mo)",
    multiplier: "3-4x",
    description:
      "Data lakehouse with adapter-based ETL pipelines. Establishes a shared, open data standard for research administration — enabling interoperability across institutions and systems while respecting local autonomy. Provides the common language for tools like OpenERA. ~25,000 new lines of committed code in the last 6 days. 12 PRs and 79 issues tracked.",
  },
  {
    name: "dissertation",
    daysActive: 1,
    netNewLines: 5107,
    linesAdded: 5170,
    linesDeleted: 63,
    filesChanged: 52,
    commits: 2,
    contributors: "sheneman (2)",
    activePeriod: "Feb 13",
    lowEstimate: "34 days (1.5 mo)",
    highEstimate: "51 days (2.3 mo)",
    multiplier: "34-51x",
    description:
      "A dissertation-to-LaTeX converter web application with AI-powered document analysis and multi-LLM backend support, complete with Docker deployment. Built and committed in a single day.",
  },
  {
    name: "Water Rights",
    daysActive: 15,
    netNewLines: 4821,
    linesAdded: 5011,
    linesDeleted: 190,
    filesChanged: 37,
    commits: 39,
    contributors: "awchild (22), Andrew Child (17)",
    activePeriod: "Feb 9-23",
    lowEstimate: "32 days (1.5 mo)",
    highEstimate: "48 days (2.2 mo)",
    multiplier: "2-3x",
    description:
      "AI-assisted water rights web application with document OCR and metadata extraction.",
  },
  {
    name: "CerealPestAID",
    daysActive: 2,
    netNewLines: 1984,
    linesAdded: 2024,
    linesDeleted: 40,
    filesChanged: 28,
    commits: 5,
    contributors: "sheneman (4), Luke Sheneman (1)",
    activePeriod: "Feb 14-15",
    lowEstimate: "13 days (0.6 mo)",
    highEstimate: "20 days (0.9 mo)",
    multiplier: "7-10x",
    description:
      "Cereal pest classifier with 3 CNN architectures (EfficientNet-B6, MobileNetV3-Large, InceptionV3) covering 26 pest species. Includes complete training pipelines, evaluation scripts, ONNX model conversion, and TFLite inference code.",
  },
  {
    name: "WildVE",
    daysActive: 3,
    netNewLines: 1532,
    linesAdded: 2247,
    linesDeleted: 715,
    filesChanged: 41,
    commits: 26,
    contributors: "sheneman (23), Luke Sheneman (3)",
    activePeriod: "Feb 12-14",
    lowEstimate: "10 days (0.5 mo)",
    highEstimate: "15 days (0.7 mo)",
    multiplier: "3-5x",
    description:
      "Wildlife video extraction with 6-model ML ensemble incorporating MegaDetector V5/V6, YOLOv8 with EnlightenGAN, Florence-2, and CLIP. Built from scratch in 3 days.",
  },
  {
    name: "ReactFast (Control)",
    daysActive: 25,
    netNewLines: 324,
    linesAdded: 16201,
    linesDeleted: 15877,
    filesChanged: 259,
    commits: 175,
    contributors: "prateekrauniyar345 (44), Jarred6068 (42), Arpan Pal (31), sns-sakib (18), + 5 others",
    activePeriod: "Feb 1-25",
    lowEstimate: "N/A",
    highEstimate: "N/A",
    multiplier: "Control",
    description:
      "Control repository: Full-stack Vite + FastAPI application developed by a team of 9 contributors using traditional development workflows (no agentic AI tools). 175 commits produced only +324 net new lines of code, highlighting the iterative churn typical of manual development — in stark contrast to the agentic projects.",
  },
  {
    name: "AI4RA-UDM",
    daysActive: 15,
    netNewLines: -3170,
    linesAdded: 13935,
    linesDeleted: 17105,
    filesChanged: 64,
    commits: 10,
    contributors: "Nathan Layman (9), github-actions[bot] (1)",
    activePeriod: "Feb 11-25",
    lowEstimate: "N/A",
    highEstimate: "N/A",
    multiplier: "Refactor",
    description:
      "Universal data model for research administration analytics. Net negative lines reflect a major refactoring effort — simplifying and consolidating the codebase. 6 PRs and 8 issues tracked.",
  },
];

export const projectTotals = {
  daysActive: 26,
  netNewLines: 237900,
  linesAdded: 273611,
  linesDeleted: 35711,
  lowEstimate: "1,586 days (72 mo)",
  highEstimate: "2,379 days (108 mo)",
  multiplier: "10-16x",
};

export const repositoryTimeline = [
  {
    name: "ReactFast (Control)",
    firstCommit: "2026-02-01",
    lastCommit: "2026-02-25",
    description: "Full-stack Vite + FastAPI — traditional workflow",
  },
  {
    name: "Vandalizer",
    firstCommit: "2026-02-02",
    lastCommit: "2026-02-26",
    description: "AI-powered document intelligence platform",
  },
  {
    name: "Lakehouse",
    firstCommit: "2026-02-04",
    lastCommit: "2026-02-26",
    description: "Data lakehouse with adapter-based ETL pipelines",
  },
  {
    name: "mindrouter2",
    firstCommit: "2026-02-09",
    lastCommit: "2026-02-26",
    description: "GPU-enabled AI router with admin UI, Docker",
  },
  {
    name: "Water Rights",
    firstCommit: "2026-02-09",
    lastCommit: "2026-02-23",
    description: "AI-assisted water rights web application",
  },
  {
    name: "AI4RA-UDM",
    firstCommit: "2026-02-11",
    lastCommit: "2026-02-25",
    description: "Universal data model for research admin analytics",
  },
  {
    name: "WildVE",
    firstCommit: "2026-02-12",
    lastCommit: "2026-02-14",
    description: "Wildlife video extraction with 6-model ML ensemble",
  },
  {
    name: "dissertation",
    firstCommit: "2026-02-13",
    lastCommit: "2026-02-13",
    description: "Dissertation-to-LaTeX converter web app",
  },
  {
    name: "OpenERA",
    firstCommit: "2026-02-14",
    lastCommit: "2026-02-25",
    description: "Open-source electronic research administration",
  },
  {
    name: "CerealPestAID",
    firstCommit: "2026-02-14",
    lastCommit: "2026-02-15",
    description: "Cereal pest classifier with 3 CNN architectures",
  },
  {
    name: "proposalforge",
    firstCommit: "2026-02-21",
    lastCommit: "2026-02-26",
    description: "AI-powered proposal generation, LangGraph",
  },
  {
    name: "StratPlanTactics",
    firstCommit: "2026-02-24",
    lastCommit: "2026-02-25",
    description: "Strategic plan dashboard — 21 units, 337 tactics",
  },
];

export const methodologyNote =
  "Data for this report was collected from GitHub repository activity logs covering the period of February 1-26, 2026. Metrics include commit counts, lines of code added and deleted, files changed, pull requests, and issues. All line counts are based on git diff statistics and include code, configuration, documentation, and test files. The manual development time estimate is based on published industry benchmarks that place senior developer productivity at 100-150 lines of production-quality code per day (including associated design, testing, code review, and documentation time). This figure is consistent with research from sources such as The Mythical Man-Month and contemporary software engineering productivity studies. The productivity multiplier (10-16x) is derived by comparing the estimated traditional effort (1,586-2,379 developer-days) to the actual human effort (152 developer-days: 8 contributors x 19 working days). Repository data was gathered using the GitHub API and git clone statistics. Automated commits (Dependabot, GitHub Actions) are counted in commit totals but noted separately in contributor breakdowns.";

// ============================================================
// Adoption Phases
// ============================================================

export const adoptionPhases = [
  {
    phase: "Pre-Agentic",
    period: "Feb 1-5",
    avgCommitsPerDay: 2.6,
    avgNetLOCPerDay: 539,
  },
  {
    phase: "Tools Available",
    period: "Feb 6-11",
    avgCommitsPerDay: 8.5,
    avgNetLOCPerDay: 4681,
  },
  {
    phase: "Robison & Sheneman Adopt",
    period: "Feb 12-19",
    avgCommitsPerDay: 32.1,
    avgNetLOCPerDay: 14777,
  },
  {
    phase: "Full Team",
    period: "Feb 20-26",
    avgCommitsPerDay: 72.7,
    avgNetLOCPerDay: 12701,
  },
];

// ============================================================
// Shadow Applications
// ============================================================

export const shadowApplications = [
  { name: "Dissertation reformatting", owner: "Jerry McMurtry" },
  { name: "Strategic Plan Dashboard", owner: "Michele Bartlett" },
  { name: "Agentic AI coordination site", owner: "AISPEG" },
  { name: "RFD Career Dashboard", owner: "Carly Cummings" },
  { name: "Out of State Tax tool", owner: "Cretia Bunney" },
  { name: "SEM Experiential Learning Dashboard", owner: "Dean Kahler, SEM Vibe Coder in Chief" },
  { name: "Public Administration Education Tool", owner: "Michael Overton" },
  { name: "UCM Daily Register Newsletter Application", owner: "Jodi Walker" },
  { name: "GPSA Exhibition Judging Application", owner: "GPSA" },
  { name: "Process Mapping Dashboard", owner: "AI4RA" },
];

// ============================================================
// ORED Projects Leveraging Agentic AI
// ============================================================

export const oredProjects = [
  { name: "AI4RA UDM / Data Lakehouse", lead: "Layman", unit: "AI4RA", featured: true },
  { name: "Vandalizer", lead: "Brunsfeld", unit: "AI4RA", featured: true },
  { name: "MindRouter 2.0", lead: "Sheneman", unit: "RCDS", featured: true },
  { name: "OpenERA", lead: "Robison", unit: "AI4RA", featured: true },
  { name: "ProposalForge", lead: "Sheneman", unit: "RCDS", featured: false },
  { name: "Idaho Unfiltered", lead: "Child", unit: "RCDS", featured: false },
];

// ============================================================
// Current Constraints & Recommendations
// ============================================================

export const currentConstraints = [
  "Cultural resistance: 'Yeah, but...' framing limits exploration",
  "Cannot deploy the tools with university data and systems",
  "No approved deployment target for shadow applications increases risks and reduces ROI",
];

export const recommendations = [
  {
    title: "Framing and Culture",
    description: "YES, AND... — shift from resistance framing to additive exploration",
  },
  {
    title: "Internal Infrastructure",
    description: "Enterprise agreement(s) that allow us to securely use these tools with institutional data and systems. Institutional Ecosystem supporting templated development, testing, and deployment of Agentic AI coded applications.",
  },
  {
    title: "New Approach to SaaS",
    description: "Create and implement a plan for data repatriation alongside the governance and data modernization initiative. Open Source deployment into the higher ed sector is an opportunity for widespread impact.",
  },
];

// ============================================================
// Presentations & Reports
// ============================================================

export const presentations = [
  {
    id: "presidential-brief-feb-2026",
    title: "Agentic AI: Evidence of Impact, Current Constraints, and Recommendations",
    date: "February 7, 2026",
    author: "Barrie Robison",
    type: "Presidential Brief",
    audience: "University of Idaho Executive Leadership",
    description: "Briefing for executive leadership on the transformative potential and organizational risks of Agentic AI. Covers active ORED projects leveraging agentic AI, force multiplier evidence, institutional constraints, and near-term recommendations.",
    sections: [
      "ORED Projects Leveraging Agentic AI",
      "Evidence of Impact and Risk",
      "Software Development Force Multiplier",
      "Documentation, Governance, and Templates",
      "Shadow Applications",
      "Current Constraints",
      "Recommendations",
    ],
    sourceFile: "AgenticAIPresidentialBriefFeb26_2026_UITemplate.pdf",
  },
  {
    id: "dev-activity-report-feb-2026",
    title: "Development Activity Report: Agentic Development with Claude Code",
    date: "February 26, 2026",
    author: "Barrie Robison",
    type: "Activity Report",
    audience: "AISPEG / ORED Leadership",
    description: "Comprehensive analysis of software development activity across 11 GitHub repositories during Feb 1-26, 2026. Demonstrates extraordinary productivity levels achieved through agentic development tools. Includes repository-by-repository analysis, adoption timeline, productivity metrics, and methodology.",
    sections: [
      "Executive Summary",
      "Key Findings at a Glance",
      "Key Metrics",
      "Repository Summary",
      "Adoption Timeline & Acceleration Analysis",
      "Detailed Repository Analysis",
      "Methodology & Notes",
    ],
    sourceFile: "AgenticAIPresidentialBriefFeb26_2026_UITemplate.pdf",
  },
];

// ============================================================
// Principles
// ============================================================

export const principles = [
  {
    id: "core-principle",
    title: "Core Institutional Principle",
    summary: "Make the right thing easy, and the wrong thing difficult.",
    details:
      "Provide approved stacks, secure deployment paths, reusable patterns, and documentation standards. TEMPLATE-app (github.com/ui-insight/TEMPLATE-app) embodies this principle: clicking 'Use this template' on GitHub gives teams a project that inherits governance, security standards, CI/CD pipelines, and coding conventions automatically. Innovation scales within compliance when the environment is designed well.",
    category: "Foundation",
  },
  {
    id: "jobs-changing",
    title: "Jobs Are Changing, Not Disappearing",
    summary: "AI doesn't change WHY roles exist.",
    details:
      "WHY people's jobs exist hasn't really changed. WHAT they do and HOW they do it has absolutely changed. This applies across development, research administration, IT/OIT, and beyond. For RCDS, the devs are scared their jobs are threatened -- but this assumes demand stays the same while the cost of development approaches zero.",
    category: "Workforce",
  },
  {
    id: "demand-misconception",
    title: "The Demand Misconception",
    summary:
      "Fear assumes demand stays constant while productivity rises.",
    details:
      "An alternative future is that increased productivity and efficiency causes demand to increase in equal measure. Application cost decreases, development speed increases, experimentation increases, and demand increases. Same goes for research administration staff, OIT staff, etc. The result is more work -- different work.",
    category: "Workforce",
  },
  {
    id: "force-multiplier",
    title: "AI as a Mission Force Multiplier",
    summary: "Frame AI as amplifying mission outcomes.",
    details:
      "This should be framed as a force multiplier for mission-oriented outcomes of the university. Research productivity, administrative capacity, innovation throughput. Institutional intelligence and faster iteration loops. The research amplification effects of this technology are enormous.",
    category: "Strategy",
  },
  {
    id: "workflow-redesign",
    title: "Do Not Automate Broken Workflows",
    summary:
      'Don\'t ask "How can we make this workflow faster?"',
    details:
      'Connecting to old, outdated processes is not the way to go. Don\'t think "how can I make this workflow go faster." Think "WHY does this workflow exist and HOW SHOULD it happen?" Agentic AI rewards redesign over optimization.',
    category: "Implementation",
  },
  {
    id: "greenfield-brownfield",
    title: "Greenfield vs Brownfield AI",
    summary:
      "Most universities operate in brownfield reality.",
    details:
      'Greenfield means building an AI agent and its surrounding ecosystem entirely from scratch -- AI-native systems, clean APIs, zero technical debt, high autonomy. Brownfield involves injecting an AI agent into an existing software ecosystem -- legacy integration, adapters/RPA, navigating human interfaces, high friction but high value. Most universities operate in brownfield reality. In short, greenfield is about building an AI-native world, while brownfield is about teaching an AI to survive in a human-native world.',
    category: "Implementation",
  },
  {
    id: "start-small",
    title: "Start Small, Then Expand",
    summary: "Begin with a small ecosystem and trusted stack.",
    details:
      "Start with a small ecosystem and build out from there. TEMPLATE-app is the concrete starting point: a single approved stack validated through OpenERA, with governance and security baked in. New projects inherit all standards by default. As the institution matures, the template evolves. Demonstrate value with the first few projects, then scale outward as confidence and evidence accumulate.",
    category: "Implementation",
  },
  {
    id: "saas-pressure",
    title: "Market Implication: SaaS Pressure",
    summary:
      "As custom tool creation accelerates, SaaS value shifts.",
    details:
      "The SaaS companies need to either rapidly improve their products (without running into the ceiling of what a product of that type can actually do) or drastically reduce their prices. Institutions gain leverage in contract negotiations. Play hardball.",
    category: "Strategy",
  },
  {
    id: "thinking-too-small",
    title: "Most People Are Thinking Too Small",
    summary:
      "This isn't just automation -- it's capability expansion.",
    details:
      "Solution proliferation and rapid experimentation. The research amplification effects of this technology are enormous. This is capability expansion, not just automation.",
    category: "Strategy",
  },
];

// ============================================================
// Lessons Learned (enriched + new entries)
// ============================================================

export const lessons = [
  {
    id: "multi-agent-coordination",
    title: "Multi-Agent Coordination",
    context:
      "As you scale to multiple collaborators each running their own AI sessions, single-agent assumptions break quickly. You need coordination primitives.",
    recommendations: [
      "Define agent scope boundaries -- which files/domains can an agent modify without human review",
      "Establish conflict prevention -- branching protocols for agent-initiated work",
      "Create a skill registry and output contracts -- what format should agent-generated PRs follow",
      "Define handoff protocols -- when an agent hits a decision point, how should it escalate",
      "Set up multi-agent conflict resolution -- who wins when two agents touch the same file",
      "Use branch naming conventions for agent work (e.g., agent/claude/<feature>)",
    ],
    category: "Coordination",
  },
  {
    id: "explicit-agent-rules",
    title: "Explicit Agent Rules",
    context:
      "CLAUDE.md should contain normative rules, not just context. TEMPLATE-app's CLAUDE.md implements this lesson directly with a structured Agent Rules section containing 15 explicit constraints divided into 'Never Do' and 'Always Do' categories.",
    recommendations: [
      "Separate background context from normative MUST rules -- TEMPLATE-app's CLAUDE.md demonstrates this with distinct Agent Rules and Project Overview sections",
      "Codify naming conventions, pre-commit checks, terminology, and branching rules -- all present in TEMPLATE-app's Coding Conventions and Git Conventions sections",
      "Rules reduce drift across agents and collaborators -- TEMPLATE-app's 15 rules are shared across all projects created from the template",
      "Concrete examples now codified: NEVER add CSS component libraries (Rule 1), ALWAYS run tests before claiming work is complete (Rule 11), NEVER commit secrets (Rule 3), ALWAYS use feature branches (Rule 12)",
    ],
    category: "Governance",
  },
  {
    id: "preserve-architectural-intent",
    title: "Preserve Architectural Intent",
    context:
      "The 'why' behind decisions must be captured in a format agents can discover and reference. TEMPLATE-app implements this with a structured ADR framework at docs/architecture/adr.md.",
    recommendations: [
      "Capture 'why' via Architecture Decision Records -- TEMPLATE-app provides a template with Status, Context, Decision, and Consequences fields",
      "Seed ADRs included: ADR-001 (React + FastAPI stack selection) and ADR-002 (Tailwind CSS only, no component libraries) demonstrate the pattern",
      "Prevents accidental 'fixes' of intentional patterns -- agents encountering the Tailwind-only constraint can reference ADR-002 for rationale",
      "Store ADRs at docs/architecture/adr.md so agents find them automatically during project onboarding",
    ],
    category: "Architecture",
  },
  {
    id: "shadow-ai-governance",
    title: "Shadow AI & Governance",
    context:
      "Shadow AI applications are already emerging -- rapid experimentation happening outside governance structures. TEMPLATE-app is the institutional response: an approved starting point that makes governed development easier than ungoverned development.",
    recommendations: [
      "Acknowledge that shadow applications are being created across the institution",
      "TEMPLATE-app provides the approved stack and secure deployment path -- projects created from the template inherit governance, security, and CI standards automatically",
      "Make the right thing easy: 'Use this template' on GitHub gives teams a governed starting point with zero configuration overhead",
      "Institutional structures lag the technology -- TEMPLATE-app closes the gap by encoding standards into the project scaffold itself",
    ],
    category: "Governance",
  },
  {
    id: "resistance-to-change",
    title: "Resistance to Change",
    context:
      "Everyone is scared. Experienced developers have a hard time adjusting to these new tools because they keep getting in the way.",
    recommendations: [
      "Recognize that fear and uncertainty across technical teams is real and valid",
      "Experienced developers may struggle because existing skills feel threatened",
      "Frame changes as evolution of roles, not elimination -- WHY the job exists hasn't changed",
      "Start with willing early adopters, then expand through demonstrated value",
    ],
    category: "Culture",
  },
  {
    id: "agent-attribution",
    title: "Agent Attribution & Review",
    context:
      "When a human reviews an AI-generated PR, they need to know the level of AI involvement and what decisions were made autonomously. TEMPLATE-app's PR template and CONTRIBUTING.md formalize this.",
    recommendations: [
      "Classify contributions using TEMPLATE-app's PR template: Agent name, Authorship level (fully generated / agent-assisted / human-reviewed), Key decisions made by agent",
      "Include agent context in PRs -- the PR template has a dedicated Agent Context section for this information",
      "Co-Authored-By is a mandatory agent rule in CLAUDE.md: a constraint on every AI-assisted commit",
      "Label all AI-assisted pull requests with 'ai-assisted' per CONTRIBUTING.md guidelines",
    ],
    category: "Governance",
  },
];

// ============================================================
// Playbook Items (enriched + new entries)
// ============================================================

export const playbookItems = [
  {
    id: "agent-orchestrator",
    title: "The Agent Orchestrator Role",
    description:
      "A generalist with broad understanding. A systems thinker. A person who can clearly explain the function of a process and decompose its parts. Bridges domain experts, infrastructure, and agents.",
    category: "Roles",
  },
  {
    id: "guidelines-for-agents",
    title: "Guidelines for Agents, Not Just Humans",
    description:
      "TEMPLATE-app (github.com/ui-insight/TEMPLATE-app) codifies this principle with a comprehensive CLAUDE.md containing 15 normative agent rules: 8 'Never Do' constraints (no CSS component libraries, no class components, no committed secrets, no direct .env modification, no skipping type safety, no raw SQL, no unsolicited improvements, no premature abstraction) and 7 'Always Do' requirements (async patterns, Pydantic validation, run tests before completion, feature branches, Co-Authored-By attribution, follow existing patterns, document API endpoints). These rules are machine-readable constraints, not suggestions.",
    category: "Standards",
  },
  {
    id: "preferred-stacks",
    title: "Preferred Stacks by Project Type",
    description:
      "The approved stack for university business applications is defined in TEMPLATE-app: React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + React Router v7 (frontend); Python 3.11+ with FastAPI, async SQLAlchemy 2.0, Pydantic 2.x, PyJWT, bcrypt (backend); SQLite for development, PostgreSQL 16 for production; Docker/Docker Compose with nginx reverse proxy; MkDocs Material for documentation. Vitest for frontend testing, pytest/pytest-asyncio for backend testing. Ruff for Python linting, ESLint for TypeScript. OpenERA is the canonical reference implementation of this stack.",
    category: "Standards",
  },
  {
    id: "security-patterns",
    title: "Security & Deployment Patterns",
    description:
      "TEMPLATE-app defines concrete security standards: JWT (HS256) authentication, bcrypt password hashing, role-based access control (RBAC), Pydantic validation on all API inputs, and all secrets via environment variables. A 10-item production checklist covers SECRET_KEY rotation, DEV_MODE=false, PostgreSQL, HTTPS, rate limiting, and dependency auditing. Docker multi-stage builds with nginx reverse proxy handle deployment. An institutional security review checklist in docs/security/ covers system classification, data protection, network architecture, and compliance.",
    category: "Infrastructure",
  },
  {
    id: "multi-agent-framework",
    title: "Multi-Agent Coordination Framework",
    description:
      "Define agent scope boundaries (which files an agent can modify autonomously), conflict prevention protocols, skill registries, output contracts for PRs, decision escalation protocols, and branch naming for agent-initiated work (e.g., agent/claude/<feature>).",
    category: "Coordination",
  },
  {
    id: "skill-definition-template",
    title: "Skill Definition Template",
    description:
      "A standard template for defining new agent skills: Name, Trigger (when to invoke), Inputs, Outputs, Side effects (files modified, API calls), Safety constraints (what it must NOT do), and Validation (how to verify it worked).",
    category: "Coordination",
  },
  {
    id: "architecture-decision-records",
    title: "Architecture Decision Records (ADRs)",
    description:
      "TEMPLATE-app provides an ADR structure at docs/architecture/adr.md with a standard template: Title, Status (Accepted/Proposed/Deprecated/Superseded), Context, Decision, and Consequences. Two seed ADRs are included: ADR-001 (React + FastAPI stack selection) and ADR-002 (Tailwind CSS only, no component libraries). This machine-readable format prevents agents from accidentally 'fixing' intentional design choices and enables consistent onboarding for both humans and agents.",
    category: "Standards",
  },
  {
    id: "agent-attribution-review",
    title: "Agent Attribution & Review Protocol",
    description:
      "TEMPLATE-app formalizes this with a PR template that includes an Agent Context section with fields for Agent name, Authorship level (fully generated / agent-assisted / human-reviewed), and Key decisions made by agent. CONTRIBUTING.md requires ai-assisted labels on PRs and Co-Authored-By lines in commits. This is a mandatory agent rule, not a suggestion.",
    category: "Coordination",
  },
  {
    id: "ci-enforcement",
    title: "CI Enforcement for Agent Work",
    description:
      "TEMPLATE-app ships three GitHub Actions workflows. backend-test.yml: Ruff lint, Ruff format check, and pytest on Python 3.12 (triggered on backend/ changes). frontend-test.yml: ESLint with zero-warnings policy, TypeScript type checking (tsc -b), production build, and Vitest (triggered on frontend/ changes). security-scan.yml: pip-audit and npm audit running on push, PR, and weekly schedule. All three must pass before PR merge, ensuring agent-pushed changes are automatically validated against the full standard.",
    category: "Infrastructure",
  },
  {
    id: "data-governance-framework",
    title: "Data Governance Framework",
    description:
      "TEMPLATE-app defines a four-level data classification system aligned with university data governance policy: Public (no restrictions), Internal (requires authentication), Confidential (RBAC, encryption at rest recommended), and Restricted (PII/FERPA/HIPAA, encryption required, audit logging mandatory). Handling rules specify controls for each level across authentication, authorization, encryption, audit logging, retention, and disposal. A data inventory template tracks each data element's classification, storage location, access roles, and applicable regulations.",
    category: "Standards",
  },
  {
    id: "documentation-standards",
    title: "Documentation Standards",
    description:
      "Every project built from TEMPLATE-app must maintain: README.md (project overview and quick start), CLAUDE.md (agent context, kept current as the project evolves), CONTRIBUTING.md (contribution guidelines), SECURITY.md (vulnerability reporting), CODE_OF_CONDUCT.md, docs/architecture/ (system architecture and ADRs), docs/governance/ (data governance and classification), and docs/security/ (detailed security documentation and institutional review checklist). MkDocs Material provides a documentation site with navigation sections and code copy buttons.",
    category: "Standards",
  },
  {
    id: "project-structure-conventions",
    title: "Project Structure Conventions",
    description:
      "TEMPLATE-app enforces a one-file-per-resource pattern: backend/app/api/v1/{resource}.py for route handlers, backend/app/models/{resource}.py for SQLAlchemy ORM models, backend/app/schemas/{resource}.py for Pydantic schemas, and backend/app/services/ for business logic. Frontend mirrors this with src/api/ (one client module per resource), src/components/ (one component per file), src/pages/ (route pages), and src/types/ (TypeScript interfaces). Tests mirror source structure. This predictable layout enables agents to locate and modify code reliably.",
    category: "Standards",
  },
  {
    id: "coding-standards",
    title: "Coding Standards & Conventions",
    description:
      "Backend: Ruff for linting and formatting (line length 88), snake_case for functions/variables, PascalCase for classes. Frontend: ESLint with zero-warnings policy, tsc -b must pass, functional components with hooks only, Tailwind CSS utility classes exclusively (no CSS component libraries, no CSS modules, no inline styles), PascalCase for components, camelCase for functions/variables. Git: feature/fix/docs branch naming, imperative mood commit messages, all changes through pull requests, CI must pass before merge.",
    category: "Standards",
  },
];

// ============================================================
// Knowledge Base Articles
// ============================================================

export const knowledgeArticles = [
  {
    title: "Shadow AI Applications",
    summary:
      "Shadow AI applications are already emerging across the institution. Rapid experimentation is happening outside governance structures, creating both risk and opportunity. Numerous shadow applications have been created -- this is an 'uh oh' moment that demands proactive institutional response with approved stacks and secure deployment paths.",
    tags: ["governance", "risk", "adoption"],
    category: "Context",
  },
  {
    title: "Immediate Institutional Reality",
    summary:
      "Everyone is scared. Fear and uncertainty across technical teams is real. Experienced developers have a hard time adjusting to these new tools. Institutional structures lag the technology. Luke is connecting agent tools to on-prem infrastructure and secure models to close this gap.",
    tags: ["institutional", "adoption", "security"],
    category: "Context",
  },
  {
    title: "Agent Orchestrator Role Definition",
    summary:
      "A generalist with broad understanding. A systems thinker. A person who can clearly explain the function of a process and decompose its parts. Bridges domain experts, infrastructure, and agents. This is a new institutional role that doesn't map cleanly to existing job descriptions.",
    tags: ["roles", "agents", "workforce"],
    category: "Roles",
  },
  {
    title: "Greenfield vs Brownfield AI -- Deep Dive",
    summary:
      "Terms borrowed from urban planning with crucial meanings in agentic AI. Greenfield: building from scratch with AI-native tooling, zero technical debt, and high autonomy -- but you must build everything yourself. Brownfield: injecting AI into existing systems with legacy integration, adapters/RPA, and high friction -- but high value automating existing workflows. Most universities operate in brownfield reality. Greenfield is building an AI-native world; brownfield is teaching AI to survive in a human-native world.",
    tags: ["architecture", "strategy", "implementation", "greenfield", "brownfield"],
    category: "Architecture",
  },
  {
    title: "SaaS Market Implications",
    summary:
      "As custom tool creation accelerates, SaaS value shifts dramatically. The SaaS companies need to either rapidly improve their products (without running into the ceiling of what a product of that type can actually do) or drastically reduce their prices. Institutions gain leverage in contract negotiations -- play hardball.",
    tags: ["market", "strategy", "procurement"],
    category: "Strategy",
  },
  {
    title: "Research Amplification",
    summary:
      "This isn't just automation -- it's capability expansion. Most people are thinking too small. Solution proliferation and rapid experimentation. The research amplification effects of this technology are enormous. Frame this as a force multiplier for mission-oriented outcomes.",
    tags: ["research", "strategy", "impact"],
    category: "Strategy",
  },
  {
    title: "Multi-Agent Coordination Recommendations",
    summary:
      "Many priority items are now codified in TEMPLATE-app (github.com/ui-insight/TEMPLATE-app). Completed: formalized CLAUDE.md with 15 normative rules, three CI workflows (backend-test, frontend-test, security-scan), CONTRIBUTING.md and SECURITY.md at root level, PR template with agent attribution section, ADR structure in docs/architecture/adr.md, and ESLint/Ruff linting enforcement in CI. Remaining for project-level implementation: skill definition templates, onboarding guides with AI tooling setup, and agent coordination docs specific to each project's domain.",
    tags: ["coordination", "agents", "governance", "ci", "template-app"],
    category: "Coordination",
  },
  {
    title: "OpenERA Scope Analysis",
    summary:
      "A full-stack research administration platform rated medium-high to high complexity. 338 tracked files, 41,154 source LOC, 363 pytest tests, 27 ORM tables, 24 route files with 94 handlers. Covers pre-award proposal workflow, role-based auth, budget planning with Excel import/export, document upload pipelines, and compliance review engines. Solo-dev estimate without AI: 9-14 months for comparable breadth.",
    tags: ["projects", "analysis", "complexity", "openera"],
    category: "Projects",
  },
  {
    title: "Productivity Multiplier Methodology",
    summary:
      "The 10-15x multiplier is based on industry benchmarks placing senior developer productivity at 100-150 lines of production-quality code per day (including design, testing, debugging, and documentation). This is consistent with The Mythical Man-Month and contemporary studies. The multiplier compares the actual 19-day delivery window against the estimated 6-9 month manual timeline, adjusted for 2-3 active contributors assisted by agentic AI tools.",
    tags: ["metrics", "methodology", "productivity"],
    category: "Metrics",
  },
  {
    title: "Repository Profiles",
    summary:
      "Seven repositories spanning ML/AI, full-stack web, DevOps, and research tools. Includes deep learning ensembles (WildVE, CerealPestAID), reinforcement learning (skillbag), LangGraph agent pipelines (proposalforge), GPU-aware microservice orchestration (mindrouter2), institutional workflows (OpenERA), and AI document processing (dissertation). Each represents production-grade software with Docker deployment, testing suites, and professional documentation.",
    tags: ["projects", "repositories", "overview"],
    category: "Projects",
  },
  {
    title: "Demand Dynamics in AI-Augmented Teams",
    summary:
      "For RCDS, the devs are scared their jobs are threatened. This assumes demand stays the same while the cost of app-layer development approaches zero. An alternative future: increased productivity and efficiency causes demand to increase in equal measure. WHY people's jobs exist hasn't changed -- WHAT and HOW have absolutely changed. Same applies to RA staff, OIT staff, and beyond.",
    tags: ["workforce", "demand", "strategy", "culture"],
    category: "Strategy",
  },
  {
    title: "TEMPLATE-app: Institutional Standards Template",
    summary:
      "TEMPLATE-app (github.com/ui-insight/TEMPLATE-app) is a GitHub template repository that codifies the University of Idaho's standards for AI-assisted application development. It provides a production-ready starting point with an approved tech stack (React 19 + FastAPI), 15 normative agent rules in CLAUDE.md, three CI/CD workflows, a data governance framework with four classification levels, security standards including JWT auth and a 10-item production checklist, MkDocs documentation structure, and coding conventions. Projects are created by clicking 'Use this template' on GitHub. OpenERA is the canonical reference implementation.",
    tags: ["template-app", "standards", "governance", "infrastructure"],
    category: "Standards",
  },
  {
    title: "Approved Tech Stack for University Applications",
    summary:
      "The TEMPLATE-app approved stack for university business applications: Frontend uses React 19, TypeScript, Vite 7, Tailwind CSS v4, React Router v7, and Vitest. Backend uses Python 3.11+, FastAPI, async SQLAlchemy 2.0, Pydantic 2.x, PyJWT with bcrypt for auth, and pytest. Infrastructure includes SQLite for development (zero config), PostgreSQL 16 for production, Docker/Docker Compose for deployment, nginx for reverse proxy, and MkDocs Material for documentation. Linting via Ruff (Python) and ESLint (TypeScript). This stack was validated through OpenERA development.",
    tags: ["tech-stack", "template-app", "standards", "architecture"],
    category: "Standards",
  },
  {
    title: "Data Governance Framework",
    summary:
      "TEMPLATE-app defines four data classification levels: Public (no restrictions), Internal (requires authentication), Confidential (RBAC, encryption at rest recommended), and Restricted (PII/FERPA/HIPAA, encryption required, audit logging mandatory). Core principles: classify before storing, minimize collection, document lineage, and secure by default. Handling rules specify authentication, authorization, encryption, audit logging, retention, and disposal requirements for each classification level. Never store SSNs, dates of birth, or banking information unless absolutely required.",
    tags: ["governance", "data", "security", "compliance", "template-app"],
    category: "Governance",
  },
  {
    title: "Security Standards & Production Checklist",
    summary:
      "TEMPLATE-app security architecture: JWT (HS256) token authentication, bcrypt password hashing, RBAC authorization, Pydantic input validation on all endpoints, and CORS restricted to known origins. Dependency security via Dependabot, pip-audit, and npm audit in CI. The production checklist requires: SECRET_KEY changed from default, DEV_MODE=false, PostgreSQL configured, CORS restricted, HTTPS enabled, file upload limits set, rate limiting configured, logging enabled, and dependency audits passing. An institutional security review checklist covers 10 categories for IT team evaluation.",
    tags: ["security", "production", "template-app", "compliance"],
    category: "Security",
  },
  {
    title: "CI/CD Pipeline Standards",
    summary:
      "TEMPLATE-app ships three GitHub Actions workflows. backend-test.yml runs on backend/ changes: Ruff lint check, Ruff format check, and pytest. frontend-test.yml runs on frontend/ changes: ESLint with --max-warnings 0, TypeScript type check (tsc -b), production build, and Vitest. security-scan.yml runs on all pushes, PRs, and weekly: pip-audit on Python dependencies and npm audit at high severity. All three pipelines must pass before merging, ensuring both human and agent contributions meet quality and security gates.",
    tags: ["ci", "testing", "infrastructure", "template-app"],
    category: "Infrastructure",
  },
  {
    title: "Coding Standards & Conventions",
    summary:
      "TEMPLATE-app coding standards: Python backend uses Ruff for linting and formatting (line-length 88), snake_case for functions/variables, PascalCase for classes. TypeScript frontend uses ESLint with zero-warnings policy, functional components with hooks only, Tailwind utility classes exclusively (no CSS component libraries, no CSS modules, no inline styles), PascalCase for components, camelCase for functions/variables. One file per resource for models, schemas, routes, and API clients. Git workflow uses feature/fix/docs branch naming, imperative mood commits, and mandatory PR review with CI passage.",
    tags: ["standards", "coding", "conventions", "template-app"],
    category: "Standards",
  },
  {
    title: "Shadow APPocalypse: Emerging Applications",
    summary:
      "At least 10 shadow applications have been created across the institution by non-developers leveraging agentic AI tools. These include dissertation reformatting, strategic plan dashboards, career dashboards, tax tools, experiential learning dashboards, newsletter applications, exhibition judging apps, and process mapping dashboards. This demonstrates both the opportunity and risk — these tools empower rapid creation but lack institutional governance and approved deployment targets.",
    tags: ["shadow-ai", "governance", "risk", "applications"],
    category: "Context",
  },
  {
    title: "Current Institutional Constraints",
    summary:
      "Three key constraints limit agentic AI adoption at the university: (1) Cultural resistance framed as 'Yeah, but...' limiting exploration, (2) inability to deploy tools with university data and systems due to lack of enterprise agreements, and (3) no approved deployment target for shadow applications, which increases risks and reduces ROI. These constraints are addressable through framing shifts, infrastructure agreements, and a new approach to SaaS.",
    tags: ["constraints", "institutional", "governance", "infrastructure"],
    category: "Context",
  },
  {
    title: "Adoption Timeline & Acceleration Analysis",
    summary:
      "Agentic tools were not available uniformly across the Feb 1-26 reporting period. Three inflection points shaped development activity: Feb 6 (Anthropic released Opus 4.6 and Codex 5.3), Feb 12 (Robison and Sheneman began actively using agentic tools), and Feb 20 (Layman gained full access). Commit velocity accelerated from 2.6/day pre-agentic to 72.7/day with the full team, a 28x increase in daily commit rate.",
    tags: ["adoption", "metrics", "productivity", "timeline"],
    category: "Metrics",
  },
  {
    title: "ORED Projects Leveraging Agentic AI",
    summary:
      "Six significant ORED projects are actively leveraging agentic AI: AI4RA UDM / Data Lakehouse (Layman, AI4RA), Vandalizer (Brunsfeld, AI4RA), MindRouter 2.0 (Sheneman, RCDS), OpenERA (Robison, AI4RA), ProposalForge (Sheneman, RCDS), and Idaho Unfiltered (Child, RCDS). These span document intelligence, data infrastructure, GPU orchestration, research administration, proposal generation, and media analysis.",
    tags: ["projects", "ored", "ai4ra", "rcds"],
    category: "Projects",
  },
  {
    title: "Presidential Brief Recommendations",
    summary:
      "Three recommendations from the Feb 2026 presidential brief: (1) Framing and Culture — shift to 'YES, AND...' approach rather than resistance framing. (2) Internal Infrastructure — establish enterprise agreements for secure use of agentic tools with institutional data and systems, build ecosystem for templated development, testing, and deployment. (3) New Approach to SaaS — implement data repatriation alongside governance modernization; leverage open source deployment for widespread higher-ed impact.",
    tags: ["recommendations", "strategy", "institutional", "infrastructure"],
    category: "Strategy",
  },
];

// ============================================================
// Strategic Takeaways & Institutional Question
// ============================================================

export const strategicTakeaways = [
  "AI is a force multiplier, not a job replacer",
  "Demand for tools will increase",
  "Redesign workflows; don't automate broken ones",
  "Agent orchestration is a new institutional role",
  "Start small and scale safely",
  "Standardized templates enable safe scaling across teams",
];

export const institutionalQuestion = {
  wrong: "Should we adopt AI?",
  right: "How do we design an institution where agents safely amplify our mission?",
};

// ============================================================
// Institutional Standards Roadmap
// ============================================================

export const standardsRoadmapSource = {
  document: "AI Next Steps March 2026",
  author: "VP of OIT",
  date: "March 2026",
  description:
    "Call to develop and enforce institutional standards across seven key areas to support safe, scalable AI adoption at the University of Idaho.",
};

export const institutionalStandards = [
  {
    id: "code-development",
    name: "Code Development",
    description:
      "Standards for writing, reviewing, and maintaining code produced by both humans and AI agents. Covers approved stacks, coding conventions, project structure, and agent-specific rules.",
    currentStatus: "Strong" as const,
    existsToday: [
      "TEMPLATE-app defines approved stack (React 19 + FastAPI)",
      "CLAUDE.md with 15 normative agent rules",
      "Coding conventions codified (Ruff, ESLint, naming patterns)",
      "Project structure conventions (one-file-per-resource)",
      "OpenERA serves as canonical reference implementation",
    ],
    gapsToFill: [
      "Formal adoption mandate across all new projects",
      "Version-pinning policy for stack components",
      "Automated template compliance checking",
    ],
    owner: "AISPEG / RCDS",
    enforcement: "CI/CD pipelines (backend-test, frontend-test workflows), PR review",
    phase: "Phase 1" as const,
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description:
      "Security architecture, authentication patterns, data classification, vulnerability management, and production hardening standards.",
    currentStatus: "Strong" as const,
    existsToday: [
      "JWT + bcrypt auth pattern in TEMPLATE-app",
      "Four-level data classification framework",
      "Security scan CI workflow (pip-audit, npm audit)",
      "10-item production checklist",
      "SECURITY.md and institutional review checklist",
    ],
    gapsToFill: [
      "Penetration testing cadence for deployed applications",
      "Incident response playbook for AI-generated vulnerabilities",
      "Secret rotation automation",
    ],
    owner: "OIT Security / AISPEG",
    enforcement:
      "security-scan.yml CI workflow, institutional security review checklist, pre-deployment audit",
    phase: "Phase 1" as const,
  },
  {
    id: "documentation",
    name: "Documentation",
    description:
      "Standards for project documentation, architecture decision records, agent context files, and knowledge management.",
    currentStatus: "Strong" as const,
    existsToday: [
      "Required files: README, CLAUDE.md, CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT",
      "ADR framework at docs/architecture/adr.md",
      "MkDocs Material documentation site structure",
      "Data governance docs at docs/governance/",
    ],
    gapsToFill: [
      "Documentation completeness scoring / audit tool",
      "Living documentation update cadence policy",
      "Cross-project documentation index",
    ],
    owner: "AISPEG",
    enforcement: "PR checklist, CI documentation build verification",
    phase: "Phase 1" as const,
  },
  {
    id: "qa-testing",
    name: "QA / Testing",
    description:
      "Testing standards for agent-generated code, including unit tests, integration tests, and quality gates.",
    currentStatus: "Moderate" as const,
    existsToday: [
      "Vitest for frontend, pytest for backend in TEMPLATE-app",
      "CI enforces test passage before merge",
      "ESLint zero-warnings policy",
    ],
    gapsToFill: [
      "Minimum code coverage thresholds",
      "Integration and end-to-end testing standards",
      "Agent-specific testing requirements (validation of AI-generated output)",
      "Performance and load testing standards",
      "Test data management policy",
    ],
    owner: "RCDS / Project Leads",
    enforcement: "CI coverage gates, PR review checklist, quarterly quality audits",
    phase: "Phase 2" as const,
  },
  {
    id: "accessibility",
    name: "Accessibility",
    description:
      "Web accessibility standards ensuring all university applications meet WCAG compliance and inclusive design principles.",
    currentStatus: "Moderate" as const,
    existsToday: [
      "Tailwind CSS provides accessible primitives",
      "Semantic HTML encouraged in coding conventions",
      "eslint-plugin-jsx-a11y enforced in ESLint config (alt-text, ARIA props, roles, headings)",
      "CI workflow runs accessibility linting on every push and PR",
    ],
    gapsToFill: [
      "WCAG 2.1 AA compliance standard definition",
      "Runtime accessibility testing (axe-core, Pa11y) beyond static analysis",
      "Accessibility review checklist for PR process",
      "Screen reader testing protocol",
      "Color contrast and keyboard navigation standards",
      "Training materials for accessible development",
    ],
    owner: "UX Lead / AISPEG",
    enforcement: "eslint-plugin-jsx-a11y in CI, manual review checklist, annual audit",
    phase: "Phase 2" as const,
  },
  {
    id: "user-experience",
    name: "User Experience",
    description:
      "UX design standards, component patterns, and user research practices for consistent, high-quality interfaces across applications.",
    currentStatus: "Weak" as const,
    existsToday: [
      "Tailwind CSS v4 as standard styling framework",
      "University of Idaho color palette (Gold, Charcoal)",
      "Functional component patterns established",
    ],
    gapsToFill: [
      "Shared UI component library or pattern guide",
      "Design system documentation (spacing, typography, interaction patterns)",
      "User research and usability testing protocol",
      "Responsive design breakpoint standards",
      "Loading state and error handling UX patterns",
    ],
    owner: "AISPEG / UX Committee",
    enforcement: "Design review in PR process, pattern library compliance checks",
    phase: "Phase 3" as const,
  },
  {
    id: "integration",
    name: "Integration",
    description:
      "Standards for API design, inter-system communication, data exchange formats, and third-party integrations.",
    currentStatus: "Missing" as const,
    existsToday: [
      "FastAPI provides OpenAPI spec generation",
      "Pydantic validation on API inputs",
      "AI4RA UDM establishing shared data standards",
    ],
    gapsToFill: [
      "API design guide (RESTful conventions, versioning, pagination)",
      "Authentication standards for inter-service communication",
      "Data exchange format standards (JSON schemas, contract testing)",
      "Integration testing framework",
      "Third-party API governance (approval, monitoring, fallback)",
      "Event-driven architecture patterns for cross-system workflows",
    ],
    owner: "RCDS / Infrastructure Team",
    enforcement: "API contract tests in CI, integration review board, API registry",
    phase: "Phase 3" as const,
  },
];

export const standardsPhases = [
  {
    name: "Phase 1: Formalize Existing Standards",
    window: "Q1–Q2 2026",
    status: "in-progress" as const,
    goal: "Document, publish, and enforce standards that already exist in practice through TEMPLATE-app and the playbook.",
    standards: ["Code Development", "Cybersecurity", "Documentation"],
    deliverables: [
      "Published standards documents for each area with clear ownership",
      "All three standards enforced via CI/CD across active projects",
      "Compliance dashboard tracking adoption across repositories",
      "Training materials for onboarding new projects to standards",
    ],
  },
  {
    name: "Phase 2: Fill Critical Gaps",
    window: "Q2–Q3 2026",
    status: "next" as const,
    goal: "Address high-risk gaps in testing and accessibility that could create liability or quality issues at scale.",
    standards: ["QA / Testing", "Accessibility"],
    deliverables: [
      "Code coverage thresholds enforced in CI for all projects",
      "WCAG 2.1 AA compliance checklist integrated into PR process",
      "Automated accessibility testing added to CI pipelines",
      "End-to-end testing framework selected and documented",
    ],
  },
  {
    name: "Phase 3: Build from Scratch",
    window: "Q3–Q4 2026",
    status: "planned" as const,
    goal: "Develop strategic, higher-effort standards for UX consistency and system integration that require broader institutional coordination.",
    standards: ["User Experience", "Integration"],
    deliverables: [
      "UI pattern library or design system published",
      "API design guide and contract testing framework operational",
      "Integration review board established",
      "Cross-project UX consistency audit completed",
    ],
  },
];

// ============================================================
// Formal Standard Documents (Phase 1)
// ============================================================

export const standardDocuments = [
  {
    id: "code-development",
    title: "Code Development Standard",
    version: "1.0",
    effectiveDate: "March 2026",
    lastReviewed: "March 6, 2026",
    owner: "AISPEG / RCDS",
    scope:
      "All software development projects at the University of Idaho that use AI-assisted or agentic development workflows. Applies to both human developers and AI agents.",
    sections: [
      {
        heading: "Approved Technology Stack",
        content: [
          "All new university business applications must use the approved stack defined in TEMPLATE-app (github.com/ui-insight/TEMPLATE-app)",
          "Frontend: React 19, TypeScript, Vite 7, Tailwind CSS v4, React Router v7",
          "Backend: Python 3.11+, FastAPI, async SQLAlchemy 2.0, Pydantic 2.x, PyJWT, bcrypt",
          "Database: SQLite for development, PostgreSQL 16 for production",
          "Infrastructure: Docker / Docker Compose with nginx reverse proxy",
          "Documentation: MkDocs Material",
          "Testing: Vitest (frontend), pytest / pytest-asyncio (backend)",
          "Linting: Ruff (Python), ESLint (TypeScript)",
          "OpenERA is the canonical reference implementation of this stack",
        ],
      },
      {
        heading: "Coding Conventions",
        content: [
          "Backend: Ruff for linting and formatting (line-length 88), snake_case for functions and variables, PascalCase for classes",
          "Frontend: ESLint with zero-warnings policy, tsc -b must pass, functional components with hooks only, Tailwind CSS utility classes exclusively (no CSS component libraries, no CSS modules, no inline styles), PascalCase for components, camelCase for functions and variables",
          "Git workflow: feature/fix/docs branch naming, imperative mood commit messages, all changes through pull requests, CI must pass before merge",
        ],
      },
      {
        heading: "Project Structure",
        content: [
          "All projects must follow the one-file-per-resource pattern defined in TEMPLATE-app:",
          "Backend: backend/app/api/v1/{resource}.py for routes, backend/app/models/{resource}.py for ORM models, backend/app/schemas/{resource}.py for Pydantic schemas, backend/app/services/ for business logic",
          "Frontend: src/api/ (one client module per resource), src/components/ (one component per file), src/pages/ (route pages), src/types/ (TypeScript interfaces)",
          "Tests must mirror the source structure",
        ],
      },
      {
        heading: "Agent Rules (CLAUDE.md)",
        content: [
          "Every project must include a CLAUDE.md file with normative agent rules. The TEMPLATE-app standard includes 15 rules:",
          "Never Do: No CSS component libraries, no class components, no committed secrets, no direct .env modification, no skipping type safety, no raw SQL, no unsolicited improvements, no premature abstraction",
          "Always Do: Use async patterns, Pydantic validation on all inputs, run tests before completion, use feature branches, include Co-Authored-By attribution, follow existing patterns, document API endpoints",
          "These are machine-readable constraints, not suggestions. Agents that violate them fail review.",
        ],
      },
      {
        heading: "Architecture Decision Records",
        content: [
          "All significant technical decisions must be recorded as ADRs in docs/architecture/adr.md",
          "ADR template: Title, Status (Accepted/Proposed/Deprecated/Superseded), Context, Decision, Consequences",
          "ADRs prevent agents from accidentally overriding intentional design choices and enable consistent onboarding",
        ],
      },
      {
        heading: "Agent Attribution & Review",
        content: [
          "All AI-assisted contributions must include proper attribution:",
          "PRs must use the agent context template: Agent name, Authorship level (fully generated / agent-assisted / human-reviewed), Key decisions made by agent",
          "Commits must include Co-Authored-By lines for agent contributions",
          "PRs must carry an ai-assisted label",
        ],
      },
      {
        heading: "CI/CD Enforcement",
        content: [
          "Three GitHub Actions workflows must be active on all projects:",
          "backend-test.yml: Ruff lint, Ruff format check, pytest (triggered on backend/ changes)",
          "frontend-test.yml: ESLint with zero-warnings, TypeScript type check (tsc -b), production build, Vitest (triggered on frontend/ changes)",
          "security-scan.yml: pip-audit and npm audit (triggered on push, PR, and weekly schedule)",
          "All three must pass before PR merge. No exceptions.",
        ],
      },
    ],
    enforcement:
      "CI/CD pipelines automatically enforce coding standards, linting, type checking, and test passage. PRs require human review with agent attribution. Non-compliant code cannot be merged.",
    references: [
      {
        label: "TEMPLATE-app Repository",
        href: "https://github.com/ui-insight/TEMPLATE-app",
      },
      {
        label: "OpenERA Reference Implementation",
        href: "https://github.com/ui-insight/OpenERA",
      },
    ],
    relatedPlaybookIds: [
      "preferred-stacks",
      "coding-standards",
      "project-structure-conventions",
      "guidelines-for-agents",
      "ci-enforcement",
      "architecture-decision-records",
      "agent-attribution-review",
    ],
    relatedKnowledgeTitles: [
      "TEMPLATE-app: Institutional Standards Template",
      "Approved Tech Stack for University Applications",
      "Coding Standards & Conventions",
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Standard",
    version: "1.0",
    effectiveDate: "March 2026",
    lastReviewed: "March 6, 2026",
    owner: "OIT Security / AISPEG",
    scope:
      "All applications developed or deployed by University of Idaho units that handle institutional data. Applies to both new development and existing systems undergoing AI-enabled modernization.",
    sections: [
      {
        heading: "Authentication & Authorization",
        content: [
          "JWT (HS256) token-based authentication is the standard pattern",
          "Passwords must be hashed with bcrypt — no plaintext or reversible encryption",
          "Role-based access control (RBAC) must be implemented for all multi-user applications",
          "CORS must be restricted to known origins in production",
          "All secrets must be stored in environment variables — never committed to source control",
        ],
      },
      {
        heading: "Data Classification",
        content: [
          "All data must be classified before storage using the four-level framework:",
          "Public: No restrictions on access",
          "Internal: Requires authentication to access",
          "Confidential: Requires RBAC, encryption at rest recommended",
          "Restricted (PII/FERPA/HIPAA): Encryption required, audit logging mandatory",
          "Classify before storing, minimize collection, document lineage, secure by default",
          "Never store SSNs, dates of birth, or banking information unless absolutely required and justified",
        ],
      },
      {
        heading: "Data Handling Rules",
        content: [
          "Each classification level specifies controls across six dimensions:",
          "Authentication: Who can access (none / authenticated users / authorized roles / named individuals)",
          "Authorization: How access is controlled (open / role-based / attribute-based / explicit approval)",
          "Encryption: At rest and in transit requirements per level",
          "Audit logging: Required for Confidential and Restricted data",
          "Retention: Data retention schedules must be documented",
          "Disposal: Secure deletion procedures for each classification level",
        ],
      },
      {
        heading: "Input Validation & API Security",
        content: [
          "Pydantic validation is required on all API inputs — no unvalidated data enters the system",
          "File upload limits must be configured",
          "Rate limiting must be enabled on all public-facing endpoints",
          "HTTPS is required for all production deployments",
        ],
      },
      {
        heading: "Production Checklist",
        content: [
          "Before any application goes to production, all 10 items must be verified:",
          "SECRET_KEY changed from default and rotated",
          "DEV_MODE set to false",
          "PostgreSQL configured (not SQLite)",
          "CORS restricted to known origins",
          "HTTPS enabled",
          "File upload limits configured",
          "Rate limiting enabled",
          "Logging enabled and configured",
          "Dependency audits passing (pip-audit, npm audit)",
          "Institutional security review checklist completed",
        ],
      },
      {
        heading: "Dependency Security",
        content: [
          "Dependabot must be enabled on all repositories",
          "pip-audit (Python) and npm audit (JavaScript) run in CI on every push, PR, and weekly",
          "High-severity vulnerabilities must be addressed before merge",
          "Dependencies should be pinned to specific versions in production",
        ],
      },
      {
        heading: "Institutional Security Review",
        content: [
          "An institutional security review checklist in docs/security/ covers 10 categories:",
          "System classification, data protection scope, network architecture, authentication mechanisms, authorization model, encryption standards, audit logging, incident response contacts, compliance requirements, and deployment security",
          "This review must be completed before production deployment and updated annually",
        ],
      },
    ],
    enforcement:
      "security-scan.yml CI workflow runs automated dependency audits on every push and PR. The production checklist is verified before deployment. Institutional security review is required for all production applications.",
    references: [
      {
        label: "TEMPLATE-app Security Patterns",
        href: "https://github.com/ui-insight/TEMPLATE-app",
      },
    ],
    relatedPlaybookIds: ["security-patterns", "data-governance-framework"],
    relatedKnowledgeTitles: [
      "Data Governance Framework",
      "Security Standards & Production Checklist",
      "CI/CD Pipeline Standards",
    ],
  },
  {
    id: "documentation",
    title: "Documentation Standard",
    version: "1.0",
    effectiveDate: "March 2026",
    lastReviewed: "March 6, 2026",
    owner: "AISPEG",
    scope:
      "All software projects developed under AISPEG coordination. Applies to both new projects created from TEMPLATE-app and existing projects being brought into compliance.",
    sections: [
      {
        heading: "Required Project Files",
        content: [
          "Every project must maintain the following files at the repository root:",
          "README.md — Project overview, purpose, quick start instructions, and tech stack summary",
          "CLAUDE.md — Agent context file with normative rules, kept current as the project evolves. This is the primary interface between the project and AI agents.",
          "CONTRIBUTING.md — Contribution guidelines, branch naming, PR process, and agent attribution requirements",
          "SECURITY.md — Vulnerability reporting procedures and security contact information",
          "CODE_OF_CONDUCT.md — Expected behavior standards for contributors",
        ],
      },
      {
        heading: "Architecture Documentation",
        content: [
          "All projects must maintain architecture documentation in docs/architecture/:",
          "System architecture overview with component diagrams",
          "Architecture Decision Records (ADRs) using the standard template: Title, Status, Context, Decision, Consequences",
          "ADRs must be created for all significant technical decisions — they are the institutional memory of why choices were made",
          "Two seed ADRs are required: stack selection rationale and styling approach rationale",
        ],
      },
      {
        heading: "Governance Documentation",
        content: [
          "Projects handling institutional data must maintain governance docs in docs/governance/:",
          "Data governance documentation including data classification for all data elements",
          "Data inventory tracking each element's classification, storage location, access roles, and applicable regulations",
          "Compliance documentation for applicable regulations (FERPA, HIPAA, etc.)",
        ],
      },
      {
        heading: "Security Documentation",
        content: [
          "All projects must maintain security documentation in docs/security/:",
          "Detailed security architecture and authentication flow",
          "Institutional security review checklist (10 categories)",
          "Incident response contacts and procedures",
        ],
      },
      {
        heading: "Documentation Site",
        content: [
          "MkDocs Material is the standard documentation site generator",
          "Documentation sites must include navigation sections, code copy buttons, and search functionality",
          "Documentation must be buildable from the repository (no external dependencies for viewing)",
        ],
      },
      {
        heading: "CLAUDE.md Standards",
        content: [
          "The CLAUDE.md file is a critical institutional artifact — it defines how AI agents interact with the project:",
          "Must include project overview and tech stack",
          "Must include normative rules (Never Do / Always Do) specific to the project",
          "Must be updated when project conventions change — stale CLAUDE.md files cause agent errors",
          "Must reference ADRs for major design decisions so agents understand constraints",
          "Should include development commands, deployment instructions, and testing expectations",
        ],
      },
    ],
    enforcement:
      "PR review checklist verifies documentation is updated alongside code changes. CI documentation build verification ensures docs compile. CLAUDE.md currency is checked during sprint reviews.",
    references: [
      {
        label: "TEMPLATE-app Documentation Structure",
        href: "https://github.com/ui-insight/TEMPLATE-app",
      },
    ],
    relatedPlaybookIds: ["documentation-standards", "architecture-decision-records"],
    relatedKnowledgeTitles: [
      "TEMPLATE-app: Institutional Standards Template",
      "Multi-Agent Coordination Recommendations",
    ],
  },
];

export const standardsSuccessMetrics = [
  {
    metric: "Standards Coverage",
    target: "All 7 standard areas have published, versioned documentation",
    measureBy: "Q4 2026",
  },
  {
    metric: "CI Enforcement",
    target: "100% of active projects enforce applicable standards via automated CI gates",
    measureBy: "Q3 2026",
  },
  {
    metric: "Compliance Rate",
    target: "All new projects created from TEMPLATE-app pass standards audit at launch",
    measureBy: "Q2 2026",
  },
  {
    metric: "Accessibility Baseline",
    target: "All public-facing applications pass WCAG 2.1 AA automated checks",
    measureBy: "Q4 2026",
  },
  {
    metric: "Integration Maturity",
    target: "API design guide adopted by at least 3 inter-system integrations",
    measureBy: "Q4 2026",
  },
];
