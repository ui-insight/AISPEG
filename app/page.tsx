import Link from "next/link";
import { getPubliclyVisible } from "@/lib/portfolio";
import { sortedArtifacts } from "@/lib/artifacts";

export const dynamic = "force-dynamic";

const RECENT_PICKS = ["stratplan", "audit-dashboard", "vandalizer"];

export default async function Home() {
  const all = getPubliclyVisible();
  const interventionCount = all.length;
  const homeUnitCount = new Set(all.flatMap((i) => i.homeUnits)).size;
  const mostRecent = sortedArtifacts()[0]?.dateLabel;
  const recentPicks = RECENT_PICKS
    .map((slug) => all.find((i) => i.slug === slug))
    .filter((i): i is NonNullable<typeof i> => i !== undefined);

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Institutional AI Initiative
        </p>
        <h1 className="mt-2 text-4xl leading-tight">
          AI work at the University of Idaho
        </h1>
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
          <span>
            <span className="font-semibold text-brand-black">
              {interventionCount}
            </span>{" "}
            interventions across{" "}
            <span className="font-semibold text-brand-black">
              {homeUnitCount}
            </span>{" "}
            home units
          </span>
          <span aria-hidden className="text-brand-silver">
            ·
          </span>
          {mostRecent && (
            <>
              <span>
                most recent update{" "}
                <span className="font-semibold text-brand-black">
                  {mostRecent}
                </span>
              </span>
              <span aria-hidden className="text-brand-silver">
                ·
              </span>
            </>
          )}
          <span>coordinated by IIDS</span>
        </p>
      </section>

      <section>
        <Link
          href="/portfolio"
          className="group block rounded-xl border border-hairline bg-white p-8 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            The Work
          </p>
          <h2 className="mt-2 text-2xl">
            {interventionCount} AI interventions across UI units
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Projects, their operational owners, and current status.
          </p>
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {recentPicks.map((p) => (
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
          <p className="mt-6 text-sm font-medium text-brand-black group-hover:underline">
            Explore the portfolio &rarr;
          </p>
        </Link>
      </section>

      <section>
        <Link
          href="/builder-guide"
          className="group block rounded-xl bg-brand-gold p-8 transition-colors hover:bg-brand-gold-dark"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-black/70">
            Have an AI project idea?
          </p>
          <h2 className="mt-2 text-2xl text-brand-black">Submit a Project</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-brand-black/80">
            A short assessment scopes your idea, recommends a path, and connects
            you to a named owner at IIDS.
          </p>
          <p className="mt-4 text-sm font-bold uppercase tracking-wider text-brand-black group-hover:underline">
            Start the assessment &rarr;
          </p>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/reports"
          className="group block rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Reports
          </p>
          <h3 className="mt-1 text-base">Activity reports and presentations</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Time-stamped briefs and executive communications.
          </p>
          <p className="mt-3 text-sm font-medium text-brand-black group-hover:underline">
            Browse &rarr;
          </p>
        </Link>
        <Link
          href="/standards"
          className="group block rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Standards
          </p>
          <h3 className="mt-1 text-base">Standards documentation</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Software-development and user-experience standards governing AI
            work at UI.
          </p>
          <p className="mt-3 text-sm font-medium text-brand-black group-hover:underline">
            View &rarr;
          </p>
        </Link>
      </section>
    </div>
  );
}
