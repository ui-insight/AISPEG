// ============================================
// App Builder Guide — Questions, Scoring & Recommendations
// ============================================

export interface QuizOption {
  label: string;
  description?: string;
  points: number;
}

export interface QuizStep {
  id: string;
  title: string;
  subtitle: string;
  type: "text" | "single" | "multi";
  options?: QuizOption[];
  placeholder?: string;
}

export const quizSteps: QuizStep[] = [
  {
    id: "idea",
    title: "What's your idea?",
    subtitle:
      "Describe the problem, opportunity, or pain point you want to address with an agentic AI application.",
    type: "text",
    placeholder:
      "e.g., I want to build a tool that helps advisors quickly look up degree requirements and suggest course plans for students...",
  },
  {
    id: "sensitivity",
    title: "Data Sensitivity",
    subtitle:
      "What types of sensitive or regulated data will your application handle? Select all that apply.",
    type: "multi",
    options: [
      {
        label: "No sensitive data",
        description: "Public or non-restricted information only",
        points: 0,
      },
      {
        label: "FERPA",
        description: "Student education records",
        points: 3,
      },
      {
        label: "HIPAA",
        description: "Protected health information",
        points: 4,
      },
      {
        label: "PII",
        description: "Personally identifiable information (names, SSNs, etc.)",
        points: 2,
      },
      {
        label: "CUI",
        description: "Controlled unclassified information",
        points: 4,
      },
      {
        label: "Research / IRB",
        description: "Research data with IRB requirements",
        points: 3,
      },
      {
        label: "Financial data",
        description: "Payment or financial account information",
        points: 3,
      },
    ],
  },
  {
    id: "complexity",
    title: "Data Complexity",
    subtitle: "How complex is the data your application needs to work with?",
    type: "single",
    options: [
      {
        label: "Static content",
        description: "No database needed — just pages or documents",
        points: 0,
      },
      {
        label: "Simple CRUD",
        description: "Single database with basic read/write operations",
        points: 1,
      },
      {
        label: "Multiple data sources",
        description: "Connects to several databases or external APIs",
        points: 2,
      },
      {
        label: "Complex pipelines",
        description: "ETL processes, data transformations, or ML models",
        points: 3,
      },
      {
        label: "Real-time / streaming",
        description: "Live data feeds, WebSockets, or event-driven architecture",
        points: 4,
      },
    ],
  },
  {
    id: "userbase",
    title: "User Base",
    subtitle: "How many people will use this application?",
    type: "single",
    options: [
      {
        label: "Just me / my team",
        description: "Fewer than 10 users",
        points: 0,
      },
      {
        label: "My department",
        description: "10–100 users",
        points: 1,
      },
      {
        label: "College-wide",
        description: "100–1,000 users",
        points: 2,
      },
      {
        label: "University-wide",
        description: "1,000+ users across campus",
        points: 3,
      },
      {
        label: "External / public",
        description: "Open to people outside the university",
        points: 4,
      },
    ],
  },
  {
    id: "auth",
    title: "Authentication & Access",
    subtitle: "What level of user authentication does your application need?",
    type: "single",
    options: [
      {
        label: "No login needed",
        description: "Anyone can access it without signing in",
        points: 0,
      },
      {
        label: "Simple shared password",
        description: "Basic password protection for a small group",
        points: 1,
      },
      {
        label: "University SSO",
        description: "Sign in with University of Idaho credentials (CAS/SAML)",
        points: 2,
      },
      {
        label: "Role-based access",
        description: "Different permissions for different user roles",
        points: 3,
      },
      {
        label: "Multi-tenant / delegated admin",
        description: "Multiple organizations or delegated administration",
        points: 4,
      },
    ],
  },
  {
    id: "integrations",
    title: "Integration Needs",
    subtitle:
      "What existing systems or services does your application need to connect to? Select all that apply.",
    type: "multi",
    options: [
      {
        label: "None / standalone",
        description: "No integrations needed",
        points: 0,
      },
      {
        label: "University APIs",
        description: "Banner, Canvas, VandalWeb, or other campus systems",
        points: 2,
      },
      {
        label: "External SaaS APIs",
        description: "Third-party cloud services (Slack, Google, etc.)",
        points: 1,
      },
      {
        label: "AI / LLM integration",
        description: "Claude, GPT, or other language model APIs",
        points: 1,
      },
      {
        label: "File storage",
        description: "Document management, S3, or shared drives",
        points: 1,
      },
      {
        label: "Email / notifications",
        description: "Sending emails, SMS, or push notifications",
        points: 1,
      },
    ],
  },
  {
    id: "dataSources",
    title: "Data Sources",
    subtitle:
      "What types of data sources will your application need to access? Select all that apply.",
    type: "multi",
    options: [
      {
        label: "None / generates its own data",
        description: "No external data sources needed",
        points: 0,
      },
      {
        label: "Banner / SIS",
        description: "Student Information System (enrollment, grades, transcripts)",
        points: 2,
      },
      {
        label: "Canvas LMS",
        description: "Course content, assignments, gradebooks",
        points: 1,
      },
      {
        label: "LDAP / Active Directory",
        description: "User directories and group memberships",
        points: 1,
      },
      {
        label: "Slate CRM",
        description: "Admissions and recruitment data",
        points: 2,
      },
      {
        label: "Research databases",
        description: "Lab data, publications, grant records",
        points: 1,
      },
      {
        label: "Google Workspace",
        description: "Google Drive, Sheets, Calendar, etc.",
        points: 1,
      },
      {
        label: "Flat files / spreadsheets",
        description: "CSV, Excel, or other file-based data",
        points: 0,
      },
      {
        label: "Custom / internal APIs",
        description: "APIs built and maintained by your unit",
        points: 1,
      },
    ],
  },
  {
    id: "universitySystems",
    title: "Specific University Systems",
    subtitle:
      "Which specific university systems will your application interact with? Select all that apply.",
    type: "multi",
    options: [
      {
        label: "None",
        description: "No direct university system integration",
        points: 0,
      },
      {
        label: "VandalWeb",
        description: "Student and employee self-service portal",
        points: 1,
      },
      {
        label: "Banner Student",
        description: "Student records, registration, academic history",
        points: 2,
      },
      {
        label: "Banner Finance",
        description: "Financial records, budgets, purchasing",
        points: 2,
      },
      {
        label: "Banner HR",
        description: "Employee records, payroll, positions",
        points: 2,
      },
      {
        label: "Canvas",
        description: "Learning management system",
        points: 1,
      },
      {
        label: "Slate",
        description: "Admissions CRM and event management",
        points: 2,
      },
      {
        label: "DUO / MFA",
        description: "Multi-factor authentication service",
        points: 1,
      },
      {
        label: "CAS / SSO",
        description: "Central Authentication Service",
        points: 1,
      },
      {
        label: "Perceptive Content",
        description: "Document imaging and management",
        points: 1,
      },
    ],
  },
  {
    id: "outputTypes",
    title: "Output & Actions",
    subtitle:
      "What will your application do with data? Select all that apply.",
    type: "multi",
    options: [
      {
        label: "Read-only reporting",
        description: "Dashboards, visualizations, or search interfaces",
        points: 0,
      },
      {
        label: "Creates / modifies records",
        description: "Writes data back to databases or systems",
        points: 2,
      },
      {
        label: "Sends notifications",
        description: "Emails, alerts, or messages to users",
        points: 1,
      },
      {
        label: "Generates documents",
        description: "PDFs, reports, letters, or other files",
        points: 1,
      },
      {
        label: "Triggers workflows",
        description: "Kicks off approval processes or automated tasks",
        points: 2,
      },
      {
        label: "Exposes an API",
        description: "Provides data or services to other applications",
        points: 2,
      },
    ],
  },
];

// ============================================
// Scoring
// ============================================

export type Answers = Record<string, string | string[]>;

export function calculateScore(answers: Answers): number {
  let total = 0;

  for (const step of quizSteps) {
    if (step.type === "text" || !step.options) continue;

    const answer = answers[step.id];
    if (!answer) continue;

    if (step.type === "multi" && Array.isArray(answer)) {
      // If "No sensitive data" or "None / standalone" is selected with other items, ignore the 0-point option
      for (const selected of answer) {
        const opt = step.options.find((o) => o.label === selected);
        if (opt) total += opt.points;
      }
    } else if (step.type === "single" && typeof answer === "string") {
      const opt = step.options.find((o) => o.label === answer);
      if (opt) total += opt.points;
    }
  }

  return total;
}

// ============================================
// Tiers & Recommendations
// ============================================

export interface TierRecommendation {
  tier: number;
  label: string;
  color: string;
  description: string;
  techStack: string[];
  deployment: string;
  githubTemplate: string;
  templateUrl: string;
  standards: string[];
  considerations: string[];
}

export const tiers: TierRecommendation[] = [
  {
    tier: 1,
    label: "Simple Static App",
    color: "green",
    description:
      "A lightweight application with minimal compliance requirements. Great for internal tools, informational sites, or personal productivity aids.",
    techStack: [
      "Next.js or plain HTML/CSS/JS",
      "No database required (or SQLite for local storage)",
      "GitHub Pages or Vercel for hosting",
    ],
    deployment: "GitHub Pages, Vercel, or Netlify — no server management needed.",
    githubTemplate: "ui-insight/template-static-app",
    templateUrl: "https://github.com/ui-insight/template-static-app",
    standards: ["approved-tools"],
    considerations: [
      "Ensure any AI API keys are stored securely, never in client-side code",
      "Even simple apps should follow the approved tech stack guidance",
      "Consider whether your app might grow — start with a template that can scale",
    ],
  },
  {
    tier: 2,
    label: "Standard Web App",
    color: "yellow",
    description:
      "An authenticated application with moderate data handling. Suitable for department tools, data dashboards, and workflow applications.",
    techStack: [
      "Next.js with App Router",
      "PostgreSQL or MongoDB database",
      "Docker deployment on Insight servers",
      "University SSO integration available",
    ],
    deployment:
      "Docker container on Insight infrastructure (openera.insight.uidaho.edu) with HTTPS.",
    githubTemplate: "ui-insight/template-web-app",
    templateUrl: "https://github.com/ui-insight/template-web-app",
    standards: ["approved-tools", "data-flow"],
    considerations: [
      "Plan your data model early — changing it later is expensive",
      "Implement proper error handling and logging from the start",
      "Set up automated testing before your first deployment",
      "Document your API endpoints and data schemas",
    ],
  },
  {
    tier: 3,
    label: "Managed Service App",
    color: "orange",
    description:
      "A significant application handling sensitive data or serving a large user base. Requires institutional infrastructure and compliance review.",
    techStack: [
      "Next.js or Python (FastAPI/Django) backend",
      "PostgreSQL with encryption at rest",
      "Redis for caching/sessions",
      "Docker Compose with dedicated infrastructure",
      "University SSO with role-based access control",
    ],
    deployment:
      "Dedicated Docker deployment with OIT coordination. May require security review before launch.",
    githubTemplate: "ui-insight/template-managed-service",
    templateUrl: "https://github.com/ui-insight/template-managed-service",
    standards: ["approved-tools", "data-flow", "security-baseline", "human-oversight"],
    considerations: [
      "Schedule a consultation with OIT security before development begins",
      "Data classification review is required for FERPA/HIPAA data",
      "Plan for backup and disaster recovery from day one",
      "You will need a data flow diagram approved before handling regulated data",
      "Consider load testing before launch if serving 100+ concurrent users",
    ],
  },
  {
    tier: 4,
    label: "Enterprise / Regulated App",
    color: "red",
    description:
      "A high-compliance, large-scale application with complex integrations. Requires full institutional review, dedicated infrastructure, and ongoing compliance monitoring.",
    techStack: [
      "Enterprise framework (Next.js, Django, or .NET)",
      "PostgreSQL or Oracle with full encryption",
      "Dedicated Kubernetes or VM infrastructure",
      "Enterprise SSO with MFA and audit logging",
      "Monitoring stack (Prometheus/Grafana or equivalent)",
    ],
    deployment:
      "OIT-managed infrastructure with full security review, penetration testing, and compliance certification.",
    githubTemplate: "ui-insight/template-enterprise",
    templateUrl: "https://github.com/ui-insight/template-enterprise",
    standards: [
      "approved-tools",
      "data-flow",
      "security-baseline",
      "human-oversight",
      "incident-response",
      "procurement-guardrails",
      "training-awareness",
    ],
    considerations: [
      "Engage OIT and CISO office early — expect a multi-week review process",
      "You will need a complete data flow diagram and security architecture document",
      "Plan for SOC 2 or equivalent compliance requirements",
      "Budget for ongoing security monitoring and incident response",
      "Multi-tenant architectures need data isolation verification",
      "Consider hiring or designating a technical lead for ongoing maintenance",
    ],
  },
];

export function getTierForScore(score: number): TierRecommendation {
  if (score <= 3) return tiers[0];
  if (score <= 7) return tiers[1];
  if (score <= 12) return tiers[2];
  return tiers[3];
}

// ============================================
// Clipboard Summary Generator
// ============================================

// ============================================
// Departments (University of Idaho)
// ============================================

export const DEPARTMENTS = [
  // Colleges
  "College of Agricultural & Life Sciences",
  "College of Art & Architecture",
  "College of Business & Economics",
  "College of Education, Health & Human Sciences",
  "College of Engineering",
  "College of Graduate Studies",
  "College of Law",
  "College of Letters, Arts & Social Sciences",
  "College of Natural Resources",
  "College of Science",
  // Administrative & Support Units
  "Division of Finance & Administration",
  "Division of Student Affairs",
  "Extension & Outreach",
  "Information Technology Services (ITS)",
  "Institutional Research & Assessment",
  "Library",
  "Office of Research & Economic Development",
  "Office of the President",
  "Office of the Provost",
  "University Advancement",
  "University Communications & Marketing",
  // Other
  "Other",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

// ============================================
// Contact Info
// ============================================

export interface ContactInfo {
  name: string;
  email: string;
  department: string;
}

// ============================================
// Clipboard Summary Generator
// ============================================

export function generateSummary(answers: Answers, score: number, tier: TierRecommendation): string {
  const lines: string[] = [
    "=== AISPEG App Builder Guide — Assessment Summary ===",
    "",
    `Project Idea: ${answers.idea || "(not provided)"}`,
    "",
    "--- Answers ---",
  ];

  for (const step of quizSteps) {
    if (step.type === "text") continue;
    const answer = answers[step.id];
    const display = Array.isArray(answer) ? answer.join(", ") : answer || "(not answered)";
    lines.push(`${step.title}: ${display}`);
  }

  lines.push("");
  lines.push("--- Assessment ---");
  lines.push(`Score: ${score} points`);
  lines.push(`Tier: ${tier.tier} — ${tier.label}`);
  lines.push(`Description: ${tier.description}`);
  lines.push("");
  lines.push("Recommended Tech Stack:");
  tier.techStack.forEach((t) => lines.push(`  - ${t}`));
  lines.push("");
  lines.push(`Deployment: ${tier.deployment}`);
  lines.push(`GitHub Template: ${tier.githubTemplate}`);
  lines.push("");
  lines.push("Standards Required:");
  tier.standards.forEach((s) => lines.push(`  - ${s}`));
  lines.push("");
  lines.push("Key Considerations:");
  tier.considerations.forEach((c) => lines.push(`  - ${c}`));
  lines.push("");
  lines.push("Generated by AISPEG App Builder Guide — University of Idaho");

  return lines.join("\n");
}
