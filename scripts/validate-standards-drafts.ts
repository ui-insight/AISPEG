import { standardsWatch } from "../lib/standards-watch";
import { existsSync } from "node:fs";
import {
  STANDARD_DRAFTS,
  STANDARDS_SOURCES,
  draftSummary,
  validateStandardsDrafts,
} from "../lib/standards-drafts";
import {
  FOUNDATION_TEMPLATE_LINKS,
  foundationSummary,
  validateStandardsFoundation,
} from "../lib/standards-foundation";

const errors = validateStandardsDrafts(
  standardsWatch.map((standard) => standard.id),
);
errors.push(
  ...validateStandardsFoundation(
    new Set(STANDARDS_SOURCES.map((source) => source.id)),
  ),
);

for (const source of STANDARDS_SOURCES) {
  if (!source.href.startsWith("https://")) {
    errors.push(`Source ${source.id} does not use HTTPS`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(source.checkedOn)) {
    errors.push(`Source ${source.id} has an invalid checkedOn date`);
  }
}

for (const draft of STANDARD_DRAFTS) {
  if (draft.localDecisions.length === 0) {
    errors.push(`Draft ${draft.standardId} has no local decisions`);
  }
  if (!draft.assessment.conformanceRule) {
    errors.push(`Draft ${draft.standardId} has no conformance rule`);
  }
  for (const requirement of draft.requirements) {
    if (!requirement.id.startsWith(draft.standardId.toUpperCase().replace("-", ""))) {
      errors.push(
        `Requirement ${requirement.id} does not match draft ${draft.standardId}`,
      );
    }
    if (!requirement.statement.includes(" shall ")) {
      errors.push(`Requirement ${requirement.id} is not a shall statement`);
    }
  }
}

for (const template of FOUNDATION_TEMPLATE_LINKS) {
  if (!existsSync(template.file)) {
    errors.push(`Foundation template is missing: ${template.file}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const summary = draftSummary();
const foundation = foundationSummary();
console.log(
  `Validated ${summary.drafts} drafts, ${summary.requirements} requirements (${summary.criticalRequirements} critical), ${summary.sources} draft sources, ${foundation.definitions} definitions, ${foundation.evidenceArtifacts} evidence artifacts, and ${foundation.templates} templates.`,
);
