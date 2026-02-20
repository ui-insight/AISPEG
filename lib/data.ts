export const keyMetrics = {
  totalCommits: 248,
  netNewLines: 142095,
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

export const projects = [
  {
    name: "VERASUnlimited",
    daysActive: 6,
    netNewLines: 81344,
    lowEstimate: "542 days (24.7 mo)",
    highEstimate: "813 days (37.0 mo)",
    multiplier: "90-136x",
  },
  {
    name: "mindrouter2",
    daysActive: 17,
    netNewLines: 27132,
    lowEstimate: "181 days (8.2 mo)",
    highEstimate: "271 days (12.3 mo)",
    multiplier: "11-16x",
  },
  {
    name: "proposalforge",
    daysActive: 1,
    netNewLines: 17163,
    lowEstimate: "114 days (5.2 mo)",
    highEstimate: "172 days (7.8 mo)",
    multiplier: "114-172x",
  },
  {
    name: "skillbag",
    daysActive: 3,
    netNewLines: 7833,
    lowEstimate: "52 days (2.4 mo)",
    highEstimate: "78 days (3.5 mo)",
    multiplier: "17-26x",
  },
  {
    name: "dissertation",
    daysActive: 1,
    netNewLines: 5107,
    lowEstimate: "34 days (1.5 mo)",
    highEstimate: "51 days (2.3 mo)",
    multiplier: "34-51x",
  },
  {
    name: "CerealPestAID",
    daysActive: 1,
    netNewLines: 1984,
    lowEstimate: "13 days (0.6 mo)",
    highEstimate: "20 days (0.9 mo)",
    multiplier: "13-20x",
  },
  {
    name: "WildVE",
    daysActive: 3,
    netNewLines: 1532,
    lowEstimate: "10 days (0.5 mo)",
    highEstimate: "15 days (0.7 mo)",
    multiplier: "3-5x",
  },
];

export const projectTotals = {
  daysActive: 19,
  netNewLines: 142095,
  lowEstimate: "947 days (3.6 yr)",
  highEstimate: "1,421 days (5.4 yr)",
  multiplier: "50-75x",
};

export const principles = [
  {
    id: "core-principle",
    title: "Core Institutional Principle",
    summary:
      "Make the right thing easy, and the wrong thing difficult.",
    details:
      "Provide approved stacks, secure deployment paths, reusable patterns, and documentation standards. Innovation scales within compliance when the environment is designed well.",
    category: "Foundation",
  },
  {
    id: "jobs-changing",
    title: "Jobs Are Changing, Not Disappearing",
    summary: "AI doesn't change WHY roles exist.",
    details:
      "It changes WHAT people do and HOW they do it. This applies across development, research administration, and IT/OIT.",
    category: "Workforce",
  },
  {
    id: "demand-misconception",
    title: "The Demand Misconception",
    summary:
      "Fear assumes demand stays constant while productivity rises.",
    details:
      "More likely: application cost decreases, development speed increases, experimentation increases, and demand increases. The result is more work, but different work.",
    category: "Workforce",
  },
  {
    id: "force-multiplier",
    title: "AI as a Mission Force Multiplier",
    summary: "Frame AI as amplifying mission outcomes.",
    details:
      "Research productivity, administrative capacity, innovation throughput. Institutional intelligence and faster iteration loops.",
    category: "Strategy",
  },
  {
    id: "workflow-redesign",
    title: "Do Not Automate Broken Workflows",
    summary:
      'Don\'t ask "How can we make this workflow faster?"',
    details:
      'Ask: "Why does this workflow exist, and how should it work?" Agentic AI rewards redesign over optimization.',
    category: "Implementation",
  },
  {
    id: "greenfield-brownfield",
    title: "Greenfield vs Brownfield AI",
    summary:
      "Most universities operate in brownfield reality.",
    details:
      "Greenfield means AI-native systems, clean APIs, high autonomy. Brownfield means legacy integration, adapters/RPA, high friction. Understanding where you are determines your approach.",
    category: "Implementation",
  },
  {
    id: "start-small",
    title: "Start Small, Then Expand",
    summary: "Begin with a small ecosystem and trusted stack.",
    details:
      "Establish safe patterns and governance. Demonstrate value, then scale outward.",
    category: "Implementation",
  },
  {
    id: "saas-pressure",
    title: "Market Implication: SaaS Pressure",
    summary:
      "As custom tool creation accelerates, SaaS value shifts.",
    details:
      "Vendors must improve dramatically or reduce prices. Institutions gain leverage in contract negotiations.",
    category: "Strategy",
  },
  {
    id: "thinking-too-small",
    title: "Most People Are Thinking Too Small",
    summary:
      "This isn't just automation — it's capability expansion.",
    details:
      "Solution proliferation and rapid experimentation. Research amplification effects are enormous.",
    category: "Strategy",
  },
];

export const lessons = [
  {
    id: "multi-agent-coordination",
    title: "Multi-Agent Coordination",
    context: "Repo-scale multi-agent collaboration",
    recommendations: [
      "Define scope boundaries and conflict prevention",
      "Create a skill registry and output contracts",
      "Establish escalation and handoff protocols",
      "Single-agent assumptions break quickly",
    ],
    category: "Coordination",
  },
  {
    id: "explicit-agent-rules",
    title: "Explicit Agent Rules",
    context: "Maintaining consistency across agents and collaborators",
    recommendations: [
      "Separate background context from normative MUST rules",
      "Naming conventions, checks before commit, terminology, branching",
      "Rules reduce drift across agents and collaborators",
    ],
    category: "Governance",
  },
  {
    id: "preserve-architectural-intent",
    title: "Preserve Architectural Intent",
    context: "Preventing accidental regressions of intentional design decisions",
    recommendations: [
      'Capture "why" via Architecture Decision Records (ADRs)',
      'Prevents accidental "fixes" of intentional patterns',
      "Enables consistent evolution and onboarding for agents and humans",
    ],
    category: "Architecture",
  },
];

export const playbookItems = [
  {
    id: "agent-orchestrator",
    title: "The Agent Orchestrator Role",
    description:
      "Systems thinker with broad generalist understanding. Decomposes processes and explains workflows clearly. Bridges domain experts, infrastructure, and agents.",
    category: "Roles",
  },
  {
    id: "guidelines-for-agents",
    title: "Guidelines for Agents, Not Just Humans",
    description:
      "Preferred stacks by project type. Security, deployment, documentation patterns. Data access conventions and reusable primitives. Guidelines should guide agents as much as people.",
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
      "Establish security baselines, deployment pipelines, and documentation standards that agents can follow consistently.",
    category: "Infrastructure",
  },
];

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
