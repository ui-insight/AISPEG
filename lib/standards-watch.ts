// Standards Watch — public ledger of standards IIDS has formally requested
// from OIT, with a per-entry day counter. Each entry is a commit-worthy
// event; treat this file as the audit trail.
//
// TODO: replace the 2026-05-01 placeholder dateRequested values with the
// actual date(s) the agendas were sent to OIT. Different items may carry
// different dates if they were requested in separate communications.

export type StandardsWatchStatus =
  | "requested"
  | "acknowledged"
  | "in-draft"
  | "published";

export interface StandardsWatchItem {
  id: string;
  agenda: "I" | "II";
  title: string;
  details: string[];
  dateRequested: string; // ISO date — the day this standard was formally asked for
  status: StandardsWatchStatus;
  responseUrl?: string;
  responseNote?: string;
}

const PLACEHOLDER_DATE = "2026-05-01"; // <- edit this when the real date is confirmed

export const standardsWatch: StandardsWatchItem[] = [
  // ───── Agenda Item I — Software Development Standards ─────
  {
    id: "i-1",
    agenda: "I",
    title: "System Architecture & Integration Standards",
    details: [
      "Canonical system architecture diagrams (logical + physical)",
      "Approved integration patterns: API-first (REST, GraphQL, gRPC); event-driven (Kafka, queues, webhooks); direct DB access policy",
      "Data flow and system boundary definitions",
      "Identity and access integration (SSO, IAM, roles, RBAC/ABAC)",
      "Supported tech stack constraints (languages, frameworks, runtime environments)",
      "Versioning and backward compatibility expectations",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "i-2",
    agenda: "I",
    title: "API & Interface Standards",
    details: [
      "API design standards: naming conventions; versioning strategy; pagination, filtering, sorting",
      "Authentication / authorization requirements (OAuth2, tokens, scopes)",
      "Error handling and response schemas",
      "Rate limiting and throttling rules",
      "API documentation standards (OpenAPI / Swagger)",
      "Contract testing expectations",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "i-3",
    agenda: "I",
    title: "Data Standards & Governance",
    details: [
      "Canonical data models (or explicit statement that none exist)",
      "Data ownership definitions (system of record per domain)",
      "Data classification standards (PII, sensitive, public)",
      "Data retention and archival policies",
      "Audit logging requirements",
      "Data lineage expectations",
      "Backup and disaster recovery standards",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "i-4",
    agenda: "I",
    title: "Security & Compliance Requirements",
    details: [
      "Secure development standards (OWASP, etc.)",
      "Infrastructure hardening: OS baseline configs; container hardening; patch management",
      "Authentication and authorization standards",
      "Secrets management approach (Vault, env vars, etc.)",
      "Encryption requirements (at rest / in transit)",
      "Vulnerability scanning expectations (SAST/DAST)",
      "Compliance frameworks (FERPA, HIPAA, NIST, etc.)",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "i-5",
    agenda: "I",
    title: "DevOps, Deployment & Hosting Standards",
    details: [
      "Approved hosting environments (on-prem; cloud — which providers, which services)",
      "CI/CD pipeline requirements (build, test, deploy)",
      "Environment structure (Dev / Test / Staging / Prod)",
      "Deployment mechanisms (containers, VMs, serverless)",
      "Infrastructure-as-code standards (Terraform, etc.)",
      "Rollback and release management expectations",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "i-6",
    agenda: "I",
    title: "Application Lifecycle & Handoff Standards",
    details: [
      "Definition of “production-ready”",
      "Required documentation for handoff (architecture, runbooks, dependencies)",
      "Ownership model: who supports the app post-deployment",
      "SLA / SLO expectations",
      "Incident response procedures",
      "Change management requirements",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "i-7",
    agenda: "I",
    title: "Technical Debt & Code Quality Standards",
    details: [
      "Code quality standards: linting, formatting, testing thresholds",
      "Approved frontend frameworks and UI libraries",
      "Custom vs. shared component libraries; reuse vs. duplication",
      "Refactoring expectations: when required, who approves",
      "Technical debt tracking expectations",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "i-8",
    agenda: "I",
    title: "Decision-Making & Governance Model",
    details: [
      "Decision authority structure: who approves architecture; who approves deviations; escalation paths",
      "Change control board (if applicable)",
      "Exception handling process: how to request deviation from standards",
      "Documentation of “non-negotiables” vs. flexible areas",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "i-9",
    agenda: "I",
    title: "Upgrade & Change Management Standards",
    details: [
      "Version upgrade strategy: how often, who owns it",
      "Backward compatibility expectations",
      "Deprecation policies",
      "Testing requirements for upgrades",
      "Communication expectations for breaking changes",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "i-10",
    agenda: "I",
    title: "Observability & Operational Standards",
    details: [
      "Logging standards",
      "Monitoring and alerting requirements",
      "Metrics expectations (performance, usage, errors)",
      "Tracing (for distributed systems)",
      "Dashboarding tools and expectations",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },

  // ───── Agenda Item II — User Experience Standards ─────
  {
    id: "ii-1",
    agenda: "II",
    title: "Design System & Visual Standards",
    details: [
      "Official design system (or explicit statement that none exists)",
      "Approved UI frameworks (e.g., React + specific component libraries)",
      "Typography, color palette, spacing, iconography standards",
      "Branding requirements (logos, headers, institutional identity)",
      "Layout / grid system rules",
      "Dark mode / theming expectations (if applicable)",
      "Versioning and governance of the design system",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "ii-2",
    agenda: "II",
    title: "Component & Interaction Standards",
    details: [
      "Standard UI components (forms, tables, modals, navigation, alerts)",
      "Behavior standards: button placement and hierarchy; form validation patterns; error messaging patterns",
      "Reuse expectations vs. custom components",
      "Accessibility of interactive elements (keyboard nav, focus states)",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "ii-3",
    agenda: "II",
    title: "Accessibility",
    details: [
      "Required compliance level (e.g., WCAG 2.1 AA)",
      "Screen reader compatibility requirements",
      "Color contrast standards",
      "Keyboard navigation requirements",
      "ARIA usage expectations",
      "Testing requirements (automated + manual)",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "ii-4",
    agenda: "II",
    title: "Usability & Workflow Design Standards",
    details: [
      "Task completion time expectations",
      "Number of clicks / steps per workflow",
      "Standard navigation patterns (global nav, breadcrumbs)",
      "Consistency across modules (same actions behave the same way)",
      "Support for user roles / personas (e.g., PI vs. admin staff)",
      "Mobile vs. desktop expectations",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "ii-5",
    agenda: "II",
    title: "Performance & Responsiveness Standards",
    details: [
      "Page load time thresholds",
      "API response time expectations",
      "Handling of large datasets (pagination, virtualization)",
      "Offline / low-bandwidth considerations (if relevant)",
      "Responsiveness across screen sizes",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "ii-6",
    agenda: "II",
    title: "Error Handling & Feedback Standards",
    details: [
      "Standard error message format: human-readable + actionable",
      "Inline validation vs. post-submit errors",
      "System status indicators (loading, success, failure)",
      "Notification patterns (toast, modal, banner)",
      "Logging vs. user-facing errors separation",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "ii-7",
    agenda: "II",
    title: "Content & Language Standards",
    details: [
      "Tone and voice guidelines (plain language vs. technical)",
      "Consistent terminology across systems",
      "Labeling conventions (buttons, fields, menus)",
      "Help text and tooltips standards",
      "Documentation and in-app guidance expectations",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "ii-8",
    agenda: "II",
    title: "User Testing & Validation Requirements",
    details: [
      "Required usability testing (before release? after release?)",
      "Definition of “acceptable UX”",
      "Feedback collection mechanisms (surveys, analytics, user interviews)",
      "Iteration expectations based on feedback",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "ii-9",
    agenda: "II",
    title: "Analytics & UX Telemetry",
    details: [
      "Required tracking (user flows, drop-off points, task completion rates)",
      "Tools allowed / required (e.g., GA, internal tools)",
      "Privacy constraints on tracking",
      "Reporting expectations",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
  {
    id: "ii-10",
    agenda: "II",
    title: "Governance & Exception Handling",
    details: [
      "Who owns UX standards",
      "Who approves deviations",
      "How conflicts are resolved (design vs. engineering vs. OIT)",
      "Process for updating standards over time",
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "requested",
  },
];

export function daysSince(isoDate: string): number {
  const then = new Date(isoDate + "T00:00:00Z").getTime();
  const now = Date.now();
  const ms = now - then;
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function summary(items: StandardsWatchItem[] = standardsWatch) {
  const counts = {
    requested: 0,
    acknowledged: 0,
    "in-draft": 0,
    published: 0,
  } as Record<StandardsWatchStatus, number>;
  for (const item of items) counts[item.status]++;
  const outstanding = items.filter((i) => i.status !== "published");
  const oldestOutstanding = outstanding
    .map((i) => daysSince(i.dateRequested))
    .sort((a, b) => b - a)[0] ?? 0;
  return { counts, total: items.length, outstanding: outstanding.length, oldestOutstanding };
}
