// ============================================================
// Key Metrics
// ============================================================

export const keyMetrics = {
  totalCommits: 248,
  netNewLines: 142095,
  totalLinesAdded: 154491,
  totalLinesDeleted: 12396,
  uniqueFiles: 878,
  activeRepos: 8,
  pullRequests: 48,
  issuesTracked: 90,
  calendarDays: 19,
  contributors: 3,
  commitsPerDay: 13,
  linesPerDay: 7500,
  productivityMultiplier: "10-15x",
  manualEstimate: "6-9 months",
};

// ============================================================
// Projects (enriched with activity report detail)
// ============================================================

export const projects = [
  {
    name: "OpenERA",
    daysActive: 6,
    netNewLines: 81344,
    linesAdded: 88604,
    linesDeleted: 7260,
    filesChanged: 354,
    commits: 129,
    contributors: "ProfessorPolymorphic (115), Dependabot (12), sheneman (2)",
    activePeriod: "Feb 14-19",
    lowEstimate: "542 days (24.7 mo)",
    highEstimate: "813 days (37.0 mo)",
    multiplier: "90-136x",
    description:
      "The largest and most active repository, with 48 pull requests (44 merged) and 90 issues (67 closed, 23 open). A multi-contributor project focused on a budget system aligned to the University of Idaho FY26 template. Key work included role-based approval workflows, a review pipeline, Docker containerization, CI gates, accessibility compliance, Architecture Decision Records, contributor onboarding, security hardening, and SBOM generation.",
  },
  {
    name: "mindrouter2",
    daysActive: 17,
    netNewLines: 27132,
    linesAdded: 29429,
    linesDeleted: 2297,
    filesChanged: 118,
    commits: 60,
    contributors: "sheneman",
    activePeriod: "Feb 3-19",
    lowEstimate: "181 days (8.2 mo)",
    highEstimate: "271 days (12.3 mo)",
    multiplier: "11-16x",
    description:
      "The most active personal repository by commit count. Massive feature development over 17 days, including sidecar GPU monitoring, Docker Compose orchestration, an administrative UI, backend management services, endpoint discovery (later removed for security hardening), and Tesseract OCR integration. The breadth of work spans containerization, monitoring, security, and AI integration.",
  },
  {
    name: "proposalforge",
    daysActive: 1,
    netNewLines: 17163,
    linesAdded: 17222,
    linesDeleted: 59,
    filesChanged: 282,
    commits: 2,
    contributors: "sheneman",
    activePeriod: "Feb 19",
    lowEstimate: "114 days (5.2 mo)",
    highEstimate: "172 days (7.8 mo)",
    multiplier: "114-172x",
    description:
      "Launched with an initial release (v0.1) and immediately iterated to v0.2 with an architecture split into Core Server and App Gateway. The full stack includes FastAPI, a LangGraph agent pipeline, Celery task queuing, PostgreSQL, MinIO object storage, and Docker Compose orchestration -- all created in a single day.",
  },
  {
    name: "skillbag",
    daysActive: 3,
    netNewLines: 7833,
    linesAdded: 9795,
    linesDeleted: 1962,
    filesChanged: 48,
    commits: 24,
    contributors: "sheneman",
    activePeriod: "Feb 12-14",
    lowEstimate: "52 days (2.4 mo)",
    highEstimate: "78 days (3.5 mo)",
    multiplier: "17-26x",
    description:
      "A complete Bag-of-Skills reinforcement learning framework built in 3 days, featuring LLM plan generation, TextWorld environments, a GRPO trainer, dual-GPU architecture, a telemetry system, and curriculum tuning. Ships with 109 passing tests, reflecting production-grade code quality achieved at remarkable speed.",
  },
  {
    name: "dissertation",
    daysActive: 1,
    netNewLines: 5107,
    linesAdded: 5170,
    linesDeleted: 63,
    filesChanged: 44,
    commits: 2,
    contributors: "sheneman",
    activePeriod: "Feb 13",
    lowEstimate: "34 days (1.5 mo)",
    highEstimate: "51 days (2.3 mo)",
    multiplier: "34-51x",
    description:
      "A dissertation-to-LaTeX converter web application with AI-powered document analysis and multi-LLM backend support, complete with Docker deployment. Built and committed in a single day.",
  },
  {
    name: "CerealPestAID",
    daysActive: 1,
    netNewLines: 1984,
    linesAdded: 2024,
    linesDeleted: 40,
    filesChanged: 25,
    commits: 5,
    contributors: "sheneman",
    activePeriod: "Feb 15",
    lowEstimate: "13 days (0.6 mo)",
    highEstimate: "20 days (0.9 mo)",
    multiplier: "13-20x",
    description:
      "An initial release featuring three cereal pest classifiers (EfficientNet-B6, MobileNetV3-Large, and InceptionV3) covering 26 pest species. Includes complete training pipelines, evaluation scripts, ONNX model conversion, and TFLite inference code -- built and shipped in a single day.",
  },
  {
    name: "WildVE",
    daysActive: 3,
    netNewLines: 1532,
    linesAdded: 2247,
    linesDeleted: 715,
    filesChanged: 7,
    commits: 26,
    contributors: "Luke Sheneman",
    activePeriod: "Feb 12-14",
    lowEstimate: "10 days (0.5 mo)",
    highEstimate: "15 days (0.7 mo)",
    multiplier: "3-5x",
    description:
      "Built from scratch in just 3 days. WildVE implements a 6-model ensemble for wildlife detection in video, incorporating MegaDetector V5/V6, YOLOv8 with EnlightenGAN, Florence-2, and CLIP. Key work included dependency management via pyproject.toml and uv, a CLI-based model selection interface, an --allframes processing mode, and licensing under Apache 2.0.",
  },
  {
    name: "TEMPLATE-app",
    daysActive: 1,
    netNewLines: 10097,
    linesAdded: 10097,
    linesDeleted: 0,
    filesChanged: 45,
    commits: 4,
    contributors: "ProfessorPolymorphic",
    activePeriod: "Feb 24",
    lowEstimate: "67 days (3.1 mo)",
    highEstimate: "101 days (4.6 mo)",
    multiplier: "67-101x",
    description:
      "A GitHub template repository that codifies the University of Idaho's standards for AI-assisted application development. Defines the approved tech stack (React 19 + Vite + Tailwind CSS v4 frontend, FastAPI + async SQLAlchemy + Pydantic backend), 15 normative agent rules in CLAUDE.md, three CI/CD workflows (backend-test, frontend-test, security-scan), a four-level data governance framework, JWT/RBAC security standards with a 10-item production checklist, MkDocs Material documentation structure, PR and issue templates with agent attribution, and coding conventions enforced by Ruff and ESLint. Based on patterns validated in OpenERA. New projects are created via GitHub's 'Use this template' feature.",
  },
];

export const projectTotals = {
  daysActive: 19,
  netNewLines: 142095,
  linesAdded: 154491,
  linesDeleted: 12396,
  lowEstimate: "947 days (3.6 yr)",
  highEstimate: "1,421 days (5.4 yr)",
  multiplier: "50-75x",
};

export const repositoryTimeline = [
  {
    name: "mindrouter2",
    firstCommit: "Feb 3",
    lastCommit: "Feb 19",
    description: "GPU-enabled AI router with admin UI, Docker orchestration",
  },
  {
    name: "WildVE",
    firstCommit: "Feb 12",
    lastCommit: "Feb 14",
    description: "Wildlife video extraction with 6-model ML ensemble",
  },
  {
    name: "skillbag",
    firstCommit: "Feb 12",
    lastCommit: "Feb 14",
    description: "Bag-of-Skills reinforcement learning framework",
  },
  {
    name: "dissertation",
    firstCommit: "Feb 13",
    lastCommit: "Feb 13",
    description: "Dissertation-to-LaTeX converter web app",
  },
  {
    name: "OpenERA",
    firstCommit: "Feb 14",
    lastCommit: "Feb 19",
    description: "Open-source electronic research administration system (U of I)",
  },
  {
    name: "CerealPestAID",
    firstCommit: "Feb 15",
    lastCommit: "Feb 15",
    description: "Cereal pest classifier with 3 CNN architectures",
  },
  {
    name: "proposalforge",
    firstCommit: "Feb 19",
    lastCommit: "Feb 19",
    description: "AI-powered proposal generation pipeline",
  },
  {
    name: "TEMPLATE-app",
    firstCommit: "Feb 24",
    lastCommit: "Feb 24",
    description:
      "Institutional standards template for AI-assisted development",
  },
];

export const methodologyNote =
  "The manual development time estimate is based on published industry benchmarks that place senior developer productivity at 100-150 lines of production-quality code per day (including associated design, testing, code review, and documentation time). This figure is consistent with research from sources such as The Mythical Man-Month and contemporary software engineering productivity studies. The productivity multiplier (10-15x) is derived by comparing the actual 19-day delivery window against the estimated 6-9 month manual timeline, adjusted for the number of active contributors (2-3 humans assisted by agentic AI tools).";

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
