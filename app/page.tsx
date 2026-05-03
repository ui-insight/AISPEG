import Link from "next/link";
import { getPubliclyVisible } from "@/lib/portfolio";
import { artifacts, sortedArtifacts } from "@/lib/artifacts";
import { summary as standardsSummary } from "@/lib/standards-watch";
import { PUBLIC_STAGE_LABEL, stageBreakdown } from "@/lib/lifecycle-display";

// Editorial pick of three featured projects for the landing's
// Work tile. Curated by IIDS — rotate when the work changes. There is
// no automated freshness signal on Project yet (no lastUpdated
// field; tracked for a future schema extension), so framing must stay
// editorial: the order is curator's choice, not "most recent."
const FEATURED_PICKS = ["stratplan", "audit-dashboard", "vandalizer"];

export default async function Home() {
  const all = getPubliclyVisible();
  const projectCount = all.length;
  const homeUnitCount = new Set(all.flatMap((i) => i.homeUnits)).size;
  const mostRecent = sortedArtifacts()[0]?.dateLabel;
  const stageStats = stageBreakdown(all);
  const featuredPicks = FEATURED_PICKS
    .map((slug) => all.find((i) => i.slug === slug))
    .filter((i): i is NonNullable<typeof i> => i !== undefined);
  const standards = standardsSummary();
  const reportCount = artifacts.length;

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
        <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-muted">
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
          {mostRecent && (
            <>
              <span aria-hidden className="text-brand-silver">
                ·
              </span>
              <span>
                most recent update{" "}
                <span className="font-bold text-brand-black">
                  {mostRecent}
                </span>
              </span>
            </>
          )}
        </p>
        {stageStats.length > 1 && (
          <p className="mt-1 text-sm text-ink-muted">
            {stageStats.map((s, idx) => (
              <span key={s.stage}>
                {idx > 0 && (
                  <span aria-hidden className="text-brand-silver">
                    {" · "}
                  </span>
                )}
                <span className="font-bold tabular-nums text-brand-black">
                  {s.count}
                </span>{" "}
                {PUBLIC_STAGE_LABEL[s.stage].toLowerCase()}
              </span>
            ))}
          </p>
        )}
      </section>

      <section>
        <Link
          href="/portfolio"
          className="group block rounded-xl border border-hairline bg-white p-8 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Projects
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {projectCount} AI projects across UI units
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Projects, their operational owners, and current status.
          </p>
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {featuredPicks.map((p) => (
              <li key={p.slug} className="py-3">
                <p className="text-base font-semibold text-brand-black">
                  {p.name}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  <em className="font-semibold text-brand-black">
                    {p.operationalOwners[0].name}
                  </em>
                  {" · "}
                  {p.homeUnits[0]}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-black transition-colors group-hover:bg-brand-gold-dark">
              Explore the portfolio &rarr;
            </span>
          </div>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
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
          <p className="mt-3 text-sm font-medium text-brand-black group-hover:underline">
            Start &rarr;
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
            outstanding asks. Oldest is{" "}
            <span className="font-semibold text-brand-black">
              {standards.oldestOutstanding} days
            </span>{" "}
            old.{" "}
            <span className="font-semibold text-brand-black">
              {standards.counts.published}
            </span>{" "}
            published.
          </p>
          <p className="mt-3 text-sm font-medium text-brand-black group-hover:underline">
            View &rarr;
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
            <span className="font-semibold text-brand-black">{reportCount}</span>{" "}
            published. Latest:{" "}
            <span className="font-semibold text-brand-black">{mostRecent}</span>.
          </p>
          <p className="mt-3 text-sm font-medium text-brand-black group-hover:underline">
            Browse &rarr;
          </p>
        </Link>
      </section>
    </div>
  );
}
