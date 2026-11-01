// scripts/check-live-urls.ts
//
// Probes each project's liveUrl. The portfolio verifier checks data, not
// whether a site answers, so a stopped deployment can pass it for weeks.
// The weekly workflow keeps one GitHub issue open while any active project's
// URL is down. When every URL fails, the problem is likely the runner, so
// this exits 1 instead of reporting all of them.
//
//   npm run check:live-urls -- [--report <file>]

import { appendFileSync, writeFileSync } from "node:fs";
import { projects } from "../lib/portfolio.js";
import { probeUrl } from "../lib/status-review.js";

const INACTIVE = new Set(["paused", "sunsetting", "archived"]);

async function main(): Promise<void> {
  const reportIndex = process.argv.indexOf("--report");
  const reportPath = reportIndex >= 0 ? process.argv[reportIndex + 1] : undefined;

  const targets = projects.filter((p) => p.liveUrl && !INACTIVE.has(p.status));
  const urls = [...new Set(targets.map((p) => p.liveUrl!))];
  const probes = await Promise.all(urls.map((url) => probeUrl(url)));
  const down = probes.filter((p) => p.state === "down");

  if (urls.length > 0 && down.length === urls.length) {
    console.error(`All ${urls.length} URLs failed; check the runner's network before trusting this.`);
    for (const p of down) console.error(`  ${p.url}: ${p.status ?? p.error}`);
    process.exit(1);
  }

  const rows = down.map((probe) => {
    const slugs = targets.filter((p) => p.liveUrl === probe.url).map((p) => p.slug);
    return `- ${probe.url} returned ${probe.status ?? probe.error} (${slugs.join(", ")})`;
  });
  const certIssues = probes.filter((p) => p.certIssue).length;
  const certNote = certIssues
    ? `\n${certIssues} answering URLs have a certificate chain that strict clients reject.\n`
    : "";
  const report = rows.length
    ? `${rows.length} of ${urls.length} live URLs are down:\n\n${rows.join("\n")}\n${certNote}`
    : `All ${urls.length} live URLs answered.\n${certNote}`;
  console.log(report);
  if (reportPath) writeFileSync(reportPath, report);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `down=${rows.length}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
