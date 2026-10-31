// scripts/verify-agent-config.ts
//
// Keeps the multi-harness agent setup honest (docs/agent-orchestration.md).
// Each check protects a failure that is silent at runtime:
//
// - AGENTS.md over Codex's 32 KiB project_doc_max_bytes is dropped from a
//   Codex agent's context, so a rule-bearing file can vanish without error.
// - CLAUDE.md drifting away from its import forks the rules per harness.
// - An "ask" rule in opencode.json hangs an unattended agent on an approval
//   the orchestrator cannot grant; "deny" returns an error it can act on.
//
//   npm run verify:agents

import { existsSync, readFileSync } from "node:fs";

// Codex's limit is 32,768 bytes. The margin leaves room for a global
// ~/.codex/AGENTS.md, which counts against the same budget.
const AGENTS_MD_MAX_BYTES = 31_000;

type Rule = string | Record<string, string>;

function verifyAgentsMd(): string[] {
  const bytes = readFileSync("AGENTS.md").byteLength;
  if (bytes > AGENTS_MD_MAX_BYTES) {
    return [
      `AGENTS.md is ${bytes} bytes; the limit is ${AGENTS_MD_MAX_BYTES}. ` +
        "Move branch-specific reference behind a pointer rather than raising the limit.",
    ];
  }
  return [];
}

function verifyClaudeMd(): string[] {
  const content = readFileSync("CLAUDE.md", "utf8").trim();
  return content === "@AGENTS.md"
    ? []
    : ['CLAUDE.md must contain only "@AGENTS.md"; shared rules belong in AGENTS.md.'];
}

function verifyOpencodeConfig(): string[] {
  const { permission } = JSON.parse(readFileSync("opencode.json", "utf8")) as {
    permission?: Record<string, Rule>;
  };
  if (!permission) return ['opencode.json has no "permission" block.'];

  const problems: string[] = [];
  const bash = permission.bash;
  if (typeof bash !== "object" || bash["*"] !== "deny") {
    problems.push('opencode.json: bash must default to "deny" with an explicit allow-list.');
  }
  if (permission.external_directory !== "deny") {
    problems.push('opencode.json: external_directory must be "deny".');
  }
  for (const [tool, rule] of Object.entries(permission)) {
    const actions = typeof rule === "string" ? [rule] : Object.values(rule);
    if (actions.includes("ask")) {
      problems.push(`opencode.json: ${tool} uses "ask", which stalls unattended runs; use "deny".`);
    }
  }
  return problems;
}

function verifyGuide(): string[] {
  const guide = "docs/agent-orchestration.md";
  if (!existsSync(guide)) return [`${guide} is missing.`];
  return readFileSync("AGENTS.md", "utf8").includes(guide)
    ? []
    : [`AGENTS.md must point at ${guide}.`];
}

const problems = [
  ...verifyAgentsMd(),
  ...verifyClaudeMd(),
  ...verifyOpencodeConfig(),
  ...verifyGuide(),
];

if (problems.length > 0) {
  for (const problem of problems) console.error(`ERROR  ${problem}`);
  console.error(`\nVerification FAILED — ${problems.length} error(s).`);
  process.exit(1);
}
console.log("Agent config verification PASSED.");
