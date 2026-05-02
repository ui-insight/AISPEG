// Stub base vocabularies for testing governance-pr-summary.ts
import type { VocabularyGroup } from "../../lib/governance/types";

export const vocabularyGroups: VocabularyGroup[] = [
  {
    domain: "audit",
    application: "Audit Dashboard",
    group: "RemovedGroup",
    description: "This group is removed in head",
    values: [{ code: "OBSOLETE", label: "Obsolete" }],
  },
  {
    domain: "audit",
    application: "Audit Dashboard",
    group: "ReportType",
    description: "Classification of audit report documents",
    values: [
      { code: "FULL_REPORT", label: "Full Report" },
      { code: "OLD_LETTER", label: "Old Letter" },
    ],
  },
];
