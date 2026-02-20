// ============================================================
// Key Metrics
// ============================================================

export const keyMetrics = {
  totalCommits: 248,
  netNewLines: 142095,
  totalLinesAdded: 154491,
  totalLinesDeleted: 12396,
  uniqueFiles: 878,
  activeRepos: 7,
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
    name: "VERASUnlimited",
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
    name: "VERASUnlimited",
    firstCommit: "Feb 14",
    lastCommit: "Feb 19",
    description: "Budget and approval workflow system (U of I)",
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
      "Provide approved stacks, secure deployment paths, reusable patterns, and documentation standards. This allows us to optimize innovation with security and compliance. Innovation scales within compliance when the environment is designed well.",
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
      "Let's start with a small ecosystem and build out from there. Establish safe patterns and governance. Demonstrate value, then scale outward.",
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
      "CLAUDE.md currently reads as context. For multi-agent work, parts of it should be normative rules, not just information.",
    recommendations: [
      "Separate background context from normative MUST rules -- make it unambiguous what's a constraint vs. background info",
      "Codify naming conventions, pre-commit checks, terminology, and branching rules",
      "Rules reduce drift across agents and collaborators",
      "Examples: NEVER modify database column naming convention, ALWAYS run checks before committing, NEVER add component libraries",
    ],
    category: "Governance",
  },
  {
    id: "preserve-architectural-intent",
    title: "Preserve Architectural Intent",
    context:
      "The 'why' behind decisions is scattered across docs. Agents may accidentally 'fix' things that were intentional design choices.",
    recommendations: [
      "Capture 'why' via Architecture Decision Records (ADRs) -- machine-readable context agents can reference",
      "Prevents accidental 'fixes' of intentional patterns (e.g., specific naming conventions, data modeling choices)",
      "Enables consistent evolution and onboarding for agents and humans",
      "Store ADRs in a discoverable location (e.g., docs/adr/) so agents find them automatically",
    ],
    category: "Architecture",
  },
  {
    id: "shadow-ai-governance",
    title: "Shadow AI & Governance",
    context:
      "Shadow AI applications are already emerging -- rapid experimentation happening outside governance structures.",
    recommendations: [
      "Acknowledge that shadow applications are being created across the institution",
      "Provide approved stacks and secure deployment paths to channel innovation",
      "Make the right thing easy so people don't route around governance",
      "Institutional structures lag the technology -- close the gap proactively",
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
      "When a human reviews an AI-generated PR, they need to know the level of AI involvement and what decisions were made autonomously.",
    recommendations: [
      "Classify contributions: human-guided, AI-proposed (human approved), or fully autonomous",
      "Include agent context in PRs -- what key choices were made and why",
      "Formalize Co-Authored-By conventions for agent commits",
      "Establish review protocols that account for AI-generated code patterns",
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
      "Part of what we can do institutionally is write guidelines related to preferred tech stacks for common project types. Also materials related to security, deployment, documentation. These guidelines are for the AGENTS, not people. Guidelines should guide agents as much as people.",
    category: "Standards",
  },
  {
    id: "preferred-stacks",
    title: "Preferred Stacks by Project Type",
    description:
      "Define approved technology stacks for different project categories. Provide secure deployment paths and reusable patterns to make the right thing easy.",
    category: "Standards",
  },
  {
    id: "security-patterns",
    title: "Security & Deployment Patterns",
    description:
      "Establish security baselines, deployment pipelines, and documentation standards that agents can follow consistently. Include Docker containerization, CI gates, SBOM generation, and security hardening.",
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
      "Capture the 'why' behind key decisions in a machine-readable format. Prevents agents from 'improving' things that were intentional design choices. Store in docs/adr/ so agents discover them automatically during onboarding.",
    category: "Standards",
  },
  {
    id: "agent-attribution-review",
    title: "Agent Attribution & Review Protocol",
    description:
      "Classify PRs as human-guided, AI-proposed (human approved), or fully autonomous. Include agent context sections listing key decisions made. Formalize commit attribution with Co-Authored-By conventions.",
    category: "Coordination",
  },
  {
    id: "ci-enforcement",
    title: "CI Enforcement for Agent Work",
    description:
      "Gate backend tests (pytest) and linting (Ruff, ESLint) in CI so that agent-pushed changes are automatically validated. An agent could push breaking changes that aren't caught without CI enforcement.",
    category: "Infrastructure",
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
      "Priority improvements for scaling agentic collaboration: (1) Formalize CLAUDE.md rules section, (2) Add backend CI gates, (3) Create agent coordination docs, (4) Root-level CONTRIBUTING.md and SECURITY.md, (5) Expand PR templates with agent attribution, (6) Add issue templates, (7) ADRs for key decisions, (8) Skill definition templates, (9) CI linting enforcement, (10) Onboarding guide with AI tooling setup.",
    tags: ["coordination", "agents", "governance", "ci"],
    category: "Coordination",
  },
  {
    title: "VERASUnlimited Scope Analysis",
    summary:
      "A full-stack research administration platform rated medium-high to high complexity. 338 tracked files, 41,154 source LOC, 363 pytest tests, 27 ORM tables, 24 route files with 94 handlers. Covers pre-award proposal workflow, role-based auth, budget planning with Excel import/export, document upload pipelines, and compliance review engines. Solo-dev estimate without AI: 9-14 months for comparable breadth.",
    tags: ["projects", "analysis", "complexity", "veras"],
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
      "Seven repositories spanning ML/AI, full-stack web, DevOps, and research tools. Includes deep learning ensembles (WildVE, CerealPestAID), reinforcement learning (skillbag), LangGraph agent pipelines (proposalforge), GPU-aware microservice orchestration (mindrouter2), institutional workflows (VERASUnlimited), and AI document processing (dissertation). Each represents production-grade software with Docker deployment, testing suites, and professional documentation.",
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
];

export const institutionalQuestion = {
  wrong: "Should we adopt AI?",
  right: "How do we design an institution where agents safely amplify our mission?",
};
