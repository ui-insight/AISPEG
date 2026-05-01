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
  { name: "Institutional AI Initiative coordination site", owner: "IIDS" },
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

// Presentations & Reports — moved to lib/artifacts.ts as part of the
// Sprint 4 reports unification. The `presentations` export is retired;
// the unified Reports timeline now lives in lib/artifacts.ts.

// ============================================================
// Retired exports
// ============================================================
// The following exports lived in this file during the AISPEG-collaborator
// era and have been removed as part of the May 2026 refactor:
//   principles, lessons, playbookItems, knowledgeArticles,
//   strategicTakeaways, institutionalQuestion, CautionaryTale,
//   cautionaryTales, standardsRoadmapSource, institutionalStandards,
//   standardsPhases, standardDocuments, standardsSuccessMetrics
// They were referenced only by routes archived under `_archive/app-routes`
// (/approach, /knowledge, /cautionary-tales, /standards/[id]). Recover
// from git history if a salvage need arises during Sprint 4 cleanup.
