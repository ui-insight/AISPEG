// scripts/print-utr-landscape.ts
//
// Smoke harness for lib/utr-landscape.ts (ADR 0008, PR 3): builds the
// landscape from the typed portfolio module + the live request registry
// and prints the bands, pools, and mismatch-ledger sentences. This is
// the same pure builder the surface (PR 4) renders — the script exists
// so the computations can be reviewed against real data before any UI.
//
// Project source note: this harness feeds lib/portfolio.ts (the typed
// shadow) rather than lib/work.ts (the Postgres read path the page
// uses) because work.ts is server-only. The two carry the same rows
// whenever the seed is current; buildUtrLandscape accepts either.
//
// Usage (needs DATABASE_URL):
//   npm run print:utr-landscape
//   npm run print:utr-landscape -- --json   # full model as JSON

import { projects } from "../lib/portfolio.js";
import { listTechRequests } from "../lib/requests.js";
import { buildUtrLandscape } from "../lib/utr-landscape.js";

async function main(): Promise<void> {
  const requests = await listTechRequests();
  const landscape = buildUtrLandscape(projects, requests);

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(landscape, null, 2));
    return;
  }

  console.log(
    `UTR Landscape — ${landscape.totals.projects} projects, ${landscape.totals.openRequests} open requests (${landscape.totals.classifiedOpenRequests} classified)\n`
  );

  console.log("── Bands ──────────────────────────────────────────");
  for (const b of landscape.bands) {
    console.log(
      `  ${b.profile.name.padEnd(42)} [${b.profile.maturity}] running ${b.running.length} · headed ${b.headed.length} · queued ${b.queued.length}`
    );
  }

  console.log("\n── Pools ──────────────────────────────────────────");
  const pools = landscape.pools;
  console.log(`  external-hosted ${pools.externalHosted.length} · oit-managed-tbd ${pools.oitManagedTbd.length} · no-deployment ${pools.noDeployment.length} · platforms ${pools.platforms.length} · unclassified ${pools.unclassified.length}`);

  console.log("\n── Mismatch ledger ────────────────────────────────");
  for (const f of landscape.findings) {
    console.log(`\n  [${f.kind}]`);
    console.log(`  ${f.headline}`);
    console.log(`    ${f.detail}`);
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("Landscape build failed:", err);
    process.exit(1);
  }
);
