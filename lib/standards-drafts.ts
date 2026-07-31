// Proposed, evidence-backed standards attached to the twenty-item standards
// ledger. These are working drafts, not ratified University policy. The
// standards-watch status remains the authoritative approval state.

export type SourceAuthority =
  | "binding-policy"
  | "consensus-standard"
  | "government-guidance"
  | "higher-ed-practice"
  | "implementation-guidance";

export interface StandardsSource {
  id: string;
  shortLabel: string;
  title: string;
  publisher: string;
  version?: string;
  href: string;
  authority: SourceAuthority;
  note: string;
  checkedOn: string;
}

export interface DraftRequirement {
  id: string;
  statement: string;
  evidence: string[];
  assessment: string;
  critical?: boolean;
}

export interface DraftAssessment {
  cadence: string;
  assessor: string;
  conformanceRule: string;
}

export interface StandardDraft {
  standardId: string;
  scope: string;
  rationale: string;
  sourceIds: string[];
  requirements: DraftRequirement[];
  localDecisions: string[];
  assessment: DraftAssessment;
  exceptionProcess: string;
}

export interface MaturityLevel {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  definition: string;
}

export const SOURCE_AUTHORITY_LABELS: Record<SourceAuthority, string> = {
  "binding-policy": "Binding policy or law",
  "consensus-standard": "Consensus standard",
  "government-guidance": "Government guidance",
  "higher-ed-practice": "Higher-ed practice",
  "implementation-guidance": "Implementation guidance",
};

export const MATURITY_LEVELS: readonly MaturityLevel[] = [
  {
    score: 0,
    label: "Absent",
    definition: "No defined practice and no reliable evidence.",
  },
  {
    score: 1,
    label: "Ad hoc",
    definition: "Some teams perform the practice, but it is inconsistent or person-dependent.",
  },
  {
    score: 2,
    label: "Defined",
    definition: "The practice is documented, assigned, and repeatable.",
  },
  {
    score: 3,
    label: "Evidenced",
    definition: "The practice is implemented and supported by current, reviewable evidence.",
  },
  {
    score: 4,
    label: "Managed",
    definition: "Results are monitored, exceptions are controlled, and findings drive improvement.",
  },
] as const;

const CHECKED_ON = "2026-07-31";

export const STANDARDS_SOURCES: readonly StandardsSource[] = [
  {
    id: "ui-apm-30-11",
    shortLabel: "APM 30.11",
    title: "University Data Classification and Standards",
    publisher: "University of Idaho",
    href: "https://www.uidaho.edu/policies/apm/30/11",
    authority: "binding-policy",
    note: "Defines Low, Moderate, and High risk classifications, accountable data roles, minimum protection, and annual exception review.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "ui-it-standards",
    shortLabel: "U of I IT standards",
    title: "Information Technology Standards",
    publisher: "University of Idaho OIT",
    href: "https://www.uidaho.edu/leadership/information-technology/standards",
    authority: "binding-policy",
    note: "Published institutional specifications and protocols supporting University technology policy.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "ui-brand",
    shortLabel: "U of I brand",
    title: "University of Idaho Brand",
    publisher: "University of Idaho",
    href: "https://www.uidaho.edu/brand",
    authority: "binding-policy",
    note: "Institutional source for approved identity, color, logo, typography, and voice decisions.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "ui-accessibility",
    shortLabel: "U of I accessibility",
    title: "Website Accessibility",
    publisher: "University of Idaho",
    href: "https://www.uidaho.edu/brand/ucm/web-and-digital/web-accessibility",
    authority: "binding-policy",
    note: "States the University's public-institution commitment to ADA Title II digital accessibility.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "ada-title-ii-web",
    shortLabel: "ADA Title II web rule",
    title: "Accessibility of Web Content and Mobile Apps Provided by State and Local Government Entities",
    publisher: "U.S. Department of Justice",
    href: "https://www.ada.gov/resources/2024-03-08-web-rule/",
    authority: "binding-policy",
    note: "Establishes WCAG 2.1 Level A and AA as the technical conformance standard for covered public entities.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "nist-800-53",
    shortLabel: "NIST SP 800-53",
    title: "Security and Privacy Controls for Information Systems and Organizations",
    publisher: "National Institute of Standards and Technology",
    version: "Revision 5",
    href: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
    authority: "government-guidance",
    note: "Control catalog covering architecture, access, audit, configuration, contingency, incident response, acquisition, and system integrity.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "nist-800-53a",
    shortLabel: "NIST SP 800-53A",
    title: "Assessing Security and Privacy Controls in Information Systems and Organizations",
    publisher: "National Institute of Standards and Technology",
    version: "Revision 5",
    href: "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final",
    authority: "government-guidance",
    note: "Defines examine, interview, and test methods for evidence-based control assessment.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "nist-ssdf",
    shortLabel: "NIST SSDF",
    title: "Secure Software Development Framework",
    publisher: "National Institute of Standards and Technology",
    version: "SP 800-218 v1.1",
    href: "https://csrc.nist.gov/pubs/sp/800/218/final",
    authority: "government-guidance",
    note: "Common secure-development practices for preparing, protecting, producing, and responding to software vulnerabilities.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "nist-csf",
    shortLabel: "NIST CSF 2.0",
    title: "Cybersecurity Framework",
    publisher: "National Institute of Standards and Technology",
    version: "2.0",
    href: "https://www.nist.gov/cyberframework",
    authority: "government-guidance",
    note: "Risk-based governance outcomes organized around Govern, Identify, Protect, Detect, Respond, and Recover.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "nist-privacy",
    shortLabel: "NIST Privacy Framework",
    title: "Privacy Framework: A Tool for Improving Privacy through Enterprise Risk Management",
    publisher: "National Institute of Standards and Technology",
    href: "https://www.nist.gov/privacy-framework/privacy-framework",
    authority: "government-guidance",
    note: "Supports data inventory, privacy-risk assessment, governance, controls, current/target profiles, and reassessment.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "nist-800-92",
    shortLabel: "NIST SP 800-92",
    title: "Guide to Computer Security Log Management",
    publisher: "National Institute of Standards and Technology",
    href: "https://csrc.nist.gov/pubs/sp/800/92/final",
    authority: "government-guidance",
    note: "Establishes log-management infrastructure, operational processes, and lifecycle considerations.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "owasp-asvs",
    shortLabel: "OWASP ASVS",
    title: "Application Security Verification Standard",
    publisher: "OWASP Foundation",
    version: "5.0.0",
    href: "https://owasp.org/www-project-application-security-verification-standard/",
    authority: "consensus-standard",
    note: "Testable application-security requirements with risk-based verification levels.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "owasp-api",
    shortLabel: "OWASP API Security",
    title: "OWASP API Security Top 10",
    publisher: "OWASP Foundation",
    href: "https://owasp.org/API-Security/",
    authority: "implementation-guidance",
    note: "API-specific risks and mitigations for authorization, authentication, consumption, inventory, and unsafe integrations.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "rfc-9110",
    shortLabel: "RFC 9110",
    title: "HTTP Semantics",
    publisher: "Internet Engineering Task Force",
    version: "RFC 9110",
    href: "https://www.rfc-editor.org/rfc/rfc9110",
    authority: "consensus-standard",
    note: "Normative HTTP method, status, representation, caching, and authentication semantics.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "rfc-9457",
    shortLabel: "RFC 9457",
    title: "Problem Details for HTTP APIs",
    publisher: "Internet Engineering Task Force",
    version: "RFC 9457",
    href: "https://www.rfc-editor.org/rfc/rfc9457",
    authority: "consensus-standard",
    note: "Standard machine-readable format for actionable HTTP API error responses.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "openapi-311",
    shortLabel: "OpenAPI 3.1.1",
    title: "OpenAPI Specification",
    publisher: "OpenAPI Initiative",
    version: "3.1.1",
    href: "https://spec.openapis.org/oas/v3.1.1.html",
    authority: "consensus-standard",
    note: "Machine-readable contract format for HTTP APIs, schemas, security, examples, and documentation.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "cisa-secure-by-design",
    shortLabel: "CISA Secure by Design",
    title: "Secure by Design",
    publisher: "Cybersecurity and Infrastructure Security Agency",
    href: "https://www.cisa.gov/securebydesign",
    authority: "government-guidance",
    note: "Makes customer security outcomes, secure defaults, and transparency core product requirements.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "slsa",
    shortLabel: "SLSA",
    title: "Supply-chain Levels for Software Artifacts",
    publisher: "OpenSSF",
    href: "https://slsa.dev/spec/",
    authority: "consensus-standard",
    note: "Incremental requirements for build provenance and protection against software supply-chain tampering.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "opentelemetry",
    shortLabel: "OpenTelemetry",
    title: "OpenTelemetry Semantic Conventions",
    publisher: "Cloud Native Computing Foundation",
    href: "https://opentelemetry.io/docs/specs/semconv/",
    authority: "consensus-standard",
    note: "Common names and meanings for service, request, error, trace, metric, log, and resource telemetry.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "wcag-21",
    shortLabel: "WCAG 2.1",
    title: "Web Content Accessibility Guidelines 2.1",
    publisher: "World Wide Web Consortium",
    version: "2.1",
    href: "https://www.w3.org/TR/WCAG21/",
    authority: "consensus-standard",
    note: "Normative success criteria and conformance requirements incorporated by the ADA Title II web rule.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "wcag-em",
    shortLabel: "WCAG-EM",
    title: "Website Accessibility Conformance Evaluation Methodology",
    publisher: "World Wide Web Consortium",
    href: "https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/",
    authority: "implementation-guidance",
    note: "Repeatable scope, sampling, evaluation, and reporting method for WCAG conformance assessments.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "wai-apg",
    shortLabel: "WAI-ARIA APG",
    title: "ARIA Authoring Practices Guide",
    publisher: "World Wide Web Consortium",
    href: "https://www.w3.org/WAI/ARIA/apg/",
    authority: "implementation-guidance",
    note: "Keyboard, focus, role, state, and property patterns for accessible custom interface components.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "uswds",
    shortLabel: "USWDS",
    title: "U.S. Web Design System",
    publisher: "U.S. General Services Administration",
    href: "https://designsystem.digital.gov/",
    authority: "government-guidance",
    note: "Research-backed component, pattern, accessibility, token, and implementation guidance for public digital services.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "uswds-principles",
    shortLabel: "USWDS principles",
    title: "U.S. Web Design System Design Principles",
    publisher: "U.S. General Services Administration",
    href: "https://designsystem.digital.gov/design-principles/",
    authority: "government-guidance",
    note: "Evaluative guidance centered on real user needs, trust, continuity, access, and evidence.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "digital-playbook",
    shortLabel: "Digital Services Playbook",
    title: "U.S. Digital Services Playbook",
    publisher: "U.S. Chief Information Officers Council",
    href: "https://playbook.cio.gov/",
    authority: "government-guidance",
    note: "Thirteen practices for user-centered, iterative, measurable, secure digital-service delivery.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "plain-language",
    shortLabel: "Federal plain language",
    title: "Federal Plain Language Guidelines",
    publisher: "PlainLanguage.gov",
    href: "https://www.plainlanguage.gov/guidelines/",
    authority: "government-guidance",
    note: "Guidance for audience-centered organization, short direct language, informative headings, and usable content.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "core-web-vitals",
    shortLabel: "Core Web Vitals",
    title: "How the Core Web Vitals Metrics Thresholds Were Defined",
    publisher: "Google web.dev",
    href: "https://web.dev/articles/defining-core-web-vitals-thresholds",
    authority: "implementation-guidance",
    note: "Published field-performance thresholds for loading, interaction responsiveness, and visual stability at the 75th percentile.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "educause-hecvat",
    shortLabel: "EDUCAUSE HECVAT",
    title: "Higher Education Community Vendor Assessment Toolkit",
    publisher: "EDUCAUSE, Internet2, and REN-ISAC",
    href: "https://www.educause.edu/higher-education-community-vendor-assessment-toolkit",
    authority: "higher-ed-practice",
    note: "Community-developed higher-education assessment covering cybersecurity, privacy, accessibility, and compliance evidence.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "internet2-netplus",
    shortLabel: "Internet2 NET+",
    title: "NET+ Community-Vetted Cloud Services",
    publisher: "Internet2",
    href: "https://internet2.edu/cloud/internet2-net-plus-services/",
    authority: "higher-ed-practice",
    note: "Peer evaluation model spanning functionality, integration, security and compliance, pricing, contract terms, accessibility, and deployment.",
    checkedOn: CHECKED_ON,
  },
  {
    id: "berkeley-mssei",
    shortLabel: "Berkeley MSSEI",
    title: "Minimum Security Standards for Electronic Information",
    publisher: "University of California, Berkeley",
    href: "https://security.berkeley.edu/node/1154",
    authority: "higher-ed-practice",
    note: "Peer-university example of data-classification and use-category profiles that distinguish required, future, recommended, and not-applicable controls.",
    checkedOn: CHECKED_ON,
  },
] as const;

function req(
  id: string,
  statement: string,
  evidence: string[],
  assessment: string,
  critical = false,
): DraftRequirement {
  return { id, statement, evidence, assessment, critical };
}

const SECURITY_EXCEPTION =
  "Submit a written exception before deployment. Name the risk owner, business need, compensating controls, approval authority, and expiration date; reassess at least annually and after a material change.";

const UX_EXCEPTION =
  "Document the affected users and workflow, explain why the requirement cannot be met, provide an equivalent path where required, name the approving standard owner, and set a review date no later than one year.";

export const STANDARD_DRAFTS: readonly StandardDraft[] = [
  {
    standardId: "i-1",
    scope: "New systems, material integrations, and material architectural changes that store, process, or exchange University data.",
    rationale: "Explicit boundaries, ownership, trust relationships, and data flows make security review, support, change analysis, and handoff possible. Architecture documentation is operational evidence, not presentation material.",
    sourceIds: ["nist-800-53", "nist-800-53a", "ui-apm-30-11"],
    requirements: [
      req("I1-R1", "Before build approval, the team shall publish a version-controlled context diagram naming users, external systems, trust boundaries, data stores, and the accountable owner.", ["Current architecture diagram", "Diagram revision history", "Named system owner"], "Examine the diagram and compare its boundaries with deployed infrastructure and integration inventory.", true),
      req("I1-R2", "Each integration shall use an approved pattern and document protocol, authentication, authorization, data classification, failure behavior, retry/idempotency behavior, and owning teams.", ["Integration inventory", "Interface contract", "Data-classification record"], "Sample every Moderate/High-risk integration and at least three Low-risk integrations; verify every required attribute."),
      req("I1-R3", "Direct database access across application boundaries shall be prohibited unless OIT approves a time-bounded exception with read/write scope, audit controls, and an exit plan.", ["Database grants", "Approved exception or API contract", "Audit-log configuration"], "Compare active cross-system grants with the interface inventory and exception register.", true),
      req("I1-R4", "A material architecture change shall update diagrams and receive impact review before production deployment.", ["Change record", "Updated diagram", "Reviewer approval"], "Trace a sample of material production changes to updated architecture evidence."),
    ],
    localDecisions: ["Approved integration-pattern catalog", "What constitutes a material architecture change", "Architecture approval authority and response time"],
    assessment: { cadence: "At design approval, before production, and after material change", assessor: "Enterprise architecture with the system owner and information security", conformanceRule: "All critical requirements must be Met; at least 90% of remaining applicable requirements must be Met and none may be Not assessed." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "i-2",
    scope: "HTTP APIs and externally consumed application interfaces operated for University business.",
    rationale: "Consistent contracts reduce integration defects and security ambiguity while allowing clients and providers to evolve independently.",
    sourceIds: ["rfc-9110", "rfc-9457", "openapi-311", "owasp-api"],
    requirements: [
      req("I2-R1", "Every production HTTP API shall publish a validated OpenAPI 3.1 contract covering operations, schemas, authentication, error responses, and representative examples.", ["Versioned OpenAPI document", "Contract validation result", "Published documentation URL"], "Validate the contract and compare all production routes and status codes with the document.", true),
      req("I2-R2", "HTTP methods, status codes, caching, conditional requests, and content negotiation shall follow RFC 9110 semantics.", ["Contract", "Automated API tests"], "Run contract tests for success, client error, server error, and caching behavior."),
      req("I2-R3", "API errors shall use RFC 9457 problem details, include a stable problem type and actionable message, and exclude secrets, stack traces, and unnecessary personal data.", ["Error schema", "Negative-path test output", "Log-redaction configuration"], "Exercise representative validation, authorization, missing-resource, rate-limit, and server failures.", true),
      req("I2-R4", "Collection endpoints shall document pagination, filtering, sorting, maximum page size, rate limits, and deterministic ordering; breaking changes shall use an announced version and deprecation window.", ["API contract", "Version/deprecation policy", "Consumer notice"], "Inspect each collection operation and trace one breaking-change rehearsal or completed change."),
    ],
    localDecisions: ["Default and maximum page sizes", "Rate-limit tiers", "Minimum breaking-change notice and support window"],
    assessment: { cadence: "In CI for every change and before production release", assessor: "API owner with architecture and security review for Moderate/High-risk APIs", conformanceRule: "All critical requirements must be Met. Other applicable requirements may be Partially met only with an approved remediation date." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "i-3",
    scope: "Systems and integrations that create, collect, store, transform, disclose, retain, or dispose of University data.",
    rationale: "Data cannot be protected, interpreted, retained, or responsibly reused unless its owner, meaning, sensitivity, lineage, and lifecycle are explicit.",
    sourceIds: ["ui-apm-30-11", "nist-privacy", "nist-800-53"],
    requirements: [
      req("I3-R1", "The accountable Data Owner or Steward shall classify each system at the highest risk level of the data it stores, processes, or accesses and approve the classification before production use.", ["Signed classification record", "Data inventory", "Named Data Owner and Steward"], "Compare representative data elements and integrations with the approved classification.", true),
      req("I3-R2", "Each authoritative domain shall identify its system of record, canonical identifiers, definitions, allowed values, steward, and approved exchange interfaces.", ["Data dictionary", "System-of-record register", "Controlled-vocabulary references"], "Trace a sample of shared fields from source through consuming systems and compare definitions."),
      req("I3-R3", "The system shall document collection purpose, lineage, retention trigger and period, archival location, legal hold behavior, and verified disposal method for each data class.", ["Lifecycle schedule", "Lineage record", "Disposal evidence"], "Examine lifecycle rules and test one retention/disposal path in a non-production environment.", true),
      req("I3-R4", "Backup and recovery controls shall have defined recovery objectives, protected copies, named ownership, and a recorded restore test.", ["Backup configuration", "RPO/RTO statement", "Restore-test report"], "Inspect backup coverage and observe or review the latest restore test."),
    ],
    localDecisions: ["Approved retention schedules by data domain", "Canonical system-of-record registry owner", "Minimum recovery objectives by service tier"],
    assessment: { cadence: "Before production, annually, and when data use or classification changes", assessor: "Data Steward with OIT security and records/privacy stakeholders", conformanceRule: "All critical requirements must be Met. Not applicable determinations require the Data Steward's written approval." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "i-4",
    scope: "University-developed, configured, acquired, or hosted applications and their supporting infrastructure.",
    rationale: "Security and compliance are lifecycle properties. Risk-tiered, testable controls reduce preventable vulnerabilities and make residual risk visible to accountable owners.",
    sourceIds: ["ui-apm-30-11", "ui-it-standards", "nist-ssdf", "owasp-asvs", "cisa-secure-by-design"],
    requirements: [
      req("I4-R1", "Every application shall complete the Application Assurance Profile. The highest applicable trigger across data classification, protected actions, exposure, privilege, blast radius, availability, and external obligations shall determine the minimum OWASP ASVS 5.0.0 level: Level 1 only for eligible low-risk applications, Level 2 for most production applications, and Level 3 for any high-assurance trigger.", ["Completed Application Assurance Profile", "Selected ASVS 5.0.0 control profile", "Threat model at the depth required for the selected level", "Applicability decisions"], "Reperform the seven-dimension profile from current evidence, confirm the highest trigger determines the selected level, and verify that required threat-model and ASVS evidence matches that level.", true),
      req("I4-R2", "Secrets shall be stored only in an OIT-approved secrets service, encrypted in transit and at rest, excluded from source and logs, and rotated after suspected exposure.", ["Secrets inventory", "Repository scan", "Runtime configuration", "Rotation procedure"], "Scan source/history and inspect runtime injection, access control, encryption, and rotation evidence.", true),
      req("I4-R3", "CI shall perform dependency, secret, static-analysis, and container/infrastructure scans where applicable; unresolved critical findings shall block release and high findings require an approved risk disposition.", ["CI configuration", "Scan reports", "Finding dispositions"], "Inspect the latest successful release and intentionally verify blocking behavior in a safe test.", true),
      req("I4-R4", "Authentication shall use approved University identity services; authorization shall enforce least privilege server-side and shall be tested for horizontal and vertical access-control failures.", ["Identity configuration", "Role/permission matrix", "Authorization tests"], "Test representative roles against allowed and prohibited records and functions.", true),
    ],
    localDecisions: ["Calibrate assurance triggers after the first five completed profiles", "Approved scanning tools and severity timeframes", "Approved secrets and encryption services"],
    assessment: { cadence: "Continuously in CI, before release, and annually", assessor: "Information security with the product owner and technical lead", conformanceRule: "Every critical requirement is a release gate. A critical Not met result means Nonconforming regardless of aggregate completion." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "i-5",
    scope: "Build, test, package, deploy, host, and release processes for University applications.",
    rationale: "Repeatable, reviewable delivery reduces configuration drift, supply-chain tampering, failed changes, and reliance on individual operator knowledge.",
    sourceIds: ["nist-ssdf", "nist-800-53", "slsa"],
    requirements: [
      req("I5-R1", "Production artifacts shall be built by an approved CI service from version-controlled source with immutable provenance linking commit, dependencies, build process, and artifact digest.", ["CI build record", "Artifact digest", "Provenance attestation"], "Select a production artifact and trace it reproducibly to reviewed source and build inputs.", true),
      req("I5-R2", "Development, test, and production shall be logically separated; production data shall not be used outside production unless explicitly approved and protected to the production classification.", ["Environment architecture", "Access configuration", "Data-use approval"], "Inspect network, identity, secret, and data boundaries across environments.", true),
      req("I5-R3", "Infrastructure and deployment configuration shall be version controlled, peer reviewed, automatically validated, and reconciled through the approved deployment mechanism.", ["Infrastructure repository", "Review history", "Deployment/reconciliation logs"], "Trace a production configuration change from review through deployment and drift detection."),
      req("I5-R4", "Every production release shall have automated health verification, a rollback or forward-recovery procedure, and a record of the deployed version and approver.", ["Release record", "Health-check result", "Recovery procedure", "Rollback rehearsal"], "Review the latest release and the latest recovery rehearsal."),
    ],
    localDecisions: ["Approved hosting and CI/CD services", "Required provenance level", "Environment topology and release approval tiers"],
    assessment: { cadence: "For every release, with quarterly control sampling", assessor: "Platform operations with the application technical owner", conformanceRule: "Critical requirements must be Met for production. Other requirements require current evidence from the assessed release." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "i-6",
    scope: "Applications seeking production approval, changing operational ownership, or approaching retirement.",
    rationale: "A deployable application is not necessarily supportable. Named ownership, operating objectives, recovery procedures, and retirement planning prevent orphaned institutional services.",
    sourceIds: ["nist-800-53", "nist-800-53a", "nist-ssdf"],
    requirements: [
      req("I6-R1", "Production approval shall require a named business owner, technical owner, support contact, data owner/steward where applicable, and funded maintenance commitment.", ["Ownership record", "Support assignment", "Funding or capacity statement"], "Confirm each named individual accepts the role and escalation path.", true),
      req("I6-R2", "The handoff package shall include current architecture and data-flow diagrams, dependency inventory, deployment and recovery instructions, monitoring/alert ownership, access procedures, known risks, and vendor contacts.", ["Versioned runbook", "Architecture artifacts", "Dependency inventory"], "A person outside the build team shall execute a tabletop handoff using only the package.", true),
      req("I6-R3", "The owner shall define measurable service objectives, support hours, incident severity/escalation, recovery objectives, and maintenance windows appropriate to the service tier.", ["Service-level objectives", "Escalation matrix", "RPO/RTO record"], "Compare monitoring and on-call/support behavior with the declared objectives."),
      req("I6-R4", "Before go-live, the owner shall approve a decommission plan covering notification, export, retention, disposal, integration shutdown, access removal, and archival evidence.", ["Decommission plan", "Data lifecycle mapping", "Owner approval"], "Inspect completeness and rehearse decision ownership in a tabletop review."),
    ],
    localDecisions: ["Institutional service tiers and default objectives", "Minimum support commitment", "Required handoff approvers"],
    assessment: { cadence: "Before go-live, at ownership transfer, and annually", assessor: "Service owner with OIT operations, security, and the Data Steward", conformanceRule: "All requirements are production gates; Partially met requires a dated transition plan accepted by the operational owner." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "i-7",
    scope: "Source code and configuration maintained for University applications.",
    rationale: "Automated quality controls, maintainable structure, and visible debt reduce regression risk and make software supportable by people beyond its original authors.",
    sourceIds: ["nist-ssdf", "nist-800-53", "owasp-asvs"],
    requirements: [
      req("I7-R1", "Repositories shall enforce approved formatting, linting, type checking where supported, tests, dependency review, and secret scanning before merge.", ["Branch protection", "CI configuration", "Representative pull request"], "Inspect protected-branch rules and verify a failing check prevents merge."),
      req("I7-R2", "Changed behavior shall include automated tests at the lowest effective level; critical authorization, data-integrity, and recovery paths shall have integration tests.", ["Test suite", "Change-to-test trace", "Coverage of critical paths"], "Sample material changes and trace each to a meaningful behavioral test.", true),
      req("I7-R3", "Teams shall maintain a reviewed technical-debt register with impact, risk, owner, disposition, and target horizon; critical debt may not remain only in code comments.", ["Debt register", "Review record", "Linked remediation work"], "Sample debt items and compare declared risk and target dates with delivery planning."),
      req("I7-R4", "Shared or approved components shall be used where they satisfy the need; intentional duplication or custom framework use shall record the reason and maintenance owner.", ["Dependency/component inventory", "Deviation rationale"], "Review custom components and frameworks against the approved catalog."),
    ],
    localDecisions: ["Approved toolchain by language", "Critical-path test inventory", "Debt review frequency and escalation thresholds"],
    assessment: { cadence: "For every change, with quarterly repository review", assessor: "Technical owner with peer maintainers", conformanceRule: "The critical requirement must be Met; at least 90% of sampled changes must satisfy each remaining applicable requirement." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "i-8",
    scope: "Technology, architecture, security, data, and vendor decisions for University applications.",
    rationale: "Decision rights and a time-bounded exception path let teams move quickly on the paved road while making risk acceptance visible and accountable.",
    sourceIds: ["nist-csf", "nist-800-53", "ui-apm-30-11"],
    requirements: [
      req("I8-R1", "The standards owner shall publish a decision-rights matrix naming who proposes, reviews, approves, owns, and may accept risk for each decision class.", ["Decision-rights matrix", "Named role holders", "Publication date"], "Interview representative participants and trace recent decisions to the matrix.", true),
      req("I8-R2", "Material decisions and deviations shall record context, options, decision, rationale, approver, affected standards, and review trigger in a durable register.", ["Decision register", "Architecture/risk records"], "Sample recent material decisions and verify completeness and discoverability."),
      req("I8-R3", "Each exception shall be scoped, risk-assessed, approved by an authorized owner, paired with compensating controls, assigned an expiration date, and reviewed at least annually.", ["Exception register", "Risk approval", "Review history"], "Identify expired or ownerless exceptions and verify they cannot remain silently active.", true),
      req("I8-R4", "Each standard shall have an accountable owner, version, effective date, review date, change history, and stakeholder comment path.", ["Standards register", "Change history", "Review calendar"], "Inspect all published standards for complete governance metadata."),
    ],
    localDecisions: ["Decision classes and authorized approvers", "Materiality thresholds", "Appeal and escalation path"],
    assessment: { cadence: "Quarterly, and when decision authority changes", assessor: "CIO-designated governance owner with affected business and risk owners", conformanceRule: "All critical requirements must be Met; expired exceptions count as Not met until closed or renewed." },
    exceptionProcess: "Governance requirements may be changed only through the published standards-change process; an individual project exception may not waive accountable approval or expiration.",
  },
  {
    standardId: "i-9",
    scope: "Application, platform, API, dependency, schema, and infrastructure changes after initial production approval.",
    rationale: "Predictable upgrade and deprecation practices reduce emergency work, consumer breakage, unsupported software, and hidden operational risk.",
    sourceIds: ["nist-800-53", "nist-800-53a", "nist-ssdf"],
    requirements: [
      req("I9-R1", "Every production component shall have a named upgrade owner, supported-version policy, dependency inventory, and monitored end-of-support date.", ["Component inventory", "Owner", "Support lifecycle dashboard"], "Sample components and verify version, owner, and support date against authoritative vendor sources.", true),
      req("I9-R2", "Security updates shall follow risk-based remediation timeframes; an overdue critical or actively exploited issue shall block unrelated releases unless risk is explicitly accepted.", ["Vulnerability record", "Patch timeline", "Risk acceptance"], "Compare detection and remediation dates with the approved severity policy.", true),
      req("I9-R3", "Breaking API, schema, or user-workflow changes shall publish impact, migration instructions, owner, notice date, compatibility period, and removal date.", ["Change notice", "Migration guide", "Consumer inventory"], "Trace a breaking change to identified consumers, notification, compatibility testing, and removal approval."),
      req("I9-R4", "Material upgrades shall pass automated regression, security, migration, rollback/forward-recovery, and observability checks before production.", ["Upgrade test report", "Recovery result", "Release approval"], "Review the latest material upgrade and verify each required test produced current evidence."),
    ],
    localDecisions: ["Severity-based remediation timeframes", "Default compatibility/deprecation period", "Approved sources for lifecycle alerts"],
    assessment: { cadence: "Continuously for support status; per material change and quarterly review", assessor: "Technical owner with platform operations and security", conformanceRule: "Critical requirements must be Met. Overdue critical vulnerabilities or unsupported production components make the system Nonconforming." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "i-10",
    scope: "Production applications, APIs, scheduled jobs, integrations, and infrastructure supporting University services.",
    rationale: "Consistent telemetry and owned alerts turn failures into detectable, diagnosable, and actionable events while avoiding unnecessary collection of sensitive data.",
    sourceIds: ["opentelemetry", "nist-800-92", "nist-800-53", "ui-apm-30-11"],
    requirements: [
      req("I10-R1", "Production services shall emit structured logs, metrics, and traces using approved OpenTelemetry semantic conventions for service identity, requests, dependencies, and errors where applicable.", ["Telemetry schema", "Collector configuration", "Sample correlated event"], "Trace a representative request across service, dependency, log, metric, and error views."),
      req("I10-R2", "Telemetry shall exclude secrets and minimize personal or regulated data; access, retention, integrity, and disposal shall match the highest data classification represented.", ["Telemetry data inventory", "Redaction tests", "Access and retention configuration"], "Inject safe test markers and verify redaction, access control, retention, and disposal behavior.", true),
      req("I10-R3", "Each production service shall define service indicators and objectives for availability, latency, errors, and critical business transactions, with dashboards showing current performance and measurement gaps.", ["SLI/SLO definitions", "Dashboard", "Measurement coverage"], "Compare telemetry queries and dashboard calculations with the published objective definitions."),
      req("I10-R4", "Actionable alerts shall name an owner, severity, runbook, notification path, and response expectation; alert tests and post-incident findings shall be recorded.", ["Alert catalog", "Runbooks", "Alert test or incident record"], "Sample critical alerts and verify delivery, ownership, diagnostic context, and runbook action."),
    ],
    localDecisions: ["Institutional telemetry platform and retention tiers", "Default service indicators/objectives", "Alert severity and response expectations"],
    assessment: { cadence: "Continuously, with quarterly control and alert review", assessor: "Service owner with operations and information security", conformanceRule: "The telemetry-data protection requirement is critical. All other requirements must be Met for tier-one services and at least 90% Met for other production services." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "ii-1",
    scope: "Public-facing and internal University web applications, mobile interfaces, and reusable interface assets.",
    rationale: "A governed visual language makes University services recognizable, coherent, accessible, and less expensive to build and maintain.",
    sourceIds: ["ui-brand", "uswds", "ui-accessibility"],
    requirements: [
      req("II1-R1", "Interfaces representing the University shall use approved University identity assets, colors, typography, logo clear space, and voice without altering protected marks.", ["Design review", "Token or theme configuration", "Approved identity assets"], "Compare representative screens and assets with current University brand guidance.", true),
      req("II1-R2", "The institutional application design system shall publish versioned design tokens for color, typography, spacing, elevation, borders, breakpoints, focus, and motion with accessible usage guidance.", ["Token package", "Documentation", "Release history"], "Inspect the distributed tokens and compare documented values with rendered reference components."),
      req("II1-R3", "Applications shall consume shared tokens and components through an approved, versioned dependency or documented synchronization process rather than copying styles without provenance.", ["Dependency inventory", "Build configuration", "Update record"], "Trace representative visual styles and components to their governed source."),
      req("II1-R4", "Themes, including any dark theme, shall preserve semantic meaning and meet the same accessibility and component-state requirements as the default theme.", ["Theme specification", "Contrast results", "Component state review"], "Test representative components and content across every supported theme and forced-colors mode."),
    ],
    localDecisions: ["Authoritative application design-system owner", "Approved component framework and distribution model", "Whether dark mode is supported or intentionally excluded"],
    assessment: { cadence: "At design review, before launch, and after design-system major versions", assessor: "University Communications and Marketing with the UX and accessibility owners", conformanceRule: "Brand and accessibility-critical findings must be Met before public release; other findings require a dated remediation plan." },
    exceptionProcess: UX_EXCEPTION,
  },
  {
    standardId: "ii-2",
    scope: "Interactive components and patterns used in University web and mobile applications.",
    rationale: "Predictable interaction, accessible behavior, and reuse reduce user learning effort and eliminate repeated implementation defects.",
    sourceIds: ["uswds", "wai-apg", "wcag-21"],
    requirements: [
      req("II2-R1", "Teams shall use approved shared components for common controls and patterns; custom components require a documented unmet need, owner, accessibility review, tests, and contribution decision.", ["Component inventory", "Deviation record", "Component tests"], "Inventory rendered component types and trace each custom interactive component to approval evidence."),
      req("II2-R2", "Every interactive element shall expose the correct accessible name, role, value/state, keyboard operation, focus order, visible focus, and disabled/read-only behavior.", ["Automated accessibility results", "Keyboard test", "Screen-reader test"], "Test every unique interactive pattern with keyboard and at least one supported screen reader.", true),
      req("II2-R3", "Forms shall use persistent labels, programmatic instructions, appropriate input purpose, inline validation, an error summary for failed submission, and preserved user-entered values.", ["Form-pattern review", "Validation tests", "Assistive-technology test"], "Complete representative valid and invalid paths using keyboard and screen reader.", true),
      req("II2-R4", "Destructive, irreversible, legal, or financial actions shall require clear consequence language and confirmation, reversal, or review before final commitment.", ["Critical-action inventory", "Interaction design", "User test"], "Exercise each critical action and verify prevention and recovery behavior."),
    ],
    localDecisions: ["Approved component inventory", "Supported browser and assistive-technology matrix", "Criteria for contributing custom components upstream"],
    assessment: { cadence: "Per component release and before application launch", assessor: "Design-system owner with accessibility reviewer and product team", conformanceRule: "All critical requirements must be Met for every unique pattern; sampling is permitted only for repeated instances of the same implementation." },
    exceptionProcess: UX_EXCEPTION,
  },
  {
    standardId: "ii-3",
    scope: "University-provided or contractually delivered web content and mobile applications, subject to the applicability and exceptions of ADA Title II and University policy.",
    rationale: "Accessible digital services provide equal participation and reduce barriers for people with visual, auditory, physical, speech, cognitive, and neurological disabilities.",
    sourceIds: ["ada-title-ii-web", "ui-accessibility", "wcag-21", "wcag-em"],
    requirements: [
      req("II3-R1", "Covered web content and mobile applications shall conform to WCAG 2.1 Level A and Level AA, including complete-process and accessibility-supported-use requirements.", ["WCAG-EM conformance report", "Issue register", "Accessibility statement"], "Evaluate a representative sample and every critical process using WCAG-EM; every applicable A and AA success criterion must pass.", true),
      req("II3-R2", "Automated accessibility checks shall run in CI and production monitoring where feasible, but automated results shall not substitute for keyboard, zoom/reflow, contrast, screen-reader, and cognitive/usability review.", ["CI accessibility results", "Manual test record", "Production scan"], "Verify both automated and manual evidence cover every unique template and interaction pattern."),
      req("II3-R3", "Accessibility defects shall be triaged by user impact; blockers in a critical process shall prevent release or trigger an immediately available equivalent path and executive risk decision.", ["Defect severity policy", "Release record", "Equivalent-path evidence"], "Sample critical defects and trace detection, decision, communication, remediation, and retest.", true),
      req("II3-R4", "Each service shall publish an accessible feedback channel, name the responsible owner, acknowledge reports, and track remediation through verification.", ["Accessibility statement", "Feedback workflow", "Remediation record"], "Submit a test report and verify receipt, ownership, escalation, and closure evidence."),
    ],
    localDecisions: ["Accessibility defect severity and remediation targets", "Supported assistive-technology test matrix", "Central accessibility review and reporting owner"],
    assessment: { cadence: "During design and development, before launch, after material change, and at least annually", assessor: "Qualified accessibility evaluator with the product owner; people with disabilities included in usability validation where practical", conformanceRule: "WCAG conformance is not an averaged score: all applicable Level A and AA success criteria must pass. Maturity is reported separately." },
    exceptionProcess: "Use only the exceptions and defenses permitted by applicable law and University policy. Any determination of undue burden, fundamental alteration, conforming alternate version, or equivalent facilitation requires documented legal and executive review; a project team may not self-approve it.",
  },
  {
    standardId: "ii-4",
    scope: "Task-oriented University digital services used by students, employees, faculty, partners, or the public.",
    rationale: "Workflow standards should reduce task failure and burden for real users, not optimize arbitrary click counts. Evidence from representative users is the basis for acceptability.",
    sourceIds: ["uswds-principles", "digital-playbook", "wcag-21"],
    requirements: [
      req("II4-R1", "Before solution approval, the team shall identify primary user groups, critical tasks, context of use, barriers, current baseline, and the user outcome the service must improve.", ["Research brief", "Task inventory", "Baseline evidence"], "Review research coverage and confirm requirements trace to observed user needs rather than stakeholder assumption.", true),
      req("II4-R2", "Each critical task shall have a measurable success definition covering completion, errors, time or effort where meaningful, abandonment, accessibility, and user confidence.", ["Task success measures", "Analytics plan", "Test protocol"], "Inspect every critical task for an observable outcome and a defensible target or baseline-improvement commitment."),
      req("II4-R3", "Navigation, action placement, terminology, and interaction behavior shall remain consistent across modules unless user evidence supports a documented exception.", ["Pattern inventory", "Content/design review", "Exception rationale"], "Compare repeated tasks and labels across modules and review any divergence with representative users."),
      req("II4-R4", "Critical workflows shall work at supported mobile and desktop sizes, 200% zoom, and 320 CSS-pixel reflow without loss of content, context, or functionality.", ["Responsive test matrix", "Reflow evidence", "Device/browser results"], "Complete every critical workflow at the required viewport and zoom conditions.", true),
    ],
    localDecisions: ["Critical-task designation method", "Acceptable baseline improvement or success targets by service", "Supported device and browser matrix"],
    assessment: { cadence: "Before build commitment, during prototype testing, before launch, and after material workflow change", assessor: "Product owner and UX researcher with representative users", conformanceRule: "All critical requirements must be Met. Outcome targets are assessed task-by-task; a strong average cannot offset a failed critical task." },
    exceptionProcess: UX_EXCEPTION,
  },
  {
    standardId: "ii-5",
    scope: "User-facing web applications and the APIs required to complete their critical workflows.",
    rationale: "Real-world loading speed, interaction responsiveness, visual stability, and network resilience directly affect whether people can complete University tasks.",
    sourceIds: ["core-web-vitals", "wcag-21", "uswds"],
    requirements: [
      req("II5-R1", "At least 75% of production visits, measured separately for mobile and desktop over a rolling 28-day window, shall achieve LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1.", ["Real-user monitoring dashboard", "28-day percentile report", "Page/template coverage"], "Verify p75 field data for all three metrics by device class and identify unmeasured critical pages."),
      req("II5-R2", "Critical user transactions shall have documented end-to-end latency and availability objectives, with API budgets allocated to dependent services and measured in production.", ["Transaction SLOs", "Dependency budgets", "Production traces"], "Compare representative production traces and SLO calculations with the documented budget."),
      req("II5-R3", "Critical workflows shall remain understandable and recoverable on a representative constrained network, including meaningful loading, timeout, retry, and reconnection behavior.", ["Network-condition test", "Loading/error states", "Recovery test"], "Complete critical workflows under the approved constrained-network profile and interrupted requests."),
      req("II5-R4", "Large result sets shall use bounded queries and an appropriate pagination, incremental loading, or virtualization pattern without removing keyboard or assistive-technology access.", ["Query limits", "Performance trace", "Accessibility test"], "Test the documented maximum supported data volume for performance and full interaction access."),
    ],
    localDecisions: ["Critical transaction SLOs and service tiers", "Representative constrained-network profile", "Data-volume thresholds and performance budgets"],
    assessment: { cadence: "Continuously in production, with release and monthly trend review", assessor: "Product and technical owners with UX and operations", conformanceRule: "Core Web Vitals are reported individually; all three must meet the target. A composite score may not hide a failed metric or unmeasured critical flow." },
    exceptionProcess: UX_EXCEPTION,
  },
  {
    standardId: "ii-6",
    scope: "User-visible validation, errors, warnings, status changes, progress, success, and service interruptions.",
    rationale: "Clear, timely, accessible feedback helps people recover without blame, protects entered work, and keeps diagnostic detail out of unsafe user-facing messages.",
    sourceIds: ["wcag-21", "uswds", "rfc-9457"],
    requirements: [
      req("II6-R1", "User-facing errors shall state what happened in plain language, identify the affected item, explain how to recover, preserve valid work, and provide a support/reference identifier when escalation may be needed.", ["Error-message inventory", "Content review", "Recovery tests"], "Trigger representative errors and assess clarity, actionability, preservation, and escalation information with users."),
      req("II6-R2", "Validation shall occur at a helpful time, associate each message programmatically with its field, and provide an accessible summary after an unsuccessful submission.", ["Validation pattern", "Accessibility test", "Invalid-submission test"], "Submit representative invalid inputs using keyboard and screen reader; verify focus and announced context.", true),
      req("II6-R3", "Loading, success, warning, and failure states shall be programmatically announced without stealing focus; long operations shall show meaningful progress or status and support safe retry or cancellation where feasible.", ["Status-state inventory", "Live-region test", "Interruption/retry test"], "Exercise asynchronous operations with assistive technology and interrupted connectivity."),
      req("II6-R4", "User messages shall not expose stack traces, internal identifiers without explanation, secrets, or unnecessary personal data; diagnostic detail shall go to protected logs correlated by a safe reference identifier.", ["Error samples", "Logging correlation", "Redaction tests"], "Trigger server and integration failures and compare the user response with protected diagnostic logs.", true),
    ],
    localDecisions: ["Approved notification pattern by persistence and severity", "Reference/support routing format", "Maximum silent wait before progress is required"],
    assessment: { cadence: "Per workflow release and during usability/accessibility testing", assessor: "Content designer and UX/accessibility reviewer with the technical owner", conformanceRule: "Critical requirements must pass every tested error path. Other requirements require at least 90% of sampled states Met with no repeated systemic defect." },
    exceptionProcess: UX_EXCEPTION,
  },
  {
    standardId: "ii-7",
    scope: "Labels, instructions, navigation, help, errors, notifications, and documentation within University digital services.",
    rationale: "People complete tasks more reliably when content uses their language, leads with the needed information, and remains consistent across systems.",
    sourceIds: ["plain-language", "ui-brand", "uswds-principles"],
    requirements: [
      req("II7-R1", "Content shall identify its primary audience and purpose, lead with the needed information, use active voice and familiar words, and explain unavoidable institutional or technical terms at first use.", ["Content brief", "Editorial review", "Terminology decisions"], "Review representative task content against the audience, purpose, organization, sentence, and vocabulary criteria."),
      req("II7-R2", "Buttons and links shall describe the action or destination; field labels shall name the requested information; headings shall describe the following content and form a meaningful hierarchy.", ["Interface copy inventory", "Heading/link audit", "Usability test"], "Review all unique action labels and a representative content sample out of visual context."),
      req("II7-R3", "A governed glossary shall define cross-system institutional terms, preferred labels, prohibited ambiguity, owner, and change process; products shall reuse those terms consistently.", ["Glossary", "Content-lint or review results", "Change history"], "Compare repeated domain concepts across services and record unexplained variation."),
      req("II7-R4", "Help shall be available at the point of need without hiding information necessary to complete the task; critical instructions shall not depend only on tooltips, placeholders, icons, or hover.", ["Help-content inventory", "Keyboard/touch test", "User test"], "Complete critical tasks without hover and verify essential guidance remains visible and accessible."),
    ],
    localDecisions: ["Institutional product voice and reading-level guidance", "Glossary governance owner", "Content review triggers and approvers"],
    assessment: { cadence: "During design, before release, and when policy or terminology changes", assessor: "Content owner with representative users and the product owner", conformanceRule: "Each critical workflow must meet every requirement. Broader content inventories may use a statistically defensible sample with remediation for systemic findings." },
    exceptionProcess: UX_EXCEPTION,
  },
  {
    standardId: "ii-8",
    scope: "New services, material workflow changes, and existing services with significant user-impact or adoption concerns.",
    rationale: "Testing with representative users turns assumptions into evidence and catches workflow, accessibility, terminology, and trust failures before they become institutional burden.",
    sourceIds: ["uswds-principles", "digital-playbook", "wcag-em"],
    requirements: [
      req("II8-R1", "Every material release shall test its critical tasks with representative participants, including people likely to face the greatest barriers; recruitment and exclusions shall be documented.", ["Research plan", "Participant characteristics", "Consent/privacy record"], "Review participant coverage against the service's identified user groups and barriers.", true),
      req("II8-R2", "The test plan shall define tasks, success measures, stopping rules, accessibility accommodations, observation method, and decision thresholds before sessions begin.", ["Approved test plan", "Task scripts", "Success thresholds"], "Compare the final report with the predeclared plan and explain deviations."),
      req("II8-R3", "Critical task findings shall be prioritized by user impact, assigned to an owner, resolved or explicitly accepted before launch, and retested when the design changes materially.", ["Findings register", "Disposition approvals", "Retest evidence"], "Trace every critical/high-impact finding from observation to verified disposition.", true),
      req("II8-R4", "After launch, the owner shall maintain a feedback channel and review task analytics, support themes, accessibility reports, and qualitative feedback on a declared cadence.", ["Feedback channels", "Review record", "Improvement decisions"], "Inspect the latest review and trace at least one decision to post-launch evidence."),
    ],
    localDecisions: ["Minimum participant strategy by service risk", "Material-release definition", "Critical task success thresholds and launch authority"],
    assessment: { cadence: "Before material release, soon after launch, and at least annually for critical services", assessor: "Qualified UX researcher with the product owner and accessibility support", conformanceRule: "Critical research and finding-disposition requirements must be Met. Participant count alone never establishes acceptable UX; evidence quality and task coverage are assessed." },
    exceptionProcess: UX_EXCEPTION,
  },
  {
    standardId: "ii-9",
    scope: "Analytics, session measurement, product telemetry, surveys, experiments, and feedback data describing people or their use of University services.",
    rationale: "Measurement should answer declared service questions while minimizing surveillance, privacy risk, sensitive inference, and retention of data without continuing value.",
    sourceIds: ["nist-privacy", "ui-apm-30-11", "uswds-principles"],
    requirements: [
      req("II9-R1", "Each tracked event or attribute shall have a documented decision purpose, owner, data classification, lawful/policy basis, retention period, access group, and prohibited uses.", ["Measurement plan", "Event dictionary", "Data classification"], "Sample collected events and compare every field with the approved plan and actual decision use.", true),
      req("II9-R2", "Analytics shall collect the minimum data needed, avoid sensitive content and raw identifiers where aggregation or pseudonymous identifiers suffice, and prohibit credential, free-text, or regulated-data capture by default.", ["Collection configuration", "Payload inspection", "Redaction/block list"], "Inspect production payloads from representative workflows and test prohibited-field blocking.", true),
      req("II9-R3", "Users shall receive clear notice and controls where required; analytics shall respect applicable consent, opt-out, access, and deletion obligations across first- and third-party tools.", ["Privacy notice", "Consent/control behavior", "Vendor configuration"], "Exercise each applicable privacy control and verify downstream propagation."),
      req("II9-R4", "Access and retention shall be enforced technically, reviewed periodically, and include verified deletion from exports and downstream destinations when the approved period ends.", ["Access review", "Retention configuration", "Deletion evidence", "Destination inventory"], "Trace a test record or cohort through retention and deletion across all destinations."),
    ],
    localDecisions: ["Approved analytics tools and hosting", "Event-level retention tiers", "Privacy review and consent triggers"],
    assessment: { cadence: "Before collection begins, after schema/tool changes, and at least annually", assessor: "Product owner with Data Steward, privacy/legal, and information security review", conformanceRule: "All requirements are critical for datasets containing Moderate/High-risk data. Unregistered collection is automatically Not met." },
    exceptionProcess: SECURITY_EXCEPTION,
  },
  {
    standardId: "ii-10",
    scope: "Ownership, publication, change, enforcement, and exceptions for University UX standards and the institutional design system.",
    rationale: "UX standards remain credible only when ownership, decision rights, review, evidence, and exceptions are visible and consistently applied.",
    sourceIds: ["nist-csf", "uswds", "ui-brand", "ui-accessibility"],
    requirements: [
      req("II10-R1", "The University shall name accountable owners for brand, design system, content, accessibility, user research, and product analytics standards, plus a single escalation path for conflicts.", ["Published ownership matrix", "Named role holders", "Escalation path"], "Confirm role holders accept responsibility and recent questions reached the appropriate owner.", true),
      req("II10-R2", "UX standards and shared components shall publish version, effective date, change history, evidence/rationale, migration guidance, deprecation window, and next review date.", ["Published standard/component metadata", "Release notes", "Review calendar"], "Inspect every active standard and current major component version for complete metadata."),
      req("II10-R3", "Proposed changes shall collect evidence and affected-stakeholder input, document the decision and dissent, and receive approval from the authorized owner before becoming binding.", ["Change proposal", "Research or issue evidence", "Approval record"], "Trace a sample of adopted and rejected changes through the published process."),
      req("II10-R4", "UX exceptions shall identify affected users, duration, owner, rationale, risk, accessible/equivalent path where required, compensating measures, approval, and expiration; expired exceptions shall not remain active.", ["Exception register", "Approvals", "Expiration review"], "Review all open exceptions for completeness, user impact, and timely closure.", true),
    ],
    localDecisions: ["Named UX governance roles and conflict authority", "Standards-review and component-support cadence", "Required stakeholder groups for material changes"],
    assessment: { cadence: "Quarterly and before each material standards release", assessor: "CIO- and UCM-designated UX governance owners with accessibility and product representation", conformanceRule: "Critical requirements must be Met. Expired, ownerless, or unpublished exceptions are Not met and may not be treated as precedent." },
    exceptionProcess: "Governance requirements may be revised through the standards-change process; individual projects may not waive accessibility law, accountable ownership, or exception expiration.",
  },
] as const;

export const standardsSourceById = new Map(
  STANDARDS_SOURCES.map((source) => [source.id, source]),
);

export const standardDraftById = new Map(
  STANDARD_DRAFTS.map((draft) => [draft.standardId, draft]),
);

export function draftSummary(drafts: readonly StandardDraft[] = STANDARD_DRAFTS) {
  return {
    drafts: drafts.length,
    requirements: drafts.reduce(
      (total, draft) => total + draft.requirements.length,
      0,
    ),
    criticalRequirements: drafts.reduce(
      (total, draft) =>
        total + draft.requirements.filter((requirement) => requirement.critical).length,
      0,
    ),
    sources: new Set(drafts.flatMap((draft) => draft.sourceIds)).size,
  };
}

export function validateStandardsDrafts(
  standardIds: readonly string[],
  drafts: readonly StandardDraft[] = STANDARD_DRAFTS,
  sources: readonly StandardsSource[] = STANDARDS_SOURCES,
): string[] {
  const errors: string[] = [];
  const expected = new Set(standardIds);
  const draftIds = new Set<string>();
  const sourceIds = new Set(sources.map((source) => source.id));
  const requirementIds = new Set<string>();

  for (const draft of drafts) {
    if (draftIds.has(draft.standardId)) {
      errors.push(`Duplicate draft for ${draft.standardId}`);
    }
    draftIds.add(draft.standardId);
    if (!expected.has(draft.standardId)) {
      errors.push(`Draft ${draft.standardId} has no standards-ledger entry`);
    }
    if (draft.requirements.length === 0) {
      errors.push(`Draft ${draft.standardId} has no requirements`);
    }
    if (draft.sourceIds.length === 0) {
      errors.push(`Draft ${draft.standardId} has no sources`);
    }
    for (const sourceId of draft.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`Draft ${draft.standardId} references unknown source ${sourceId}`);
      }
    }
    for (const requirement of draft.requirements) {
      if (requirementIds.has(requirement.id)) {
        errors.push(`Duplicate requirement id ${requirement.id}`);
      }
      requirementIds.add(requirement.id);
      if (requirement.evidence.length === 0) {
        errors.push(`Requirement ${requirement.id} has no evidence`);
      }
    }
  }

  for (const standardId of expected) {
    if (!draftIds.has(standardId)) {
      errors.push(`Standards-ledger entry ${standardId} has no draft`);
    }
  }

  return errors;
}
