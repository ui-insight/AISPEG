// Standards ledger — the catalog of institutional IT, data, and AI
// governance standards surfaced through this portal: drafting status,
// references, and the artifacts that ratify them. Each entry is a
// commit-worthy event; treat this file as the audit trail.
//
// Current dateRequested values are placeholders set to mid-February 2026,
// approximating when these items were first surfaced. Refine per-entry
// as canonical dates become available.

export type StandardsWatchStatus =
  | "not-started"
  | "in-discussion"
  | "in-draft"
  | "approved";

export interface StandardsWatchItem {
  id: string;
  agenda: "I" | "II";
  title: string;
  details: string[];
  // Canonical references for this standard — external authorities (W3C,
  // NIST, OWASP), institutional policies (APM), or vendor docs that
  // clarify the binding interpretation. Distinct from responseUrl, which
  // points at OIT's response artifact.
  links?: { label: string; href: string }[];
  dateRequested: string; // ISO date — the day this standard was formally asked for
  status: StandardsWatchStatus;
  responseUrl?: string;
  responseNote?: string;
}

// Shared response URL for items addressed by the OIT Enterprise AI
// Development Framework discussion draft (April 2026). Per-item
// responseNote captures what the draft provides for each ask.
const OIT_FRAMEWORK_URL =
  "https://dev.azure.com/uidaho/Development/_wiki/wikis/Development.wiki/19540/Enterprise-AI-Development-Framework";

const PLACEHOLDER_DATE = "2026-02-15"; // mid-February — when these items first surfaced; refine per-entry as needed

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
    status: "in-draft",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "OIT Enterprise AI Development Framework (Apr 2026 discussion draft) defines a two-zone hosted environment (OIT-operated platform + per-team K8s namespace on OCI OKE / on-prem), API-first design via FastAPI, identity through Microsoft Entra ID, and a binding approved tech stack. Architecture-diagram and data-flow-diagram artifacts are required pre-deploy.",
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
    status: "in-discussion",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "Framework picks FastAPI + Uvicorn as the backend API layer and Microsoft Entra ID (OAuth2/OIDC) for authentication. Pagination/filtering, error-response schemas, rate limiting, OpenAPI documentation, and contract-testing expectations are not yet specified in the draft.",
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
    status: "in-discussion",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "Framework adopts APM 30.11 (Low / Moderate / High) as the binding classification scheme and specifies PostgreSQL + pgaudit for audit logging. Prompt and completion logs inherit the classification of underlying data. Canonical data models, retention, lineage, and DR standards are not yet specified.",
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
    status: "in-draft",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "Framework specifies 1Password Connect for secrets management (no hardcoded credentials), Microsoft Entra ID for auth, governance-shifts-left posture, and explicit handling of FERPA (Moderate) and HIPAA PHI / SSN / CUI (High) under APM 30.11. EAR + VASA reviews are required pre-deploy for new tech and new vendors. Specific OS/container hardening baselines and SAST/DAST tooling are not yet specified.",
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
    status: "in-draft",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "Framework defines OCI OKE + on-prem Kubernetes as the approved hosting environments, Azure Pipelines as the CI/CD pipeline (GitHub Actions under review), ArgoCD + Kustomize for GitOps deployment, and per-team K8s namespaces with no direct cluster access in test/prod. Each team gets a starter deployment repository. Specific environment-structure rules and IaC standards beyond Kustomize are not yet specified.",
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
    status: "in-discussion",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "Framework names the required pre-deploy artifacts (systems architecture diagram, per-module data-flow diagrams, risk assessment, runbook covering deployment/rollback/incident response/alerting/ownership, EAR if new tech, VASA if new vendor). Long-term application ownership and support model is an explicit open question in the draft — options range from full product-team ownership to OIT-assumed long-term support; decision affects how applications are scoped, staffed, and funded.",
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
    status: "in-draft",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "Framework specifies the approved tooling stack: Ruff + Pyright (Python lint/type), Biome (JS/TS lint/format), pytest (Python tests), Vitest + Testing Library (JS/TS tests), uv + pyproject.toml (Python deps), SQLAlchemy + Alembic (ORM/migrations). Frontend is React + Vite + TypeScript. Specific testing-coverage thresholds, refactoring approval paths, and tech-debt tracking processes are not yet specified.",
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
    status: "in-draft",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "Framework establishes the Enterprise Architecture Review (EAR) as the formal exception process for any deviation from the approved technology stack, and the VASA process for any new vendor. The principle is paved-road first — the catalog of approved tools/patterns/infrastructure means most decisions are pre-approved; reviews are for exceptions only.",
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
    status: "not-started",
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
    status: "in-draft",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "Framework requires all four observability components: OpenTelemetry, Prometheus, Jaeger, and Splunk. Splunk is deployed first. Observability diagrams must be completed and ownership assigned before production. Specific dashboards, alert thresholds, and metric expectations are not yet specified.",
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
    status: "not-started",
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
    status: "not-started",
  },
  {
    id: "ii-3",
    agenda: "II",
    title: "Accessibility",
    details: [
      "Required compliance level: WCAG 2.1 Level AA — confirmed as the institutional binding standard for UI applications. Level AA encompasses all Level A success criteria plus AA-specific ones.",
      "Color contrast: 4.5:1 minimum for normal text; 3:1 for large text (≥18pt or 14pt bold) and for UI components and graphical objects (success criteria 1.4.3, 1.4.11).",
      "Keyboard navigation: full operability without a mouse (2.1.1); no keyboard traps (2.1.2); visible focus indicator on every interactive element (2.4.7); skip-to-content link on pages with repetitive navigation (2.4.1).",
      "Text alternatives for non-text content (1.1.1); captions for prerecorded media (1.2.2); resize text up to 200% without loss of content or functionality (1.4.4); reflow at 320 CSS px without horizontal scroll (1.4.10).",
      "ARIA usage: semantic HTML first; ARIA only when no native element conveys the same semantics. Name / role / value correct on custom widgets (4.1.2). Status messages programmatically determinable (4.1.3).",
      "Reduced motion: respect prefers-reduced-motion (3.3.1 / WCAG 2.2 candidate) for any animation triggered by interaction or page load.",
      "Testing: automated tooling (axe-core, Lighthouse, pa11y) catches roughly 30% of WCAG criteria. Manual review is required for the remainder — keyboard walkthrough, screen-reader pass (NVDA on Windows, VoiceOver on macOS/iOS), contrast spot-check, reduced-motion check.",
    ],
    links: [
      {
        label: "WCAG 2.1 — W3C Recommendation",
        href: "https://www.w3.org/TR/WCAG21/",
      },
      {
        label: "WCAG 2.1 quick reference (filterable by level)",
        href: "https://www.w3.org/WAI/WCAG21/quickref/",
      },
      {
        label: "WAI-ARIA Authoring Practices",
        href: "https://www.w3.org/WAI/ARIA/apg/",
      },
      {
        label: "WebAIM contrast checker",
        href: "https://webaim.org/resources/contrastchecker/",
      },
      {
        label: "axe-core (automated rules engine)",
        href: "https://github.com/dequelabs/axe-core",
      },
    ],
    dateRequested: PLACEHOLDER_DATE,
    status: "in-discussion",
    responseNote:
      "WCAG 2.1 Level AA confirmed as the binding compliance level for institutional UI applications. The OIT Enterprise AI Development Framework draft does not yet enumerate accessibility-specific testing requirements, ARIA expectations, or per-component checks; this entry tracks the elaboration alongside the WCAG references.",
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
    status: "not-started",
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
    status: "not-started",
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
    status: "not-started",
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
    status: "not-started",
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
    status: "not-started",
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
    status: "not-started",
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
    status: "in-discussion",
    responseUrl: OIT_FRAMEWORK_URL,
    responseNote:
      "Framework establishes EAR (Enterprise Architecture Review) as the deviation process for tech-stack exceptions and VASA for vendor exceptions — these cover the engineering side of the decision authority structure. UX-specific ownership and conflict resolution between design / engineering / OIT are not yet specified.",
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
    "not-started": 0,
    "in-discussion": 0,
    "in-draft": 0,
    approved: 0,
  } as Record<StandardsWatchStatus, number>;
  for (const item of items) counts[item.status]++;
  const outstanding = items.filter((i) => i.status !== "approved");
  const oldestOutstanding = outstanding
    .map((i) => daysSince(i.dateRequested))
    .sort((a, b) => b - a)[0] ?? 0;
  return { counts, total: items.length, outstanding: outstanding.length, oldestOutstanding };
}
