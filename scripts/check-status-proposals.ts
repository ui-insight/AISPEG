// scripts/check-status-proposals.ts
//
// Gate for a status review child. Confirms every `act` exception has a
// proposal, that proposals cover only flagged projects, that they cite only IDs
// the collector issued, and that confidence is honest: `high` needs a ClickUp
// citation (a person's statement), since repo and URL evidence show activity,
// not use. `info` exceptions may have a proposal but need not.
//
//   npm run status:check -- --out <dir> <proposals.json> [...]

import { readFileSync } from "node:fs";
import { join } from "node:path";

interface Proposal {
  slug?: string;
  summary?: string;
  owner?: string | null;
  ownerQuestion?: string | null;
  confidence?: string;
  evidence?: string[];
}

function main(): void {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--out");
  const out = outIndex >= 0 ? args[outIndex + 1] : undefined;
  const files = args.filter((_, i) => i !== outIndex && i !== outIndex + 1);
  if (!out || !files.length) {
    throw new Error("Usage: npm run status:check -- --out <dir> <proposals.json> [...]");
  }

  const ids = JSON.parse(readFileSync(join(out, "evidence-ids.json"), "utf8")) as Record<string, string[]>;
  const exceptions = JSON.parse(readFileSync(join(out, "exceptions.json"), "utf8")) as {
    slug: string;
    severity: string;
  }[];
  const flagged = new Set(exceptions.map((e) => e.slug));
  const required = new Set(exceptions.filter((e) => e.severity === "act").map((e) => e.slug));
  const proposals = files.flatMap((f) => JSON.parse(readFileSync(f, "utf8")) as Proposal[]);

  const problems: string[] = [];
  const seen = new Set<string>();
  for (const p of proposals) {
    const slug = p.slug ?? "(missing slug)";
    if (!p.slug || !flagged.has(p.slug)) problems.push(`${slug}: not an exception project`);
    if (seen.has(slug)) problems.push(`${slug}: duplicate proposal`);
    seen.add(slug);
    if (!p.summary) problems.push(`${slug}: missing summary`);
    if (!["high", "medium", "low"].includes(p.confidence ?? "")) problems.push(`${slug}: invalid confidence`);
    const cited = p.evidence ?? [];
    if (!cited.length) problems.push(`${slug}: no evidence cited`);
    for (const id of cited) {
      if (!ids[slug]?.includes(id)) problems.push(`${slug}: unknown evidence ID ${id}`);
    }
    if (p.confidence === "high" && !cited.some((id) => /\/C\d+$/.test(id))) {
      problems.push(`${slug}: high confidence needs a ClickUp citation`);
    }
  }
  for (const slug of required) {
    if (!seen.has(slug)) problems.push(`${slug}: act exception has no proposal`);
  }

  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`Proposals PASSED: ${proposals.length} proposals; ${required.size} act projects covered.`);
}

main();
