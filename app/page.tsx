import Link from "next/link";
import {
  getPubliclyVisible,
  PUBLIC_STAGE_LABEL,
  stageBreakdown,
} from "@/lib/portfolio";
import { artifacts, sortedArtifacts } from "@/lib/artifacts";
import { summary as standardsSummary } from "@/lib/standards-watch";

export default async function Home() {
  const all = getPubliclyVisible();
  const projectCount = all.length;
  const homeUnitCount = new Set(all.flatMap((i) => i.homeUnits)).size;
  const mostRecent = sortedArtifacts()[0]?.dateLabel;
  const stageStats = stageBreakdown(all);
  const standards = standardsSummary();
  const reportCount = artifacts.length;
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

      <section
        aria-label="Where to go next"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Link
          href="/portfolio"
          className="group block rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Projects
          </p>
          <h3 className="mt-1 text-base font-semibold text-brand-black">
            AI projects across UI units
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-brand-black">
              {projectCount}
            </span>{" "}
            projects across{" "}
            <span className="font-semibold text-brand-black">
              {homeUnitCount}
            </span>{" "}
            home units. Operational owners and current status.
          </p>
        </Link>

        <Link
          href="/explore"
          className="group block rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Explore
          </p>
          <h3 className="mt-1 text-base font-semibold text-brand-black">
            Browse by the kind of work
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Find projects tackling documents, processes, reconciliation,
            and more &mdash; or open the strategic-plan coverage map.
          </p>
        </Link>

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
            outstanding asks.{" "}
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
      </section>
    </div>
  );
}
