/**
 * Compares the vendored data-governance submodule pointer against upstream
 * `main` and emits a markdown advisory when the pinned commit is more than
 * STALE_AFTER_DAYS old.
 *
 * Inputs (env):
 *   PINNED_SHA                 SHA the submodule is pinned to in this PR (required)
 *   PINNED_COMMIT_DATE_ISO     ISO-8601 commit date of PINNED_SHA          (required)
 *   UPSTREAM_HEAD_SHA          current upstream main HEAD SHA              (optional, for context)
 *   STALE_AFTER_DAYS           threshold in days, default 14
 *   OUTPUT_PATH                file to write markdown to (default: stdout)
 *
 * Exits 0 in all cases — this is advisory only. Writes one of two outputs:
 *   - "stale" advisory markdown when threshold exceeded
 *   - empty file (and message on stderr) when fresh, so the workflow can
 *     decide whether to post or to skip / delete the comment.
 */
import { writeFileSync } from "node:fs";

const MARKER = "<!-- governance-bot:freshness -->";

const PINNED_SHA = process.env.PINNED_SHA || "";
const PINNED_COMMIT_DATE_ISO = process.env.PINNED_COMMIT_DATE_ISO || "";
const UPSTREAM_HEAD_SHA = process.env.UPSTREAM_HEAD_SHA || "";
const STALE_AFTER_DAYS = parseInt(process.env.STALE_AFTER_DAYS || "14", 10);
const OUTPUT_PATH = process.env.OUTPUT_PATH || "";

if (!PINNED_SHA || !PINNED_COMMIT_DATE_ISO) {
  console.error(
    "PINNED_SHA and PINNED_COMMIT_DATE_ISO are required. Refusing to run.",
  );
  process.exit(2);
}

const pinnedDate = new Date(PINNED_COMMIT_DATE_ISO);
if (Number.isNaN(pinnedDate.getTime())) {
  console.error(`Invalid PINNED_COMMIT_DATE_ISO: ${PINNED_COMMIT_DATE_ISO}`);
  process.exit(2);
}

const now = new Date();
const ageMs = now.getTime() - pinnedDate.getTime();
const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

function emit(content: string) {
  if (OUTPUT_PATH) {
    writeFileSync(OUTPUT_PATH, content);
  } else {
    process.stdout.write(content);
  }
}

const shortPinned = PINNED_SHA.slice(0, 7);
const shortHead = UPSTREAM_HEAD_SHA ? UPSTREAM_HEAD_SHA.slice(0, 7) : "";
const isPointingAtHead =
  UPSTREAM_HEAD_SHA && PINNED_SHA === UPSTREAM_HEAD_SHA;

if (ageDays <= STALE_AFTER_DAYS) {
  console.error(
    `Submodule pointer is fresh: pinned ${shortPinned} (${ageDays} day(s) old, threshold ${STALE_AFTER_DAYS}).`,
  );
  // Empty body signals "no advisory needed" to the workflow.
  emit("");
  process.exit(0);
}

const lines: string[] = [];
lines.push(MARKER);
lines.push("## Vendored data-governance submodule is behind upstream");
lines.push("");
lines.push(
  `The vendored submodule pointer at \`vendor/data-governance\` is pinned to \`${shortPinned}\`, ` +
    `which was committed **${ageDays} day(s) ago** ` +
    `(threshold: ${STALE_AFTER_DAYS} days).`,
);
lines.push("");
if (UPSTREAM_HEAD_SHA && !isPointingAtHead) {
  lines.push(
    `Upstream \`main\` is currently at \`${shortHead}\`. To refresh:`,
  );
  lines.push("");
  lines.push("```bash");
  lines.push("git submodule update --remote vendor/data-governance");
  lines.push('git add vendor/data-governance && git commit -m "Bump data-governance"');
  lines.push("```");
  lines.push("");
  lines.push(
    "Then re-run `npm run build:governance` to regenerate `lib/governance/{catalog,vocabularies}.ts`.",
  );
} else if (isPointingAtHead) {
  lines.push(
    "The submodule is pinned at upstream `main` HEAD, but that HEAD itself is older than the threshold. " +
      "No action needed in this repo — upstream simply hasn't moved.",
  );
}
lines.push("");
lines.push(
  "_This is an advisory comment from `governance-pr-summary.yml`. It does not block the build. " +
    `Threshold is configurable via the \`STALE_AFTER_DAYS\` workflow env var (currently ${STALE_AFTER_DAYS}). ` +
    "This comment is updated in place across pushes._",
);

emit(lines.join("\n"));
console.error(
  `Submodule pointer is STALE: pinned ${shortPinned} (${ageDays} day(s) old, threshold ${STALE_AFTER_DAYS}).`,
);
process.exit(0);
