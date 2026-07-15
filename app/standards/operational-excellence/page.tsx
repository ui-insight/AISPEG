import Link from "next/link";
import type {
  CandidateProject,
  SurveyAudience,
  SurveyClusterKey,
  SurveyResponse,
} from "@/lib/surveys/types";
import {
  OPERATIONAL_EXCELLENCE_META,
  clustersFor,
  getCluster,
  responsesFor,
  responseCount,
  featuredFor,
  allResponses,
  totalResponseCount,
} from "@/lib/surveys/operational-excellence";
import {
  candidateProjectsByCoverage,
  candidatesForCluster,
  CANDIDATE_COVERAGE_LABEL,
} from "@/lib/surveys/candidate-projects";
import { getWorkCategoryLabel } from "@/lib/work-categories";
import { getProjectBySlug } from "@/lib/portfolio";

export const metadata = {
  title: "Operational Excellence Survey — Standards",
  description:
    "Themes and every anonymized response from the University of Idaho's October 2025 Operational Excellence survey (Strategic Plan Pillar 5): what faculty, staff, and students want simplified, automated, and improved.",
};

const BASE = "/standards/operational-excellence";
type ViewMode = "themes" | "explore" | "candidates";

// ── URL param handling ───────────────────────────────────────
interface Params {
  view: ViewMode;
  audience: SurveyAudience;
  cluster: SurveyClusterKey | null;
  q: string;
}

function normalize(
  raw: { view?: string; audience?: string; cluster?: string; q?: string },
): Params {
  const audience: SurveyAudience = raw.audience === "student" ? "student" : "faculty";
  const view: ViewMode =
    raw.view === "explore" ? "explore" : raw.view === "candidates" ? "candidates" : "themes";
  const q = (raw.q ?? "").trim();
  // A cluster is only valid within its audience.
  const cluster =
    raw.cluster && getCluster(audience, raw.cluster as SurveyClusterKey)
      ? (raw.cluster as SurveyClusterKey)
      : null;
  return { view, audience, cluster, q };
}

function href(p: Partial<Params>): string {
  const sp = new URLSearchParams();
  if (p.view && p.view !== "themes") sp.set("view", p.view);
  if (p.audience && p.audience !== "faculty") sp.set("audience", p.audience);
  if (p.cluster) sp.set("cluster", p.cluster);
  if (p.q) sp.set("q", p.q);
  const s = sp.toString();
  return s ? `${BASE}?${s}` : BASE;
}

// ── Small building blocks ────────────────────────────────────
function CountChip({ n }: { n: number }) {
  return (
    <span className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
      {n} {n === 1 ? "response" : "responses"}
    </span>
  );
}

function SegToggle({
  options,
  ariaLabel,
}: {
  ariaLabel: string;
  options: { label: string; to: string; active: boolean }[];
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="inline-flex flex-wrap rounded-md border border-hairline bg-white p-0.5"
    >
      {options.map((o) => (
        <Link
          key={o.label}
          href={o.to}
          aria-current={o.active ? "true" : undefined}
          className={`unstyled rounded px-3 py-1 text-sm transition-colors ${
            o.active
              ? "bg-ui-gold/15 font-semibold text-brand-black"
              : "font-medium text-ink-muted hover:text-brand-black"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}

function Verbatim({ r }: { r: SurveyResponse }) {
  return (
    <figure className="rounded-md border border-hairline bg-surface-alt p-4">
      <blockquote className="text-sm leading-relaxed text-brand-black">
        &ldquo;{r.text}&rdquo;
      </blockquote>
    </figure>
  );
}

// ── Themes view ──────────────────────────────────────────────
function ThemesView({ audience }: { audience: SurveyAudience }) {
  const clusters = clustersFor(audience);
  return (
    <div className="space-y-8">
      {clusters.map((c) => {
        const featured = featuredFor(audience, c.key);
        const total = responseCount(audience, c.key);
        return (
          <article
            key={c.key}
            className="rounded-lg border border-hairline bg-white p-6"
          >
            <header className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-xl font-black tracking-tight text-brand-black">
                {c.label}
              </h3>
              <CountChip n={total} />
            </header>
            <p className="mt-1 text-sm italic text-ink-subtle">{c.question}</p>
            <p className="mt-3 max-w-3xl text-base text-ink-muted">{c.summary}</p>

            <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {c.subThemes.map((s) => (
                <div key={s.label}>
                  <p className="text-sm font-semibold text-brand-black">
                    {s.label}
                  </p>
                  <p className="text-sm text-ink-muted">{s.description}</p>
                </div>
              ))}
            </div>

            {featured.length > 0 && (
              <div className="mt-6 border-t border-hairline pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-silver">
                  In their words
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {featured.slice(0, 4).map((r) => (
                    <Verbatim key={r.id} r={r} />
                  ))}
                </div>
              </div>
            )}

            <p className="mt-5 text-sm">
              <Link href={href({ view: "explore", audience, cluster: c.key })}>
                Read all {total} {c.label.toLowerCase()} responses &rarr;
              </Link>
            </p>

            {(() => {
              const candidates = candidatesForCluster(audience, c.key);
              if (candidates.length === 0) return null;
              return (
                <p className="mt-1 text-sm text-ink-subtle">
                  Feeds:{" "}
                  {candidates.map((cp, i) => (
                    <span key={cp.id}>
                      {i > 0 && ", "}
                      <Link href={`${href({ view: "candidates" })}#${cp.id}`}>
                        {cp.title}
                      </Link>
                    </span>
                  ))}
                </p>
              );
            })()}
          </article>
        );
      })}
    </div>
  );
}

// ── Explore view ─────────────────────────────────────────────
function matches(r: SurveyResponse, q: string): boolean {
  return q === "" || r.text.toLowerCase().includes(q.toLowerCase());
}

function ExploreView({
  audience,
  cluster,
  q,
}: {
  audience: SurveyAudience;
  cluster: SurveyClusterKey | null;
  q: string;
}) {
  const pool = cluster
    ? responsesFor(audience, cluster)
    : allResponses().filter((r) => r.audience === audience);
  const results = pool.filter((r) => matches(r, q));
  const clusters = clustersFor(audience);

  const clusterFilters = [
    { label: "All areas", to: href({ view: "explore", audience, q }), active: cluster === null },
    ...clusters.map((c) => ({
      label: c.label,
      to: href({ view: "explore", audience, cluster: c.key, q }),
      active: cluster === c.key,
    })),
  ];

  return (
    <div className="space-y-5">
      {/* Cluster filter chips */}
      <div className="flex flex-wrap gap-2">
        {clusterFilters.map((f) => (
          <Link
            key={f.label}
            href={f.to}
            aria-current={f.active ? "true" : undefined}
            className={`unstyled rounded-full border px-3 py-1 text-sm transition-colors ${
              f.active
                ? "border-ui-gold bg-ui-gold/15 font-semibold text-brand-black"
                : "border-hairline bg-white font-medium text-ink-muted hover:text-brand-black"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Search — plain GET form, no client JS */}
      <form action={BASE} method="get" className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="view" value="explore" />
        <input type="hidden" name="audience" value={audience} />
        {cluster && <input type="hidden" name="cluster" value={cluster} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search responses (e.g. financial aid, Chrome River, advising)…"
          aria-label="Search responses"
          className="w-full max-w-md rounded-md border border-hairline bg-white px-3 py-2 text-sm text-brand-black placeholder:text-ink-subtle focus:border-ui-gold focus:outline-none sm:w-96"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-black/90"
        >
          Search
        </button>
        {q && (
          <Link href={href({ view: "explore", audience, cluster })} className="text-sm">
            Clear
          </Link>
        )}
      </form>

      <p className="text-sm text-ink-muted">
        {results.length} {results.length === 1 ? "response" : "responses"}
        {cluster ? ` in ${getCluster(audience, cluster)?.label}` : ""}
        {q ? ` matching “${q}”` : ""}.
      </p>

      <ul className="space-y-3">
        {results.map((r) => {
          const c = getCluster(r.audience, r.cluster);
          return (
            <li
              key={r.id}
              id={r.id}
              className="scroll-mt-24 rounded-md border border-hairline bg-white p-4 target:border-ui-gold target:bg-ui-gold/5"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-silver">
                  {c?.label}
                </span>
                {r.featured && (
                  <span className="rounded-full border border-hairline bg-surface-alt px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                    Representative
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-brand-black">{r.text}</p>
            </li>
          );
        })}
      </ul>

      {results.length === 0 && (
        <p className="rounded-md border border-hairline bg-surface-alt p-6 text-sm text-ink-muted">
          No responses match that search. Try a broader term, or{" "}
          <Link href={href({ view: "explore", audience, cluster })}>clear the search</Link>.
        </p>
      )}
    </div>
  );
}

// ── Candidate projects view ──────────────────────────────────
const AUDIENCE_LABEL: Record<SurveyAudience, string> = {
  faculty: "Faculty & staff",
  student: "Students",
};

function CoverageChip({ coverage }: { coverage: CandidateProject["coverage"] }) {
  const styles: Record<CandidateProject["coverage"], string> = {
    gap: "border-hairline bg-surface-alt text-ink-muted",
    partial: "border-brand-huckleberry/30 bg-brand-huckleberry/5 text-brand-huckleberry",
    covered: "border-brand-clearwater/30 bg-brand-clearwater/5 text-brand-clearwater",
  };
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[coverage]}`}
    >
      {CANDIDATE_COVERAGE_LABEL[coverage]}
    </span>
  );
}

function CandidateCard({ c }: { c: CandidateProject }) {
  const related = (c.relatedProjectSlugs ?? [])
    .map((s) => getProjectBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <article
      id={c.id}
      className="scroll-mt-24 rounded-lg border border-hairline bg-white p-6 target:border-ui-gold"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-xl font-black tracking-tight text-brand-black">
          {c.title}
        </h3>
        <CoverageChip coverage={c.coverage} />
      </header>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-ink-muted">
          {getWorkCategoryLabel(c.workCategory)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-silver">
          {c.audiences.map((a) => AUDIENCE_LABEL[a]).join(" · ")}
        </span>
      </div>

      <p className="mt-4 max-w-3xl text-base text-brand-black">{c.problem}</p>
      <p className="mt-2 max-w-3xl text-sm text-ink-muted">{c.shape}</p>
      {c.note && (
        <p className="mt-2 max-w-3xl text-sm italic text-ink-subtle">{c.note}</p>
      )}

      <div className="mt-5 flex flex-col gap-4 border-t border-hairline pt-4 sm:flex-row sm:gap-10">
        {related.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-silver">
              Related projects
            </p>
            <p className="mt-1 text-sm">
              {related.map((p, i) => (
                <span key={p.slug}>
                  {i > 0 && " · "}
                  <Link href={`/portfolio/${p.slug}`}>{p.name}</Link>
                </span>
              ))}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-silver">
            Evidence
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {c.clusters.map((cl) => {
              const cluster = getCluster(cl.audience, cl.cluster);
              const anchor = (c.evidenceResponseIds ?? []).find(
                (id) => id.startsWith(cl.audience[0]) && id.endsWith(`-${cl.cluster}`),
              );
              const to =
                href({ view: "explore", audience: cl.audience, cluster: cl.cluster }) +
                (anchor ? `#${anchor}` : "");
              return (
                <Link key={`${cl.audience}-${cl.cluster}`} href={to}>
                  {AUDIENCE_LABEL[cl.audience]}: {cluster?.label} &rarr;
                </Link>
              );
            })}
          </p>
        </div>
      </div>
    </article>
  );
}

function CandidatesView() {
  const items = candidateProjectsByCoverage();
  const groups: { coverage: CandidateProject["coverage"]; heading: string }[] = [
    { coverage: "gap", heading: "Gaps — no current project" },
    { coverage: "partial", heading: "Partially covered by existing work" },
    { coverage: "covered", heading: "Already addressed" },
  ];
  const count = (cov: CandidateProject["coverage"]) =>
    items.filter((c) => c.coverage === cov).length;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-hairline bg-surface-alt p-5">
        <p className="max-w-3xl text-sm text-ink-muted">
          Where the survey&rsquo;s demand signal points, cross-referenced against
          what the portfolio already runs. These are proposals for the Chief AI
          &amp; Data Science Officer&rsquo;s office and IIDS to triage &mdash;
          grounded in the responses, not commitments. No owners, dates, or ROI are
          asserted here; those are decided in intake.
        </p>
        <p className="mt-3 border-t border-hairline pt-3 text-sm font-semibold text-brand-black">
          {count("gap")} gaps · {count("partial")} partially covered ·{" "}
          {count("covered")} already addressed
        </p>
      </section>

      {groups.map((g) => {
        const inGroup = items.filter((c) => c.coverage === g.coverage);
        if (inGroup.length === 0) return null;
        return (
          <section key={g.coverage} className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-silver">
              {g.heading}
            </h2>
            {inGroup.map((c) => (
              <CandidateCard key={c.id} c={c} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default async function OperationalExcellenceSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; audience?: string; cluster?: string; q?: string }>;
}) {
  const params = normalize(await searchParams);
  const { view, audience, cluster, q } = params;
  const meta = OPERATIONAL_EXCELLENCE_META;

  const audienceOptions = meta.respondents.map((r) => ({
    label: r.label,
    to: href({ view, audience: r.audience, q }),
    active: audience === r.audience,
  }));

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight text-brand-black sm:text-4xl">
          Operational Excellence Survey
        </h1>
        <p className="mt-4 text-lg text-brand-black">
          What {meta.respondents.reduce((n, r) => n + r.count, 0)} faculty, staff,
          and students told the University to simplify, automate, and fix.
        </p>
        <p className="mt-3 text-base text-ink-muted">
          In October 2025 the University asked its community, in their own words,
          which processes could better support students and employees &mdash; the
          demand signal behind {meta.pillar.toLowerCase()}. This page summarizes
          the themes and lets you read every response.
        </p>
      </header>

      {/* Stat strip */}
      <section className="rounded-lg border border-hairline bg-surface-alt p-5">
        <p className="text-sm font-semibold text-brand-black">
          {totalResponseCount()} open-ended responses from{" "}
          {meta.respondents.reduce((n, r) => n + r.count, 0)} respondents
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {meta.respondents.map((r) => `${r.count} ${r.label.toLowerCase()}`).join(" · ")}{" "}
          · fielded {meta.fielded}
        </p>
        <p className="mt-3 border-t border-hairline pt-3 text-xs text-ink-subtle">
          The survey was anonymous. Before publication, individuals named in free
          text were de-identified, and {meta.withheldCount} responses were withheld
          from this public view for privacy.
        </p>
      </section>

      {/* View + audience controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {view === "candidates" ? (
          <span aria-hidden className="hidden sm:block" />
        ) : (
          <SegToggle ariaLabel="Audience" options={audienceOptions} />
        )}
        <SegToggle
          ariaLabel="View"
          options={[
            { label: "Themes", to: href({ view: "themes", audience }), active: view === "themes" },
            { label: "Explore responses", to: href({ view: "explore", audience }), active: view === "explore" },
            { label: "Candidate projects", to: href({ view: "candidates" }), active: view === "candidates" },
          ]}
        />
      </div>

      {view === "themes" ? (
        <ThemesView audience={audience} />
      ) : view === "explore" ? (
        <ExploreView audience={audience} cluster={cluster} q={q} />
      ) : (
        <CandidatesView />
      )}

      {/* Pointer to the candidate-projects inventory */}
      {view !== "candidates" && (
        <section className="rounded-lg border border-hairline bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-silver">
            From signal to projects
          </p>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            These themes are demand signal. The{" "}
            <Link href={href({ view: "candidates" })}>Candidate projects</Link>{" "}
            view turns the strongest patterns into proposals &mdash;
            cross-referenced against what is already running &mdash; for the{" "}
            <Link href="/standards/intake-crosswalk">intake crosswalk</Link> and{" "}
            <Link href="/portfolio">project inventory</Link> to triage.
          </p>
        </section>
      )}
    </div>
  );
}
