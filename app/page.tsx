import Link from "next/link";
import {
  getPubliclyVisible,
  computePublicStage,
  type Project,
} from "@/lib/portfolio";
import { artifacts, sortedArtifacts } from "@/lib/artifacts";
import { summary as standardsSummary } from "@/lib/standards-watch";
import { buildProjectMapGraph } from "@/lib/project-map-graph";

export default async function Home() {
  const all = getPubliclyVisible();
  // Use lane requires an openable production URL. Live projects without a
  // public liveUrl (e.g. dev infrastructure like DGX Stack and TEMPLATE-app)
  // surface in /portfolio's full inventory but not here — "Use" means
  // there is something for a stakeholder to click and open.
  const liveProjects = all.filter(
    (p) =>
      computePublicStage(p.status) === "live" &&
      !!p.liveUrl &&
      !p.liveUrlIsStaging,
  );
  const buildingCount = all.filter(
    (p) => computePublicStage(p.status) === "building",
  ).length;
  const totalUnits = new Set(all.flatMap((p) => p.homeUnits)).size;
  const liveUnits = new Set(liveProjects.flatMap((p) => p.homeUnits)).size;

  const standards = standardsSummary();
  const reportCount = artifacts.length;
  const mostRecent = sortedArtifacts()[0]?.dateLabel;

  const graph = buildProjectMapGraph("public");
  const linkedPriorities = new Set(
    graph.links.filter((l) => l.side === "left").map((l) => l.target),
  );
  const uncoveredCount = graph.priorities.filter(
    (p) => !linkedPriorities.has(p.code),
  ).length;

  const buildDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-12">
      {/* Lede — OPS-first, named-and-owned framing */}
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Institutional AI Initiative
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
          Tools your unit can use today, plus the work that&rsquo;s coming
          next.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Coordinated by the Institute for Interdisciplinary Data Sciences
          (IIDS). Every project here is named, owned, and tracked &mdash;
          with a real person you can talk to in a real UI unit.
        </p>

        {/* Coverage rollup — decision 3C */}
        <p className="mt-6 text-sm text-ink-muted">
          <span className="font-bold tabular-nums text-brand-black">
            {liveProjects.length}
          </span>{" "}
          tools live across{" "}
          <span className="font-bold tabular-nums text-brand-black">
            {liveUnits}
          </span>{" "}
          of{" "}
          <span className="font-bold tabular-nums text-brand-black">
            {totalUnits}
          </span>{" "}
          UI units &middot;{" "}
          <span className="font-bold tabular-nums text-brand-black">
            {buildingCount}
          </span>{" "}
          more in build
        </p>
        <p className="mt-2 text-xs text-ink-subtle">
          Outcome measurement begins as projects move into production use.
          Page reflects the inventory as of {buildDate}.
        </p>
      </section>

      {/* USE lane — dominant, OPS-first.
          Lists every live project with name, tagline, owner, and an
          Open or View affordance. Gold CTA at the foot routes to the
          full inventory. */}
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Use
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-black">
          Open what&rsquo;s running
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          {liveProjects.length === 0
            ? "No tools are live yet — the inventory is in build."
            : `${liveProjects.length} tools are live across UI units. Click to open the tool, or contact the named owner.`}
        </p>

        {liveProjects.length > 0 && (
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {liveProjects.map((p) => (
              <UseRow key={p.slug} project={p} />
            ))}
          </ul>
        )}

        <div className="mt-6">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 rounded-md border-2 border-ui-gold bg-ui-gold/10 px-3.5 py-1.5 text-sm font-semibold text-brand-black transition-colors hover:bg-ui-gold/25"
          >
            Browse all {all.length} projects (live, building, tracked) &rarr;
          </Link>
        </div>
      </section>

      {/* BUILD + EVALUATE — secondary lanes, side-by-side at desktop */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Link
          href="/builder-guide"
          className="group block rounded-xl border border-hairline bg-white p-6 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Build
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-brand-black">
            Have a problem AI could help with?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            A 9-step assessment routes your idea to a named IIDS owner with
            a 2-business-day SLA. We tell you whether it&rsquo;s a candidate,
            what&rsquo;s already adjacent, and what comes next.
          </p>
          <p className="mt-4 inline-flex items-center text-sm font-semibold text-brand-clearwater group-hover:underline">
            Submit a project &rarr;
          </p>
        </Link>

        <div className="rounded-xl border border-hairline bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Evaluate
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-brand-black">
            How we judge our own work
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                href="/standards"
                className="group flex items-baseline justify-between gap-3"
              >
                <span className="font-semibold text-brand-black group-hover:text-brand-clearwater">
                  Standards
                </span>
                <span className="text-xs text-ink-muted">
                  {standards.counts.published} published &middot;{" "}
                  {standards.outstanding} drafted
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/reports"
                className="group flex items-baseline justify-between gap-3"
              >
                <span className="font-semibold text-brand-black group-hover:text-brand-clearwater">
                  Reports
                </span>
                <span className="text-xs text-ink-muted">
                  {reportCount} published
                  {mostRecent ? ` · latest ${mostRecent}` : ""}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/standards/strategic-plan/map"
                className="group flex items-baseline justify-between gap-3"
              >
                <span className="font-semibold text-brand-black group-hover:text-brand-clearwater">
                  Strategic plan coverage
                </span>
                <span className="text-xs text-ink-muted">
                  {uncoveredCount > 0
                    ? `${uncoveredCount} priorit${uncoveredCount === 1 ? "y" : "ies"} uncovered`
                    : "All priorities covered"}
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function UseRow({ project: p }: { project: Project }) {
  const ownerName = p.operationalOwners[0]?.name ?? "IIDS";
  const homeUnit = p.homeUnits[0] ?? "UI";

  return (
    <li className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-brand-black">{p.name}</p>
          <p className="mt-0.5 text-sm leading-snug text-ink-muted">
            {p.tagline}
          </p>
          <p className="mt-1.5 text-xs text-ink-muted">
            <em className="font-semibold not-italic text-brand-black">
              {ownerName}
            </em>{" "}
            &middot; {homeUnit}
          </p>
          {p.usageNote && (
            <p className="mt-1 text-xs italic text-ink-subtle">
              {p.usageNote}
            </p>
          )}
        </div>
        <a
          href={p.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-semibold text-brand-clearwater hover:underline"
        >
          Open &rarr;
        </a>
      </div>
    </li>
  );
}
