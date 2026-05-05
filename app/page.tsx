import Link from "next/link";
import {
  getPubliclyVisible,
  PUBLIC_STAGE_LABEL,
  stageBreakdown,
} from "@/lib/portfolio";
import { artifacts, sortedArtifacts } from "@/lib/artifacts";
import { summary as standardsSummary } from "@/lib/standards-watch";
import { buildProjectMapGraph } from "@/lib/project-map-graph";

// Editorial pick of three featured projects for the landing's primary
// Projects tile. Curator's choice — rotate when the work changes. The
// landing leads with these to put real owners in front of stakeholders;
// the full inventory lives at /portfolio.
const FEATURED_PICKS = ["stratplan", "audit-dashboard", "vandalizer"];

export default async function Home() {
  const all = getPubliclyVisible();
  const projectCount = all.length;
  const homeUnitCount = new Set(all.flatMap((i) => i.homeUnits)).size;
  const mostRecent = sortedArtifacts()[0]?.dateLabel;
  const stageStats = stageBreakdown(all);
  const standards = standardsSummary();
  const reportCount = artifacts.length;
  const featuredPicks = FEATURED_PICKS.map((slug) =>
    all.find((i) => i.slug === slug),
  ).filter((i): i is NonNullable<typeof i> => i !== undefined);

  // Map freshness — count of strategic-plan priorities with no
  // aligned project. Reuses the same graph adapter the map renders
  // from so the count can never drift.
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
    <div className="space-y-10">
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Institutional AI Initiative
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
          AI work at the University of Idaho
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Coordinated by the Institute for Interdisciplinary Data Sciences
          (IIDS), this site tracks AI projects &mdash; the discrete
          builds, pilots, and integrations &mdash; running across UI units.
        </p>
        <p className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-ink-muted">
          <span>
            <span className="font-bold tabular-nums text-brand-black">
              {projectCount}
            </span>{" "}
            projects across{" "}
            <span className="font-bold tabular-nums text-brand-black">
              {homeUnitCount}
            </span>{" "}
            home units
          </span>
          {stageStats.map((s) => (
            <span key={s.stage} className="inline-flex items-baseline">
              <span aria-hidden className="mr-2 text-brand-silver">
                ·
              </span>
              <span className="font-bold tabular-nums text-brand-black">
                {s.count}
              </span>
              <span className="ml-1.5">
                {PUBLIC_STAGE_LABEL[s.stage].toLowerCase()}
              </span>
            </span>
          ))}
        </p>
        <p className="mt-2 text-xs text-ink-subtle">
          As of {buildDate} (last deploy)
        </p>
      </section>

      {/* Primary tile — Projects, with featured-project warmth signal.
          Visually heavier than the secondary row and carries the gold
          CTA per .impeccable.md (Pride Gold for the primary CTA). */}
      <section>
        <Link
          href="/portfolio"
          className="group block rounded-xl border border-hairline bg-white p-6 transition-shadow hover:shadow-md sm:p-8"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Projects
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-black">
            AI projects across UI units
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Operational owners, home units, and current status.
          </p>
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {featuredPicks.map((p) => (
              <li key={p.slug} className="py-3">
                <p className="text-base font-semibold text-brand-black">
                  {p.name}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  <em className="font-semibold not-italic text-brand-black">
                    {p.operationalOwners[0].name}
                  </em>
                  {" · "}
                  {p.homeUnits[0]}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-ui-gold bg-ui-gold/10 px-3.5 py-1.5 text-sm font-semibold text-brand-black transition-colors group-hover:bg-ui-gold/25">
              Explore all {projectCount} projects &rarr;
            </span>
          </div>
        </Link>
      </section>

      {/* Secondary tile row — wayfinding to the four other primary
          surfaces. Equal-weight to each other, smaller than the
          primary Projects tile. */}
      <section
        aria-label="Where to go next"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Link
          href="/builder-guide"
          className="group block rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Submit a Project
          </p>
          <h3 className="mt-1 text-base font-semibold text-brand-black">
            9-step assessment
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Routes to a named IIDS owner with a 2-business-day SLA.
          </p>
        </Link>

        <Link
          href="/standards"
          className="group block rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Standards
          </p>
          <h3 className="mt-1 text-base font-semibold text-brand-black">
            Software + UX standards
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-brand-black">
              {standards.outstanding}
            </span>{" "}
            outstanding.{" "}
            <span className="font-semibold text-brand-black">
              {standards.counts.published}
            </span>{" "}
            published.
          </p>
        </Link>

        <Link
          href="/reports"
          className="group block rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Reports
          </p>
          <h3 className="mt-1 text-base font-semibold text-brand-black">
            Activity reports + briefs
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-brand-black">
              {reportCount}
            </span>{" "}
            published. Latest:{" "}
            <span className="font-semibold text-brand-black">
              {mostRecent}
            </span>
            .
          </p>
        </Link>

        <Link
          href="/standards/strategic-plan/map"
          className="group block rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Map
          </p>
          <h3 className="mt-1 text-base font-semibold text-brand-black">
            Strategic plan coverage
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {uncoveredCount > 0 ? (
              <>
                <span className="font-semibold text-brand-black">
                  {uncoveredCount}
                </span>{" "}
                priorit{uncoveredCount === 1 ? "y" : "ies"} uncovered.
              </>
            ) : (
              <>All priorities covered.</>
            )}
          </p>
        </Link>
      </section>
    </div>
  );
}
