// Standards Foundation — the definitions, profiles, and reusable evidence
// instruments that make the twenty proposed standards assessable without
// relying on undocumented institutional knowledge.

export type FoundationConfidence = "high" | "moderate" | "experimental";

export interface EvidenceTier {
  rank: number;
  label: string;
  use: string;
  treatment: string;
  sourceIds?: string[];
}

export interface FoundationDefinition {
  id: string;
  term: string;
  definition: string;
  decisionRule: string;
  examples: string[];
  relatedStandards: string[];
  confidence: FoundationConfidence;
  sourceIds: string[];
}

export interface AssuranceLevel {
  level: 1 | 2 | 3;
  label: string;
  defaultUse: string;
  minimumEvidence: string[];
  verification: string;
}

export interface AssuranceDimension {
  id: string;
  label: string;
  question: string;
  level2Trigger: string;
  level3Trigger: string;
}

export interface TemplateSection {
  id: string;
  label: string;
  prompt: string;
  acceptableEvidence: string;
}

export interface EvidenceArtifact {
  id: string;
  name: string;
  purpose: string;
  minimumContents: string[];
  freshness: string;
  relatedStandards: string[];
}

export interface ProvisionalDefaultStep {
  step: number;
  label: string;
  requirement: string;
}

export const CONFIDENCE_LABELS: Record<FoundationConfidence, string> = {
  high: "High confidence",
  moderate: "Moderate confidence",
  experimental: "Experimental",
};

export const EVIDENCE_HIERARCHY: readonly EvidenceTier[] = [
  {
    rank: 1,
    label: "Binding obligation",
    use: "Applicable law, regulation, contract, and current University policy.",
    treatment: "Adopt as a gate; local drafts may clarify implementation but may not weaken it.",
    sourceIds: ["ada-title-ii-web", "ui-apm-30-11", "ui-it-standards"],
  },
  {
    rank: 2,
    label: "Consensus standard",
    use: "Stable specifications produced through an open or recognized standards process.",
    treatment: "Adopt or profile explicitly; pin the version and identify any exclusions.",
    sourceIds: ["wcag-21", "owasp-asvs", "openapi-311", "rfc-9110"],
  },
  {
    rank: 3,
    label: "Government guidance",
    use: "Risk, security, privacy, and digital-service guidance from accountable public bodies.",
    treatment: "Use as the primary rationale and assessment pattern when no binding rule controls.",
    sourceIds: ["nist-800-53", "nist-ssdf", "nist-privacy", "uswds-principles"],
  },
  {
    rank: 4,
    label: "Higher-education practice",
    use: "Community-developed instruments and published peer-institution control profiles.",
    treatment: "Use to calibrate feasibility, evidence expectations, and sector-specific risk.",
    sourceIds: ["educause-hecvat", "internet2-netplus", "berkeley-mssei"],
  },
  {
    rank: 5,
    label: "Documented implementation practice",
    use: "Maintained technical guidance and measurement methods from responsible projects or vendors.",
    treatment: "Use for implementation and measurement; do not mislabel it as law or consensus.",
    sourceIds: ["opentelemetry", "core-web-vitals", "wai-apg"],
  },
  {
    rank: 6,
    label: "First-principles default",
    use: "A necessary local decision not determined by stronger evidence.",
    treatment: "Publish the reasoning, alternative, confidence, assessment, and calibration trigger.",
  },
] as const;

export const FOUNDATION_DEFINITIONS: readonly FoundationDefinition[] = [
  {
    id: "protected-action",
    term: "Protected action",
    definition: "An action that creates, changes, deletes, releases, approves, or authorizes data, access, money, academic standing, employment status, compliance status, or another institutional decision.",
    decisionRule: "Treat an action as protected when unauthorized or erroneous execution could create a meaningful adverse effect or require an accountable institutional correction.",
    examples: ["Change a grade", "Approve payroll or financial aid", "Provision an administrator", "Release student records", "Delete research data"],
    relatedStandards: ["i-4", "ii-2", "ii-4", "ii-8"],
    confidence: "high",
    sourceIds: ["ui-apm-30-11", "nist-800-53", "owasp-asvs"],
  },
  {
    id: "high-consequence-action",
    term: "High-consequence action",
    definition: "A protected action whose misuse or error could materially affect rights, academic standing, employment, financial obligations, privacy, safety, system access, regulatory compliance, or a significant body of institutional records and is difficult to detect, reverse, or contain.",
    decisionRule: "Classify as high consequence when any listed impact is severe, when reversal depends on multiple offices or external parties, or when one action can affect 500 or more people or records.",
    examples: ["Bulk grade change", "Disbursement approval", "Identity or privileged-access provisioning", "Admissions decision", "Disclosure of High-risk data"],
    relatedStandards: ["i-4", "ii-2", "ii-4", "ii-8"],
    confidence: "moderate",
    sourceIds: ["ui-apm-30-11", "owasp-asvs", "berkeley-mssei"],
  },
  {
    id: "critical-workflow",
    term: "Critical workflow",
    definition: "A complete user task whose failure prevents or materially delays access to a University service, right, obligation, academic activity, employment function, payment, or safety-related outcome.",
    decisionRule: "A workflow is critical when no timely equivalent path exists or when delay can cause missed eligibility, financial, academic, legal, or safety consequences.",
    examples: ["Apply for admission", "Register for classes", "Submit grades", "Approve time or payroll", "Request an accommodation"],
    relatedStandards: ["ii-3", "ii-4", "ii-5", "ii-6", "ii-8"],
    confidence: "high",
    sourceIds: ["ada-title-ii-web", "uswds-principles", "digital-playbook"],
  },
  {
    id: "critical-service",
    term: "Critical service",
    definition: "A service supporting one or more critical workflows or an institutional capability whose prolonged loss creates material academic, financial, operational, compliance, research, or safety impact.",
    decisionRule: "Classify as critical when the maximum tolerable outage is less than one business day or when outage timing can cause an irreversible missed deadline or institutional breach.",
    examples: ["Identity and access", "Learning management", "Student registration", "Payroll", "Emergency communications"],
    relatedStandards: ["i-6", "i-10", "ii-5"],
    confidence: "moderate",
    sourceIds: ["nist-800-53", "internet2-netplus"],
  },
  {
    id: "material-change",
    term: "Material change",
    definition: "A change that can alter security, privacy, accessibility, architecture, data use, user decisions, service objectives, external integrations, or the evidence supporting an approval.",
    decisionRule: "Treat a change as material when it adds a data category, role, integration, vendor, model, protected action, critical workflow, major dependency, public interface, or changes a trust boundary.",
    examples: ["Add SSO or a privileged role", "Introduce an AI vendor", "Move hosting providers", "Collect a new personal-data field", "Redesign a critical form"],
    relatedStandards: ["i-1", "i-6", "i-9", "ii-3", "ii-4", "ii-8"],
    confidence: "high",
    sourceIds: ["nist-800-53", "nist-ssdf", "nist-privacy"],
  },
  {
    id: "material-release",
    term: "Material release",
    definition: "A release containing a material change or a set of changes whose combined user or operational impact warrants renewed evidence and approval.",
    decisionRule: "If any included change is material, the release is material; product owners may also classify a cumulative release as material based on combined impact.",
    examples: ["New protected action", "New public workflow", "Major framework upgrade", "Changed authorization model"],
    relatedStandards: ["i-5", "i-9", "ii-8"],
    confidence: "high",
    sourceIds: ["nist-800-53", "nist-ssdf"],
  },
  {
    id: "representative-user",
    term: "Representative user",
    definition: "A participant whose role, goals, experience, access needs, device or environment, and likely barriers reflect a user group affected by the service.",
    decisionRule: "Research coverage is representative only when it includes each primary role and the people expected to encounter the greatest barriers; demographic similarity alone is insufficient.",
    examples: ["Student using only a phone", "Faculty member using a screen reader", "Department administrator handling exceptions", "Rural user on constrained bandwidth"],
    relatedStandards: ["ii-4", "ii-7", "ii-8"],
    confidence: "high",
    sourceIds: ["uswds-principles", "digital-playbook", "wcag-em"],
  },
  {
    id: "current-evidence",
    term: "Current evidence",
    definition: "Evidence produced from the assessed version and environment within its defined freshness period, with enough provenance for an independent reviewer to reproduce or verify the conclusion.",
    decisionRule: "Evidence is not current after a material change, after its stated freshness period, or when its source, scope, version, or assessor cannot be established.",
    examples: ["CI result tied to a release commit", "28-day production measurement", "Annual access review", "Restore test for the current architecture"],
    relatedStandards: ["i-4", "i-5", "i-6", "i-10", "ii-3", "ii-5"],
    confidence: "high",
    sourceIds: ["nist-800-53a", "wcag-em"],
  },
  {
    id: "risk-owner",
    term: "Risk owner",
    definition: "The named individual with authority over the affected mission or business outcome and sufficient accountability to accept, fund treatment of, or stop the risk.",
    decisionRule: "A development team, vendor, committee, or department name alone is not a risk owner; the record must name an individual and the authority under which they decide.",
    examples: ["Data Owner", "Service executive", "CIO-authorized security authority", "College or division executive"],
    relatedStandards: ["i-3", "i-6", "i-8", "i-9", "ii-9", "ii-10"],
    confidence: "high",
    sourceIds: ["ui-apm-30-11", "nist-csf"],
  },
  {
    id: "compensating-control",
    term: "Compensating control",
    definition: "A documented safeguard that addresses the same risk objective as an unmet requirement with comparable, testable protection.",
    decisionRule: "Additional effort, monitoring, or policy language is compensating only when it reduces the identified risk and produces evidence that can be independently assessed.",
    examples: ["Independent approval plus enhanced monitoring", "Network isolation replacing unavailable endpoint control", "Manual reconciliation with recorded dual review"],
    relatedStandards: ["i-4", "i-8", "ii-10"],
    confidence: "high",
    sourceIds: ["nist-800-53", "berkeley-mssei"],
  },
  {
    id: "equivalent-path",
    term: "Equivalent path",
    definition: "An alternative way to complete the same task with comparable timeliness, privacy, independence, dignity, accuracy, and service availability.",
    decisionRule: "A phone number or request-for-help is not equivalent when it imposes delay, disclosure, limited hours, dependency on another person, or materially greater effort.",
    examples: ["Accessible version with the same data and completion time", "Staff-assisted process available on equal terms", "Alternative input method preserving all functions"],
    relatedStandards: ["ii-3", "ii-4", "ii-6", "ii-10"],
    confidence: "high",
    sourceIds: ["ada-title-ii-web", "wcag-21"],
  },
  {
    id: "supported-environment",
    term: "Supported environment",
    definition: "A documented combination of browser, device class, operating system, assistive technology, network condition, and viewport against which the service commits to functioning.",
    decisionRule: "The matrix must cover observed or expected users and may exclude an environment only with usage evidence, impact analysis, and an equivalent path where required.",
    examples: ["Current Chrome, Firefox, Safari, and Edge", "VoiceOver/Safari", "NVDA/Chrome or Firefox", "Mobile viewport on constrained broadband"],
    relatedStandards: ["ii-1", "ii-2", "ii-3", "ii-4", "ii-5"],
    confidence: "moderate",
    sourceIds: ["wcag-em", "uswds"],
  },
  {
    id: "critical-finding",
    term: "Critical finding",
    definition: "A verified defect that enables severe unauthorized impact, blocks a critical workflow, exposes High-risk data, creates a safety risk, or makes a covered service inaccessible without a timely equivalent path.",
    decisionRule: "Classify by demonstrated or credible impact, not by tool severity alone; a finding remains critical until the affected path is prevented, remediated, or formally taken out of service.",
    examples: ["Authorization bypass", "Credential exposure", "Inaccessible registration submission", "Unrecoverable data corruption"],
    relatedStandards: ["i-4", "i-7", "ii-3", "ii-8"],
    confidence: "moderate",
    sourceIds: ["nist-ssdf", "owasp-asvs", "ada-title-ii-web"],
  },
] as const;

export const ASSURANCE_LEVELS: readonly AssuranceLevel[] = [
  {
    level: 1,
    label: "Essential",
    defaultUse: "Public, low-risk, non-transactional applications with no sensitive University data, privileged roles, or high-consequence actions.",
    minimumEvidence: ["Assurance profile", "Architecture/attack-surface sketch", "ASVS 5.0.0 Level 1 results", "Dependency and vulnerability results"],
    verification: "Team verification with independent review of any failed or excluded requirement.",
  },
  {
    level: 2,
    label: "Standard production",
    defaultUse: "Most production applications, including authenticated services, business workflows, external integrations, and systems processing Moderate-risk data.",
    minimumEvidence: ["Assurance profile", "Lightweight threat model", "ASVS 5.0.0 Level 2 results", "Authorization and integration tests", "Finding dispositions"],
    verification: "Independent technical review; security participation for Moderate-risk data or consequential actions.",
  },
  {
    level: 3,
    label: "High assurance",
    defaultUse: "Systems with High-risk data, high-consequence actions, safety or regulatory impact, institution-wide blast radius, or unusually demanding availability or adversary assumptions.",
    minimumEvidence: ["Approved assurance profile", "Detailed threat model", "ASVS 5.0.0 Level 3 results", "Independent security assessment", "Residual-risk acceptance", "Recovery exercise"],
    verification: "Independent security assessment and named risk-owner approval before production and after material change.",
  },
] as const;

export const ASSURANCE_DIMENSIONS: readonly AssuranceDimension[] = [
  {
    id: "data",
    label: "Data classification",
    question: "What is the highest University data classification stored, processed, generated, or accessible?",
    level2Trigger: "Moderate-risk data or credentials providing access to it.",
    level3Trigger: "High-risk data, regulated data requiring heightened assurance, or bulk access with severe disclosure impact.",
  },
  {
    id: "actions",
    label: "Protected actions",
    question: "What decisions or state changes can a user, administrator, integration, or automated process perform?",
    level2Trigger: "Any protected action affecting another person, institutional record, access, or money.",
    level3Trigger: "Any high-consequence action or bulk protected action.",
  },
  {
    id: "exposure",
    label: "Exposure and adversaries",
    question: "Who can reach the service and what attacker capability is credible?",
    level2Trigger: "Internet exposure, external identities, vendor access, or untrusted file/data input.",
    level3Trigger: "Public high-value target, sophisticated adversary, or exposure of privileged administrative functions.",
  },
  {
    id: "privilege",
    label: "Identity and privilege",
    question: "What roles exist and what is the maximum authority of one identity or service account?",
    level2Trigger: "Authenticated users, delegated administration, or service-to-service credentials.",
    level3Trigger: "Institution-wide privilege, security administration, identity provisioning, or ability to override separation of duties.",
  },
  {
    id: "reach",
    label: "Scale and blast radius",
    question: "How many people, records, units, or dependent systems could one failure affect?",
    level2Trigger: "A college/division, 500 or more people or records, or multiple dependent systems.",
    level3Trigger: "Institution-wide population, 10,000 or more records, or cascading impact across critical services.",
  },
  {
    id: "availability",
    label: "Availability and recovery",
    question: "What happens when the service is unavailable, incorrect, or unrecoverable?",
    level2Trigger: "Material operational delay or maximum tolerable outage below three business days.",
    level3Trigger: "Critical service, safety impact, irreversible deadline, or maximum tolerable outage below one business day.",
  },
  {
    id: "obligation",
    label: "External obligation",
    question: "What legal, contractual, grant, accreditation, or research obligation applies?",
    level2Trigger: "Documented compliance or contractual security/accessibility obligation.",
    level3Trigger: "Obligation requiring independent assurance, severe breach reporting, or material institutional liability.",
  },
] as const;

export const THREAT_MODEL_SECTIONS: readonly TemplateSection[] = [
  { id: "purpose", label: "Purpose and decision scope", prompt: "What does the system do, what release or decision does this model support, and what is explicitly out of scope?", acceptableEvidence: "One-paragraph purpose, assessed version, environment, owner, and out-of-scope list." },
  { id: "diagram", label: "System and data flows", prompt: "Where do users, services, vendors, data stores, models, and external systems exchange data?", acceptableEvidence: "Current architecture/data-flow diagram with trust boundaries, protocols, and data classifications." },
  { id: "assets", label: "Assets and protected actions", prompt: "What information, functions, credentials, decisions, or institutional capabilities require protection?", acceptableEvidence: "Prioritized asset and protected-action inventory tied to accountable owners." },
  { id: "actors", label: "Actors and capabilities", prompt: "Who uses, administers, integrates with, or may attack the system, and what access or capability can each possess?", acceptableEvidence: "User/role list plus plausible internal, external, vendor, and automated threat actors." },
  { id: "boundaries", label: "Trust boundaries and entry points", prompt: "Where does trust, identity, administration, code, or data cross between differently controlled environments?", acceptableEvidence: "Annotated boundaries and entry points, including APIs, uploads, prompts, webhooks, admin tools, and support access." },
  { id: "abuse", label: "Misuse and abuse cases", prompt: "How could an actor misuse a protected action, bypass a rule, manipulate data, exhaust a resource, or create harmful output?", acceptableEvidence: "Concrete abuse cases written as actor, action, target, and consequence." },
  { id: "controls", label: "Controls and verification", prompt: "What prevents, detects, contains, or recovers from each plausible threat, and how will it be tested?", acceptableEvidence: "Threat-to-control-to-test mapping with ASVS identifiers where applicable." },
  { id: "residual", label: "Residual risk and decisions", prompt: "What remains possible after controls, who owns that risk, and what disposition was approved?", acceptableEvidence: "Residual-risk statement, likelihood/impact rationale, treatment, owner, approval, and expiry if accepted." },
  { id: "review", label: "Review and change triggers", prompt: "When must this model be revisited?", acceptableEvidence: "Named reviewer and triggers including material change, incident, new threat, failed control, and scheduled annual review for Levels 2–3." },
] as const;

export const EVIDENCE_ARTIFACTS: readonly EvidenceArtifact[] = [
  { id: "assurance-profile", name: "Application Assurance Profile", purpose: "Selects the minimum assurance level through explicit, non-averaged triggers.", minimumContents: ["System and owner", "Seven dimension decisions", "Highest trigger", "Selected level", "Reviewer and date"], freshness: "Before production and after material change", relatedStandards: ["i-4"] },
  { id: "threat-model", name: "Threat Model", purpose: "Connects architecture and plausible abuse to controls, tests, and residual-risk ownership.", minimumContents: THREAT_MODEL_SECTIONS.map((section) => section.label), freshness: "Current release; Level 2–3 annual review", relatedStandards: ["i-1", "i-4", "i-7", "i-9"] },
  { id: "architecture-record", name: "Architecture and Data-Flow Record", purpose: "Shows components, integrations, trust boundaries, data stores, classifications, protocols, and owners.", minimumContents: ["Context diagram", "Data flows", "Trust boundaries", "Data classification", "Version and owner"], freshness: "After material architecture or data-use change", relatedStandards: ["i-1", "i-3", "i-5", "i-6"] },
  { id: "control-profile", name: "Control Applicability Profile", purpose: "Records which versioned controls apply and why any control is excluded or replaced.", minimumContents: ["Framework and version", "Requirement identifier", "Applicability", "Evidence link", "Result", "Disposition"], freshness: "Each material release", relatedStandards: ["i-4"] },
  { id: "accessibility-report", name: "Accessibility Conformance Report", purpose: "Records WCAG scope, sample, manual and automated methods, findings, and conformance conclusion.", minimumContents: ["WCAG version/level", "Scope and sample", "Evaluator", "Methods", "Criterion results", "Critical-process results", "Open findings"], freshness: "Before launch, after material change, and annually", relatedStandards: ["ii-2", "ii-3", "ii-4"] },
  { id: "usability-report", name: "Critical-Task Usability Report", purpose: "Shows whether representative users can complete the tasks that matter.", minimumContents: ["Participants and coverage", "Tasks", "Measures and thresholds", "Observations", "Findings", "Decisions and retest"], freshness: "Each material workflow release", relatedStandards: ["ii-4", "ii-7", "ii-8"] },
  { id: "performance-report", name: "Production Performance Report", purpose: "Provides field measurements for user experience and service objectives.", minimumContents: ["Measured population", "Period", "p75 Core Web Vitals", "Critical transaction SLOs", "Coverage gaps", "Owner and actions"], freshness: "Rolling 28 days; monthly review", relatedStandards: ["i-10", "ii-5"] },
  { id: "exception-record", name: "Standards Exception Record", purpose: "Makes deviations time-bounded, owned, compensating, and reviewable.", minimumContents: ["Requirement", "Scope", "Reason", "Risk", "Compensating controls", "Evidence", "Owner", "Approver", "Expiry", "Exit plan"], freshness: "Until expiry; review after material change", relatedStandards: ["i-8", "ii-10"] },
  { id: "evidence-index", name: "Evidence Index", purpose: "Gives an assessor one durable map from requirements to current evidence.", minimumContents: ["Requirement ID", "Artifact", "Version/environment", "Produced date", "Freshness date", "Owner", "Result"], freshness: "Each assessment and material release", relatedStandards: ["i-8", "ii-10"] },
] as const;

export const PROVISIONAL_DEFAULT_PROCESS: readonly ProvisionalDefaultStep[] = [
  { step: 1, label: "State the decision", requirement: "Name the concrete behavior, threshold, or definition that must be supplied." },
  { step: 2, label: "Trace the evidence", requirement: "Record the strongest applicable sources and distinguish binding, consensus, sector, and implementation guidance." },
  { step: 3, label: "Reason from harm", requirement: "Describe the adverse outcome, affected people or mission, likelihood assumptions, reversibility, and operational burden." },
  { step: 4, label: "Publish a default", requirement: "Choose the simplest conservative rule that is measurable and feasible; identify alternatives considered." },
  { step: 5, label: "Declare confidence", requirement: "Mark the default High, Moderate, or Experimental and explain the uncertainty." },
  { step: 6, label: "Set calibration", requirement: "Name the evidence, pilot result, incident, cost, or institutional decision that would trigger revision." },
] as const;

export const FOUNDATION_TEMPLATE_LINKS = [
  { href: "/templates/application-assurance-profile.md", label: "Application Assurance Profile", file: "public/templates/application-assurance-profile.md" },
  { href: "/templates/threat-model.md", label: "Threat Model", file: "public/templates/threat-model.md" },
  { href: "/templates/standards-exception.md", label: "Standards Exception", file: "public/templates/standards-exception.md" },
  { href: "/templates/evidence-index.md", label: "Evidence Index", file: "public/templates/evidence-index.md" },
] as const;

export function foundationSummary() {
  return {
    definitions: FOUNDATION_DEFINITIONS.length,
    assuranceDimensions: ASSURANCE_DIMENSIONS.length,
    threatModelSections: THREAT_MODEL_SECTIONS.length,
    evidenceArtifacts: EVIDENCE_ARTIFACTS.length,
    templates: FOUNDATION_TEMPLATE_LINKS.length,
  };
}

export function validateStandardsFoundation(sourceIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  const definitionIds = new Set<string>();
  const artifactIds = new Set<string>();

  for (const definition of FOUNDATION_DEFINITIONS) {
    if (definitionIds.has(definition.id)) errors.push(`Duplicate foundation definition ${definition.id}`);
    definitionIds.add(definition.id);
    if (definition.relatedStandards.length === 0) errors.push(`Definition ${definition.id} has no related standards`);
    for (const sourceId of definition.sourceIds) {
      if (!sourceIds.has(sourceId)) errors.push(`Definition ${definition.id} references unknown source ${sourceId}`);
    }
  }

  for (const artifact of EVIDENCE_ARTIFACTS) {
    if (artifactIds.has(artifact.id)) errors.push(`Duplicate evidence artifact ${artifact.id}`);
    artifactIds.add(artifact.id);
    if (artifact.minimumContents.length === 0) errors.push(`Evidence artifact ${artifact.id} has no minimum contents`);
  }

  if (ASSURANCE_LEVELS.length !== 3) errors.push("Foundation must define three assurance levels");
  if (ASSURANCE_DIMENSIONS.length === 0) errors.push("Foundation has no assurance dimensions");
  if (THREAT_MODEL_SECTIONS.length === 0) errors.push("Foundation has no threat-model sections");

  return errors;
}
