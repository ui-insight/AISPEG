import Link from "next/link";
import {
  EVALUATOR_KIND_LABEL,
  SCORECARD_BUCKETS,
  SCORECARD_SOURCE,
  SCORECARD_STATUS_NOTE,
  TECHNICAL_READINESS_LABEL,
  USAGE_FREQUENCY_LABEL,
  YES_NO_LABEL,
  YES_NO_PARTIAL_LABEL,
  fieldsInBucket,
  scorecardField,
  type ScorecardFieldKey,
} from "@/lib/build-scorecard";
import {
  listRunEvaluations,
  listScorecardRuns,
  subjectHref,
  type ScorecardEvaluation,
  type ScorecardRun,
} from "@/lib/scorecard-data";
import {
  ConfidenceText,
  GateChip,
  NetFiveYearValue,
  SubjectKindChip,
} from "@/components/Scorecard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Build Scorecard · UI AI Portfolio",
  description:
    "Active projects and open requests on the Unified Technology Request four-bucket build scorecard — financial case, risk, impact, and feasibility, with every value justified and attributed to its evaluator.",
};

type SubjectFilter = "all" | "project" | "request";
type SortKey = "net" | "users" | "months" | "breach";

const SORTS: { key: SortKey; label: string; description: string }[] = [
  { key: "net", label: "Net 5-year $", description: "Largest Net 5-Year $ first; not computable last." },
  { key: "users", label: "Users", description: "Most users first." },
  { key: "months", label: "Time to usable", description: "Soonest usable version first." },
  { key: "breach", label: "Breach exposure", description: "Most people affected by a breach first." },
];

interface SearchParams {
  run?: string;
  subject?: string;
  sort?: string;
}

function href(params: { run?: string | null; subject?: SubjectFilter; sort?: SortKey }): string {
  const qs = new URLSearchParams();
  if (params.run) qs.set("run", params.run);
  if (params.subject && params.subject !== "all") qs.set("subject", params.subject);
  if (params.sort && params.sort !== "net") qs.set("sort", params.sort);
  const s = qs.toString();
  return s ? `/portfolio/scorecard?${s}` : "/portfolio/scorecard";
}

function num(ev: ScorecardEvaluation, key: ScorecardFieldKey): number | null {
  const v = ev.values[key]?.value;
  return typeof v === "number" ? v : null;
}

function text(ev: ScorecardEvaluation, key: ScorecardFieldKey): string | null {
  const v = ev.values[key]?.value;
  return typeof v === "string" ? v : null;
}

function sortEvaluations(evs: ScorecardEvaluation[], sort: SortKey): ScorecardEvaluation[] {
  // Unknowns sort last in every order; ties fall back to title.
  const metric = (ev: ScorecardEvaluation): number | null => {
    switch (sort) {
      case "net":
        return ev.net.total;
      case "users":
        return num(ev, "user_count");
      case "months":
        return num(ev, "months_to_usable");
      case "breach":
        return num(ev, "people_affected_if_breached");
    }
  };
  const ascending = sort === "months";
  return [...evs].sort((a, b) => {
    const ma = metric(a);
    const mb = metric(b);
    if (ma === null && mb !== null) return 1;
    if (mb === null && ma !== null) return -1;
    if (ma !== null && mb !== null && ma !== mb) return ascending ? ma - mb : mb - ma;
    return a.subject.title.localeCompare(b.subject.title);
  });
}

const CHIP_BASE =
  "unstyled inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const CHIP_ACTIVE = "border-ui-gold bg-ui-gold/15 text-brand-black";
const CHIP_IDLE =
  "border-hairline bg-white text-ink-muted hover:border-brand-silver/40 hover:bg-surface-alt";

function FilterChip({
  to,
  active,
  label,
  count,
  title,
}: {
  to: string;
  active: boolean;
  label: string;
  count?: number;
  title?: string;
}) {
  return (
    <Link
      href={to}
      aria-current={active ? "page" : undefined}
      title={title}
      className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_IDLE}`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
            active ? "bg-brand-black/10 text-brand-black" : "bg-surface-alt text-ink-subtle"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function enumCell(
  ev: ScorecardEvaluation,
  key: ScorecardFieldKey,
  labels: Readonly<Record<string, string>>
) {
  const v = text(ev, key);
  return v ? (labels[v] ?? v) : <span className="text-ink-subtle">–</span>;
}

function countCell(ev: ScorecardEvaluation, key: ScorecardFieldKey) {
  const v = num(ev, key);
  return v === null ? <span className="text-ink-subtle">–</span> : v.toLocaleString("en-US");
}

// A named mandate reads as a short citation; the "none" answers
// collapse to a dash so the column scans for the rows that have one.
function mandateCell(ev: ScorecardEvaluation) {
  const v = text(ev, "compliance_mandate");
  if (!v || /^none( identified)?\.?$/i.test(v.trim())) {
    return <span className="text-ink-subtle">–</span>;
  }
  const short = v.split(/[—(;]/)[0]!.trim();
  return <span title={v}>{short.length > 40 ? `${short.slice(0, 38)}…` : short}</span>;
}

const TH = "px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted";
const TD = "px-2 py-2.5 text-xs text-ui-charcoal";

function ScoreTable({ evaluations }: { evaluations: ScorecardEvaluation[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-hairline bg-white">
      <table className="w-full min-w-[1180px] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline bg-surface-alt">
            <th className="px-4 py-2 text-xs font-semibold text-brand-black" rowSpan={2}>
              Project or request
            </th>
            <th className={`${TH} border-l border-hairline`} rowSpan={2}>
              Gate
            </th>
            <th className="border-l border-hairline px-2 pt-2 text-xs font-semibold text-brand-black" colSpan={2}>
              Financial
            </th>
            <th className="border-l border-hairline px-2 pt-2 text-xs font-semibold text-brand-black" colSpan={3}>
              Risk
            </th>
            <th className="border-l border-hairline px-2 pt-2 text-xs font-semibold text-brand-black" colSpan={3}>
              Impact
            </th>
            <th className="border-l border-hairline px-2 pt-2 text-xs font-semibold text-brand-black" colSpan={3}>
              Feasibility
            </th>
          </tr>
          <tr className="border-b border-hairline bg-surface-alt">
            <th className={`${TH} border-l border-hairline text-right`} title="(Subscription + Personnel + Status-quo) × (6 − savings-start year) − build − 5 × maintenance">
              Net 5-yr $
            </th>
            <th className={TH} title={scorecardField("financial_data_confidence").help}>
              Confidence
            </th>
            <th className={`${TH} border-l border-hairline text-right`} title={scorecardField("people_affected_if_breached").help}>
              Breach #
            </th>
            <th className={TH} title={scorecardField("reviewed_fallback_exists").help}>
              Fallback
            </th>
            <th className={`${TH} text-right`} title={scorecardField("maintainer_count").help}>
              Maintainers
            </th>
            <th className={`${TH} border-l border-hairline text-right`} title={scorecardField("user_count").help}>
              Users
            </th>
            <th className={TH} title={scorecardField("usage_frequency").help}>
              Frequency
            </th>
            <th className={TH} title={scorecardField("compliance_mandate").help}>
              Mandate
            </th>
            <th className={`${TH} border-l border-hairline`} title={scorecardField("technical_readiness").help}>
              Readiness
            </th>
            <th className={TH} title={scorecardField("capacity_available_now").help}>
              Capacity
            </th>
            <th className={`${TH} text-right`} title={scorecardField("months_to_usable").help}>
              Months
            </th>
          </tr>
        </thead>
        <tbody>
          {evaluations.map((ev) => (
            <tr key={ev.id} className="border-b border-hairline align-top last:border-b-0 hover:bg-surface-alt/60">
              <td className="max-w-[280px] px-4 py-2.5">
                <Link href={subjectHref(ev.subject)} className="text-sm font-semibold leading-snug">
                  {ev.subject.title}
                </Link>
                {ev.subject.unit && (
                  <p className="mt-0.5 text-xs text-ink-subtle">{ev.subject.unit}</p>
                )}
                <div className="mt-1">
                  <SubjectKindChip subject={ev.subject} />
                </div>
              </td>
              <td className={`${TD} border-l border-hairline`}>
                <GateChip gate={ev.gate} />
              </td>
              <td className={`${TD} border-l border-hairline text-right font-semibold`}>
                <NetFiveYearValue net={ev.net} />
              </td>
              <td className={TD}>
                <ConfidenceText confidence={ev.confidence} />
              </td>
              <td className={`${TD} border-l border-hairline text-right tabular-nums`}>
                {countCell(ev, "people_affected_if_breached")}
              </td>
              <td className={TD}>{enumCell(ev, "reviewed_fallback_exists", YES_NO_LABEL)}</td>
              <td className={`${TD} text-right tabular-nums`}>{countCell(ev, "maintainer_count")}</td>
              <td className={`${TD} border-l border-hairline text-right tabular-nums`}>
                {countCell(ev, "user_count")}
              </td>
              <td className={TD}>{enumCell(ev, "usage_frequency", USAGE_FREQUENCY_LABEL)}</td>
              <td className={`${TD} max-w-[160px]`}>{mandateCell(ev)}</td>
              <td className={`${TD} border-l border-hairline`}>
                {enumCell(ev, "technical_readiness", TECHNICAL_READINESS_LABEL)}
              </td>
              <td className={TD}>{enumCell(ev, "capacity_available_now", YES_NO_PARTIAL_LABEL)}</td>
              <td className={`${TD} text-right tabular-nums`}>{countCell(ev, "months_to_usable")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RunLine({ run }: { run: ScorecardRun }) {
  const date = new Date(run.scoredAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <>
      {run.evaluatorLabel} · {EVALUATOR_KIND_LABEL[run.evaluatorKind].toLowerCase()} · {date}
    </>
  );
}

export default async function ScorecardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const runs = await listScorecardRuns().catch(() => [] as ScorecardRun[]);
  const run = runs.find((r) => r.id === params.run) ?? runs[0] ?? null;
  const runParam = run && run.id !== runs[0]?.id ? run.id : null;
  const evaluations = run ? await listRunEvaluations(run.id) : [];

  const subject: SubjectFilter =
    params.subject === "project" || params.subject === "request" ? params.subject : "all";
  const sort: SortKey = SORTS.some((s) => s.key === params.sort) ? (params.sort as SortKey) : "net";

  const inSubject = evaluations.filter((ev) => subject === "all" || ev.subject.kind === subject);
  const locked = inSubject.filter((ev) => ev.gate === "locked-constrained");
  const compared = sortEvaluations(
    inSubject.filter((ev) => ev.gate !== "locked-constrained"),
    sort
  );

  const projectCount = evaluations.filter((ev) => ev.subject.kind === "project").length;
  const requestCount = evaluations.length - projectCount;
  const withDollarCase = evaluations.filter(
    (ev) => ev.confidence === "observed" || ev.confidence === "estimated"
  ).length;
  const unconfirmed = evaluations.filter((ev) => ev.gate === "status-unconfirmed").length;
  const lockedCount = evaluations.filter((ev) => ev.gate === "locked-constrained").length;
  const positiveNet = evaluations.filter(
    (ev) => ev.gate !== "locked-constrained" && (ev.net.total ?? 0) > 0
  );
  const evaluatorCount = new Set(runs.map((r) => r.evaluator)).size;

  return (
    <div className="space-y-10">
      <nav className="text-sm text-gray-500">
        <Link href="/portfolio" className="hover:text-brand-black">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">Build scorecard</span>
      </nav>

      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">Projects</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">
          Active projects and open requests on the build scorecard
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          The Unified Technology Request four-bucket scorecard reads each
          candidate build as real numbers and named facts — its five-year
          financial case, its risk, its impact, and its feasibility — with no
          weights and no composite score. Anything locked by a contract,
          consortium agreement, or statute is pulled out of comparison first.
          Every value below carries a written justification and the name of
          the evaluator who gave it; where evaluators disagree, the subject
          page shows them side by side.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-ink-subtle">{SCORECARD_STATUS_NOTE}</p>

        {run && (
          <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-ink-muted">
            <span>
              <span className="font-bold tabular-nums text-brand-black">{evaluations.length}</span> scored
              ({projectCount} projects, {requestCount} requests)
            </span>
            <span aria-hidden className="text-brand-silver">·</span>
            <span>
              <span className="font-bold tabular-nums text-brand-black">{withDollarCase}</span> with an
              observed or estimated dollar case
            </span>
            <span aria-hidden className="text-brand-silver">·</span>
            <span>
              <span className="font-bold tabular-nums text-brand-black">{positiveNet.length}</span> with a
              positive Net 5-year $
            </span>
            <span aria-hidden className="text-brand-silver">·</span>
            <span>
              <span className="font-bold tabular-nums text-brand-black">{unconfirmed}</span> gate unconfirmed
            </span>
            <span aria-hidden className="text-brand-silver">·</span>
            <span>
              <span className="font-bold tabular-nums text-brand-black">{lockedCount}</span> locked
            </span>
          </p>
        )}
      </header>

      {!run ? (
        <div className="rounded-xl border border-hairline bg-surface-alt p-8 text-center">
          <p className="text-sm font-medium text-ink-muted">
            No scoring runs are recorded yet. Apply Migration 030 and import a run with{" "}
            <code>npm run import:scorecard</code>.
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
                  Evaluator
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-black">
                  <RunLine run={run} />
                </p>
              </div>
              {runs.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {runs.map((r) => (
                    <FilterChip
                      key={r.id}
                      to={href({ run: r.id === runs[0]!.id ? null : r.id, subject, sort })}
                      active={r.id === run.id}
                      label={`${r.evaluatorLabel} · ${r.runLabel}`}
                      count={r.evaluationCount}
                    />
                  ))}
                </div>
              )}
            </div>
            {evaluatorCount === 1 && (
              <p className="max-w-3xl text-xs leading-relaxed text-ink-subtle">
                One evaluator so far. Scores from other models and from people
                are recorded as separate runs and shown alongside this one, not
                averaged into it.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              <div className="flex flex-wrap gap-1.5">
                <FilterChip to={href({ run: runParam, subject: "all", sort })} active={subject === "all"} label="All" count={evaluations.length} />
                <FilterChip to={href({ run: runParam, subject: "project", sort })} active={subject === "project"} label="Active projects" count={projectCount} />
                <FilterChip to={href({ run: runParam, subject: "request", sort })} active={subject === "request"} label="Requests" count={requestCount} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-ink-subtle">Sort</span>
                {SORTS.map((s) => (
                  <FilterChip
                    key={s.key}
                    to={href({ run: runParam, subject, sort: s.key })}
                    active={sort === s.key}
                    label={s.label}
                    title={s.description}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black tracking-tight text-brand-black">
              In comparison
              <span className="ml-2 text-base font-semibold text-ink-subtle tabular-nums">{compared.length}</span>
            </h2>
            {compared.length > 0 ? (
              <ScoreTable evaluations={compared} />
            ) : (
              <p className="border-y border-hairline py-6 text-sm text-ink-muted">Nothing in this view.</p>
            )}
            <p className="max-w-3xl text-xs leading-relaxed text-ink-subtle">
              Net 5-year $ = (subscription + personnel + status-quo cost avoided) × (6 − year savings
              start) − build cost − 5 × annual maintenance, the workbook&apos;s own formula. * marks a
              total where some inputs were unknown and counted as $0; a dash means there was nothing
              to compute from. Read the confidence column before the dollar column. Open a row for
              every field and its justification.
            </p>
          </section>

          {locked.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-brand-black">
                  Excluded from comparison — locked
                  <span className="ml-2 text-base font-semibold text-ink-subtle tabular-nums">{locked.length}</span>
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-ink-muted">
                  A committed contract, a payment-class or life-safety system, a consortium agreement,
                  or a statutory requirement makes these something other than a live choice to rank.
                </p>
              </div>
              <ul className="divide-y divide-hairline border-y border-hairline">
                {locked.map((ev) => (
                  <li key={ev.id} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,280px)_1fr] sm:gap-6">
                    <div>
                      <Link href={subjectHref(ev.subject)} className="text-sm font-semibold">
                        {ev.subject.title}
                      </Link>
                      {ev.subject.unit && <p className="text-xs text-ink-subtle">{ev.subject.unit}</p>}
                    </div>
                    <p className="text-sm text-ink-muted">{text(ev, "gate_notes") ?? "–"}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-4 border-t border-hairline pt-8">
            <h2 className="text-xl font-black tracking-tight text-brand-black">The four buckets</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">
              From the {SCORECARD_SOURCE.replace(/\.xlsx$/, "")} workbook. It replaces the weighted
              Prioritization Rubric v2 once ratified; the v2 scores remain on{" "}
              <Link href="/portfolio/pipeline">Requested projects</Link>.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {SCORECARD_BUCKETS.map((bucket) => (
                <details key={bucket.key} className="rounded-xl border border-hairline bg-white p-5">
                  <summary className="cursor-pointer text-sm font-semibold text-brand-black">
                    {bucket.label}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{bucket.description}</p>
                  <dl className="mt-3 space-y-2">
                    {fieldsInBucket(bucket.key).map((f) => (
                      <div key={f.key}>
                        <dt className="text-xs font-semibold text-brand-black">{f.label}</dt>
                        <dd className="text-xs leading-relaxed text-ink-muted">
                          {f.help}
                          {f.options && (
                            <span className="text-ink-subtle">
                              {" "}
                              ({Object.values(f.options).join(" · ")})
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}
            </div>
            <details className="rounded-xl border border-hairline bg-surface-alt p-5">
              <summary className="cursor-pointer text-sm font-semibold text-brand-black">
                How this run was produced
              </summary>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{run.method}</p>
              <p className="mt-3 text-xs leading-relaxed text-ink-subtle">
                Rubric version {run.rubricVersion}
                {run.sourceFile && <> · imported from <code>{run.sourceFile}</code></>}. A new
                evaluator contributes a run as an interchange file in the same shape and imports it
                with <code>npm run import:scorecard</code>; runs are never merged.
              </p>
            </details>
          </section>
        </>
      )}
    </div>
  );
}
