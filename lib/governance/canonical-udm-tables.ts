// Hand-curated set of canonical UDM table names, used to tag tables in each
// project catalog as "canonical-udm" vs "project-extension". Names are
// compared case-insensitively after normalizing PascalCase_With_Underscores
// and snake_case to a common lowercase form.
//
// Source: the research-administration domain narrative in
// vendor/data-governance/docs/standard/ + cross-checked against
// OpenERA's catalog (the canonical UDM implementor for research admin).
//
// Why a hand-curated list and not a field on the catalog: as of this slice
// the data-governance catalog JSONs do not carry canonical/extension
// classification. A follow-up issue against ui-insight/data-governance
// proposes adding it upstream; this module is the v1 stopgap.

const CANONICAL_NAMES: readonly string[] = [
  "AllowedValues",
  "Organization",
  "Personnel",
  "ContactDetails",
  "Project",
  "Proposal",
  "ProposalBudget",
  "BudgetCategory",
  "IndirectRate",
  "ProjectRole",
  "RFA",
  "RFARequirement",
  "ComplianceRequirement",
  "ConflictOfInterest",
  "Document",
  "DocumentReviewFinding",
  "PersonnelReviewFinding",
  "PersonnelComplianceRecord",
  "SponsorCompliancePolicy",
  "SponsorEligibilityRule",
  "Award",
  "Subaward",
  "Account",
];

function normalize(name: string): string {
  return name.replace(/_/g, "").toLowerCase();
}

const CANONICAL_SET = new Set(CANONICAL_NAMES.map(normalize));

export function isCanonicalUdmTable(tableName: string): boolean {
  return CANONICAL_SET.has(normalize(tableName));
}
