import Link from "next/link";
import { getPubliclyVisible } from "@/lib/portfolio";
import { sortedArtifacts } from "@/lib/artifacts";

export const dynamic = "force-dynamic";

// Editorial pick of three featured interventions for the landing's
// Work tile. Curated by IIDS — rotate when the work changes. There is
// no automated freshness signal on Intervention yet (no lastUpdated
// field; tracked for a future schema extension), so framing must stay
// editorial: the order is curator's choice, not "most recent."
const FEATURED_PICKS = ["stratplan", "audit-dashboard", "vandalizer"];

export default async function Home() {
  const all = getPubliclyVisible();
  const interventionCount = all.length;
  const homeUnitCount = new Set(all.flatMap((i) => i.homeUnits)).size;
  const mostRecent = sortedArtifacts()[0]?.dateLabel;
  const featuredPicks = FEATURED_PICKS
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
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Coordinated by IIDS, this site tracks the AI work running across UI
          units &mdash; what&apos;s built, who built it, and what&apos;s next.
        </p>
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
          {mostRecent && (
            <>
              <span aria-hidden className="text-brand-silver">
                ·
              </span>
              <span>
                most recent update{" "}
                <span className="font-semibold text-brand-black">
                  {mostRecent}
                </span>
              </span>
            </>
          )}
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

      <p className="text-sm text-ink-muted">
        Have a project idea?{" "}
        <Link href="/builder-guide" className="font-medium text-brand-black">
          Start the assessment &rarr;
        </Link>
      </p>
    </div>
  );
}
