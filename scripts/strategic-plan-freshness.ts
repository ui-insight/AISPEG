/**
 * Compares the vendored strategic-plan submodule pointer against upstream
 * `main` and emits a markdown advisory when the pinned commit is more than
 * STALE_AFTER_DAYS old.
 *
 * Mirrors scripts/governance-freshness.ts — kept as a sibling rather than
 * generalizing to a shared utility because the marker, header, and remediation
 * commands diverge per submodule and inlining keeps each PR comment readable.
 *
 * Inputs (env):
 *   PINNED_SHA                 SHA the submodule is pinned to in this PR (required)
 *   PINNED_COMMIT_DATE_ISO     ISO-8601 commit date of PINNED_SHA          (required)
 *   UPSTREAM_HEAD_SHA          current upstream main HEAD SHA              (optional, for context)
 *   STALE_AFTER_DAYS           threshold in days, default 14
 *   OUTPUT_PATH                file to write markdown to (default: stdout)
 *
 * Exits 0 in all cases — advisory only.
 */
import { writeFileSync } from "node:fs";

const MARKER = "<!-- strategic-plan-bot:freshness -->";

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
  emit("");
  process.exit(0);
}

const lines: string[] = [];
lines.push(MARKER);
lines.push("## Vendored strategic-plan submodule is behind upstream");
lines.push("");
lines.push(
  `The vendored submodule pointer at \`vendor/strategic-plan\` is pinned to \`${shortPinned}\`, ` +
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
  lines.push("git submodule update --remote vendor/strategic-plan");
  lines.push('git add vendor/strategic-plan && git commit -m "Bump strategic-plan"');
  lines.push("```");
  lines.push("");
  lines.push(
    "Then re-run `npm run build:strategic-plan` to regenerate `lib/strategic-plan/catalog.ts`.",
  );
} else if (isPointingAtHead) {
  lines.push(
    "The submodule is pinned at upstream `main` HEAD, but that HEAD itself is older than the threshold. " +
      "No action needed in this repo — upstream simply hasn't moved.",
  );
}
lines.push("");
lines.push(
  "_This is an advisory comment from `strategic-plan-pr-summary.yml`. It does not block the build. " +
    `Threshold is configurable via the \`STALE_AFTER_DAYS\` workflow env var (currently ${STALE_AFTER_DAYS}). ` +
    "This comment is updated in place across pushes._",
);

emit(lines.join("\n"));
console.error(
  `Submodule pointer is STALE: pinned ${shortPinned} (${ageDays} day(s) old, threshold ${STALE_AFTER_DAYS}).`,
);
process.exit(0);
