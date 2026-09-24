import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DIRECTION_LABEL,
  EVALUATOR_KIND_LABEL,
  SCORECARD_BUCKETS,
  fieldsInBucket,
  formatFieldValue,
  formatUsd,
  scoreBand,
  type ScorecardFieldDef,
  type ScorecardFieldKey,
  type ScoredBucket,
} from "@/lib/build-scorecard";
import {
  listSubjectEvaluations,
  type ScorecardEvaluation,
} from "@/lib/scorecard-data";
import { NetFiveYearValue, ScoreValue, SubjectKindChip } from "@/components/Scorecard";

export const dynamic = "force-dynamic";

type Params = Promise<{ kind: string; id: string }>;

async function load(params: Params) {
  const { kind, id } = await params;
  if (kind !== "project" && kind !== "request") return null;
  // A malformed request id would make Postgres throw on the uuid cast
  // path; the text comparison in listSubjectEvaluations avoids that.
  const evaluations = await listSubjectEvaluations(kind, decodeURIComponent(id)).catch(
    () => [] as ScorecardEvaluation[]
  );
  return evaluations.length > 0 ? evaluations : null;
}

export async function generateMetadata({ params }: { params: Params }) {
  const evaluations = await load(params);
  const title = evaluations?.[0]?.subject.title ?? "Not scored";
  return {
    title: `${title} · Build Scorecard · UI AI Portfolio`,
    description: `The four-bucket build scorecard for ${title}, with every field's justification and evaluator.`,
  };
}

function runDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function numberOf(ev: ScorecardEvaluation, key: ScorecardFieldKey): number | null {
  const v = ev.values[key]?.value;
  return typeof v === "number" ? v : null;
}

/** The workbook formula with this evaluation's numbers plugged in. */
function NetArithmetic({ ev }: { ev: ScorecardEvaluation }) {
  const part = (key: ScorecardFieldKey) => {
    const v = numberOf(ev, key);
    return v === null ? <span className="text-ink-subtle">?</span> : formatUsd(v);
  };
  const start = numberOf(ev, "savings_start_year");
  return (
    <p className="text-xs leading-relaxed text-ink-muted tabular-nums">
      ({part("subscription_avoided_annual")} + {part("personnel_avoided_annual")} +{" "}
      {part("status_quo_cost_eliminated_annual")}) × (6 −{" "}
      {start === null ? <span className="text-ink-subtle">?</span> : start}) −{" "}
      {part("build_cost_one_time")} − 5 × {part("maintenance_cost_annual")}
    </p>
  );
}

function valuesDiffer(evaluations: ScorecardEvaluation[], key: ScorecardFieldKey): boolean {
  if (evaluations.length < 2) return false;
  const seen = new Set(evaluations.map((ev) => JSON.stringify(ev.values[key]?.value ?? null)));
  return seen.size > 1;
}

function FieldCell({ field, ev }: { field: ScorecardFieldDef; ev: ScorecardEvaluation }) {
  const entry = ev.values[field.key as ScorecardFieldKey];
  if (!entry) {
    return <p className="text-xs text-ink-subtle">Not scored in this run.</p>;
  }
  const unknown = entry.value === null;
  const band =
    field.kind === "score" && typeof entry.value === "number"
      ? scoreBand(field.bucket as ScoredBucket, entry.value)
      : null;
  return (
    <div>
      <p className={`text-sm ${unknown ? "text-ink-subtle" : "font-semibold text-brand-black"}`}>
        {formatFieldValue(field, entry.value)}
        {band && <span className="ml-2 font-normal text-ink-muted">{band.band}</span>}
        {field.direction && (
          <span className="ml-2 text-xs font-normal text-ink-subtle">({DIRECTION_LABEL[field.direction]})</span>
        )}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{entry.justification}</p>
      {entry.evidence && (
        <p className="mt-1 break-words text-[11px] text-ink-subtle">Source: {entry.evidence}</p>
      )}
    </div>
  );
}

export default async function ScorecardSubjectPage({ params }: { params: Params }) {
  const evaluations = await load(params);
  if (!evaluations) notFound();

  const subject = evaluations[0]!.subject;
  const multi = evaluations.length > 1;

  return (
    <div className="space-y-10">
      <nav className="text-sm text-gray-500">
        <Link href="/portfolio" className="hover:text-brand-black">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <Link href="/portfolio/scorecard" className="hover:text-brand-black">
          Build scorecard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">{subject.title}</span>
      </nav>

      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">Projects</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">{subject.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
          <SubjectKindChip subject={subject} />
          {subject.unit && <span>{subject.unit}</span>}
          {subject.kind === "request" && subject.requestor && <span>Requested by {subject.requestor}</span>}
          {subject.kind === "project" ? (
            <Link href={`/portfolio/${subject.slug}`}>Project page</Link>
          ) : (
            <Link href="/portfolio/pipeline">Request queue</Link>
          )}
        </div>
      </header>

      <section className={`grid gap-4 ${multi ? "lg:grid-cols-2" : ""}`}>
        {evaluations.map((ev) => (
          <article key={ev.id} className="rounded-xl border border-hairline bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              {EVALUATOR_KIND_LABEL[ev.run.evaluatorKind]} · {ev.run.runLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-black">
              {ev.run.evaluatorLabel} · {runDate(ev.run.scoredAt)}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">{ev.summary}</p>
            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-hairline pt-3">
              {(
                [
                  ["risk", "Risk", ev.risk, "10 = worst"],
                  ["impact", "Impact", ev.impact, "10 = best"],
                  ["feasibility", "Feasibility", ev.feasibility, "10 = best"],
                ] as const
              ).map(([bucket, label, score, direction]) => (
                <div key={bucket}>
                  <dt className="text-xs font-semibold text-brand-black">
                    {label} <span className="font-normal text-ink-subtle">· {direction}</span>
                  </dt>
                  <dd className="mt-0.5 text-sm">
                    <ScoreValue bucket={bucket} score={score} showBand />
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t border-hairline pt-3">
              <p className="text-xs font-semibold text-brand-black">
                Net 5-year $ <span className="ml-2 text-base"><NetFiveYearValue net={ev.net} /></span>
              </p>
              <NetArithmetic ev={ev} />
            </div>
            {ev.sources.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-ink-muted">
                  Sources consulted ({ev.sources.length})
                </summary>
                <ul className="mt-2 space-y-0.5 text-[11px] text-ink-subtle">
                  {ev.sources.map((s) => (
                    <li key={s} className="break-words">{s}</li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}
      </section>

      {SCORECARD_BUCKETS.map((bucket) => (
        <section key={bucket.key} className="space-y-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-brand-black">{bucket.label}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">{bucket.description}</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-hairline bg-white">
            <table className={`w-full border-collapse text-left ${multi ? "min-w-[900px]" : ""}`}>
              <thead className="sr-only sm:not-sr-only">
                <tr className="border-b border-hairline bg-surface-alt">
                  <th className="w-56 px-4 py-2 text-xs font-semibold text-brand-black">Field</th>
                  {evaluations.map((ev) => (
                    <th key={ev.id} className="px-4 py-2 text-xs font-semibold text-brand-black">
                      {multi ? `${ev.run.evaluatorLabel} · ${ev.run.runLabel}` : "Value and justification"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fieldsInBucket(bucket.key).map((field) => {
                  const differs = valuesDiffer(evaluations, field.key as ScorecardFieldKey);
                  return (
                    <tr key={field.key} className="border-b border-hairline align-top last:border-b-0">
                      <th scope="row" className="w-56 px-4 py-3 text-left">
                        <p className="text-xs font-semibold text-brand-black">{field.label}</p>
                        <p className="mt-0.5 text-[11px] font-normal leading-snug text-ink-subtle">{field.help}</p>
                        {differs && (
                          <span className="mt-1 inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            Evaluators differ
                          </span>
                        )}
                      </th>
                      {evaluations.map((ev) => (
                        <td key={ev.id} className="px-4 py-3">
                          <FieldCell field={field} ev={ev} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
