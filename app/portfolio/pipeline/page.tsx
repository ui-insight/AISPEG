import Link from "next/link";
import SyncFreshness from "@/components/SyncFreshness";
import {
  listScoredRequests,
  getLastSync,
  type ScoredRequest,
} from "@/lib/clickup-data";
import { listIdForSlug, CLICKUP_PROJECT_LISTS } from "@/lib/clickup-map";
import { listApplications } from "@/lib/work";
import {
  RUBRIC_CRITERIA,
  RUBRIC_FORMULA,
  RUBRIC_GROUPS,
  REQUEST_VALUE_LENSES,
  isRequestValueLens,
  type RequestValueLens,
} from "@/lib/rubric";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Requested Projects · UI AI Portfolio",
  description:
    "Explore requested AI projects by financial impact, strategic value, reach, urgency, and other prioritization evidence.",
};

interface PipelineSearchParams {
  value?: string;
}

function scoreCell(value: number | null): string {
  return value === null ? "–" : String(value);
}

function DetailedScoreTable({ requests }: { requests: ScoredRequest[] }) {
  const hasComputed = requests.some((r) => r.scoreSource === "computed");
  return (
    <div className="overflow-x-auto rounded-xl border border-hairline bg-white">
      <table className="w-full min-w-[1000px] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Request
            </th>
            <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Unit
            </th>
            <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Feasibility
            </th>
            {RUBRIC_CRITERIA.map((col) => (
              <th
                key={col.key}
                title={`${col.name} (weight ${col.weight})`}
                className="px-1.5 py-3 text-center text-xs font-semibold text-ink-muted"
              >
                {col.code}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brand-black">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.taskId}
              className="border-b border-hairline last:border-b-0"
            >
              <td className="px-4 py-2.5">
                <p className="text-sm font-medium text-brand-black">{r.name}</p>
                {r.category && (
                  <p className="text-xs text-ink-subtle">{r.category}</p>
                )}
              </td>
              <td className="px-3 py-2.5 text-xs text-ink-muted">
                {r.unit ?? "–"}
              </td>
              <td className="px-3 py-2.5 text-xs text-ink-muted">
                {r.feasibility ?? "–"}
              </td>
              {RUBRIC_CRITERIA.map((col) => (
                <td
                  key={col.key}
                  className="px-1.5 py-2.5 text-center text-xs tabular-nums text-ui-charcoal"
                >
                  {scoreCell(r.rubric[col.key])}
                </td>
              ))}
              <td className="px-4 py-2.5 text-right text-sm font-bold tabular-nums text-brand-black">
                {r.weightedScore === null
                  ? "–"
                  : Math.round(r.weightedScore * 10) / 10}
                {r.scoreSource === "computed" && (
                  <span title="Computed from rubric values (formula value unavailable in ClickUp)">
                    *
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasComputed && (
        <p className="border-t border-hairline px-4 py-2 text-xs text-ink-subtle">
          * Score computed from the rubric values; ClickUp&apos;s stored formula
          value was unavailable.
        </p>
      )}
    </div>
  );
}

function requestDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scoreForLens(
  request: ScoredRequest,
  lens: (typeof REQUEST_VALUE_LENSES)[number]
): number | null {
  return request.rubric[lens.rubricKey];
}

function sortPending(
  requests: ScoredRequest[],
  lens: (typeof REQUEST_VALUE_LENSES)[number] | null
): ScoredRequest[] {
  return [...requests].sort((a, b) => {
    if (lens) {
      const aValue = scoreForLens(a, lens) ?? -1;
      const bValue = scoreForLens(b, lens) ?? -1;
      if (aValue !== bValue) return bValue - aValue;
    }
    return (b.weightedScore ?? -1) - (a.weightedScore ?? -1);
  });
}

function PendingExplorer({
  requests,
  selectedLens,
}: {
  requests: ScoredRequest[];
  selectedLens: (typeof REQUEST_VALUE_LENSES)[number] | null;
}) {
  return (
    <ul className="divide-y divide-hairline border-y border-hairline">
      {requests.map((request) => {
        const strongestSignals = REQUEST_VALUE_LENSES.map((lens) => ({
          lens,
          score: scoreForLens(request, lens),
        }))
          .filter(
            (item): item is {
              lens: (typeof REQUEST_VALUE_LENSES)[number];
              score: number;
            } => item.score !== null
          )
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        const selectedScore = selectedLens
          ? scoreForLens(request, selectedLens)
          : null;

        return (
          <li
            key={request.taskId}
            className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_9rem]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-base font-bold text-brand-black">
                  {request.name}
                </h3>
                <p className="text-xs text-ink-subtle">
                  {[request.unit, request.category, requestDate(request.dateCreated)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {request.description && (
                <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                  {request.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(selectedLens && selectedScore !== null
                  ? [{ lens: selectedLens, score: selectedScore }]
                  : strongestSignals
                ).map(({ lens, score }) => (
                  <span
                    key={lens.value}
                    title={lens.description}
                    className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-brand-black"
                  >
                    {lens.label}{" "}
                    <span className="font-bold tabular-nums">{score}/5</span>
                  </span>
                ))}
                {request.feasibility && (
                  <span className="rounded-full border border-hairline bg-white px-2.5 py-0.5 text-xs text-ink-muted">
                    Feasibility: {request.feasibility}
                  </span>
                )}
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-silver">
                Priority score
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-brand-black">
                {request.weightedScore === null
                  ? "Not scored"
                  : Math.round(request.weightedScore * 10) / 10}
              </p>
              {request.weightedScore !== null && (
                <p className="text-xs text-ink-subtle">out of 100</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CompactRequestList({
  requests,
  slugByName,
}: {
  requests: ScoredRequest[];
  slugByName: Map<string, string>;
}) {
  return (
    <ul className="space-y-1.5">
      {requests.map((r) => {
        const slug = slugByName.get(r.name.toLowerCase());
        return (
          <li
            key={r.taskId}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm"
          >
            <span className="text-ui-charcoal">
              {slug ? (
                <Link
                  href={`/portfolio/${slug}`}
                  className="font-medium text-brand-black hover:underline"
                >
                  {r.name}
                </Link>
              ) : (
                r.name
              )}
              {r.unit && (
                <span className="text-xs text-ink-subtle"> · {r.unit}</span>
              )}
            </span>
            {r.weightedScore !== null && (
              <span className="text-xs tabular-nums text-ink-muted">
                scored {Math.round(r.weightedScore * 10) / 10}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<PipelineSearchParams>;
}) {
  const params = await searchParams;
  const selectedValue: RequestValueLens | null = isRequestValueLens(
    params.value?.trim()
  )
    ? (params.value!.trim() as RequestValueLens)
    : null;
  const selectedLens =
    REQUEST_VALUE_LENSES.find((lens) => lens.value === selectedValue) ?? null;
  const [requests, lastSync, apps] = await Promise.all([
    listScoredRequests(),
    getLastSync(),
    listApplications({ audience: "public" }).catch(() => []),
  ]);

  const pending = requests.filter((r) => r.status === "pending");
  const promoted = requests.filter((r) => r.status === "active");
  const notPursued = requests.filter((r) => r.status === "rejected");
  const completed = requests.filter((r) => r.status === "complete");
  const sortedPending = sortPending(pending, selectedLens);
  const financialPotentialCount = pending.filter(
    (request) => (request.rubric.a2 ?? 0) >= 3
  ).length;

  // Best-effort link from a promoted request to its portfolio entry: the
  // request name rarely matches the project name exactly, so map through
  // the ClickUp list names too.
  const slugByName = new Map<string, string>();
  for (const app of apps) {
    if (listIdForSlug(app.slug)) slugByName.set(app.name.toLowerCase(), app.slug);
  }
  for (const m of CLICKUP_PROJECT_LISTS) {
    slugByName.set(m.listName.toLowerCase(), m.slug);
  }

  return (
    <div className="space-y-10">
      <nav className="text-sm text-gray-500">
        <Link href="/portfolio" className="hover:text-brand-black">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">Requested projects</span>
      </nav>

      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Projects
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">
          Requested projects awaiting a start decision
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Every AI project request submitted to IIDS is scored by Colin
          Addington on an 11-criterion rubric: strategic impact (A1–A4),
          feasibility and effort (B1–B4), and urgency and buy-in (C1–C3),
          then prioritized by weighted score. This is the live review queue,
          synced from the IIDS-AI4UI workspace.
        </p>
        {requests.length > 0 && (
          <p className="mt-5 flex flex-wrap items-baseline gap-x-2 text-sm text-ink-muted">
            <span>
              <span className="font-bold tabular-nums text-brand-black">
                {pending.length}
              </span>{" "}
              in review
            </span>
            <span aria-hidden className="text-brand-silver">
              ·
            </span>
            <span>
              <span className="font-bold tabular-nums text-brand-black">
                {financialPotentialCount}
              </span>{" "}
              with moderate or higher financial impact
            </span>
            {promoted.length > 0 && (
              <>
                <span aria-hidden className="text-brand-silver">
                  ·
                </span>
                <span>
                  <span className="font-bold tabular-nums text-brand-black">
                    {promoted.length}
                  </span>{" "}
                  promoted to active work
                </span>
              </>
            )}
          </p>
        )}
      </header>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface-alt p-8 text-center">
          <p className="text-sm font-medium text-ink-muted">
            No requested-project data has been synced yet. This view remains
            the permanent home for intake requests before work starts.
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
                Explore by value
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-brand-black">
                In review
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
                Start with overall priority, or rank the queue by a particular
                kind of return. Financial impact includes potential savings,
                revenue, and grant value; it is broader than software
                replacement alone.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pb-2">
              <Link
                href="/portfolio/pipeline"
                aria-current={!selectedLens ? "page" : undefined}
                className={`unstyled inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  !selectedLens
                    ? "border-ui-gold bg-ui-gold/15 text-brand-black"
                    : "border-hairline bg-white text-ink-muted hover:border-brand-silver/40 hover:bg-surface-alt"
                }`}
              >
                Overall priority
                <span className="rounded-full bg-surface-alt px-1.5 py-0 text-[10px] font-semibold text-ink-subtle">
                  {pending.length}
                </span>
              </Link>
              {REQUEST_VALUE_LENSES.map((lens) => {
                const count = pending.filter(
                  (request) => scoreForLens(request, lens) !== null
                ).length;
                const active = selectedLens?.value === lens.value;
                return (
                  <Link
                    key={lens.value}
                    href={`/portfolio/pipeline?value=${lens.value}`}
                    aria-current={active ? "page" : undefined}
                    title={lens.description}
                    className={`unstyled inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "border-ui-gold bg-ui-gold/15 text-brand-black"
                        : "border-hairline bg-white text-ink-muted hover:border-brand-silver/40 hover:bg-surface-alt"
                    }`}
                  >
                    {lens.label}
                    <span
                      className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
                        active
                          ? "bg-brand-black/10 text-brand-black"
                          : "bg-surface-alt text-ink-subtle"
                      }`}
                    >
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
            {pending.length > 0 ? (
              <>
                <p className="text-xs font-medium text-ink-subtle">
                  {selectedLens
                    ? `Sorted by ${selectedLens.label.toLowerCase()}, then overall priority.`
                    : "Sorted by overall priority score."}
                </p>
                <PendingExplorer
                  requests={sortedPending}
                  selectedLens={selectedLens}
                />
                <details className="group pt-2">
                  <summary className="cursor-pointer text-sm font-semibold text-brand-black">
                    Show the complete 11-criterion score table
                  </summary>
                  <div className="mt-4">
                    <DetailedScoreTable requests={sortedPending} />
                  </div>
                </details>
                <p className="text-xs text-ink-subtle">
                  Weighted score = {RUBRIC_FORMULA}, on a 0–100 scale.
                  Individual criteria use a 1–5 scale; full definitions are
                  below.
                </p>
              </>
            ) : (
              <p className="border-y border-hairline py-6 text-sm text-ink-muted">
                No requests are currently awaiting review.
              </p>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-brand-black">
                The Project Prioritization Scorecard
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
                Each criterion is scored on a scale of 1 (low) to 5 (high);
                scores are multiplied by the category weight to produce the
                priority score. Anchor definitions below are the published
                scoring guide.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {RUBRIC_GROUPS.map((group) => (
                <div
                  key={group.code}
                  className="rounded-xl border border-hairline bg-white p-5"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
                    {group.code} · weight {group.weight}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-brand-black">
                    {group.name}
                  </h3>
                  <p className="mt-1 text-xs italic leading-relaxed text-ink-muted">
                    {group.description}
                  </p>
                  <dl className="mt-4 space-y-4">
                    {RUBRIC_CRITERIA.filter(
                      (c) => c.group === group.code
                    ).map((c) => (
                      <div key={c.code}>
                        <dt className="text-sm font-medium text-ui-charcoal">
                          <span className="font-mono text-xs font-semibold text-ink-muted">
                            {c.code}
                          </span>{" "}
                          {c.name}
                        </dt>
                        <dd className="mt-1 space-y-0.5 text-xs leading-relaxed text-ink-muted">
                          {c.anchors.map((a) => (
                            <p key={a.score}>
                              <span className="font-semibold tabular-nums">
                                {a.score}
                              </span>{" "}
                              — {a.text}
                            </p>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>

          {promoted.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-black tracking-tight text-brand-black">
                  Promoted to active projects
                </h2>
                <span className="text-sm text-ink-subtle">
                  {promoted.length}
                </span>
              </div>
              <CompactRequestList requests={promoted} slugByName={slugByName} />
            </section>
          )}

          {completed.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-black tracking-tight text-brand-black">
                  Completed
                </h2>
                <span className="text-sm text-ink-subtle">
                  {completed.length}
                </span>
              </div>
              <CompactRequestList requests={completed} slugByName={slugByName} />
            </section>
          )}

          {notPursued.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-black tracking-tight text-brand-black">
                  Not pursued
                </h2>
                <span className="text-sm text-ink-subtle">
                  {notPursued.length}
                </span>
              </div>
              <CompactRequestList
                requests={notPursued}
                slugByName={slugByName}
              />
            </section>
          )}
        </>
      )}

      <footer className="space-y-2 border-t border-hairline pt-6">
        {lastSync && <SyncFreshness syncedAt={lastSync.finishedAt} />}
        <p className="text-xs text-brand-silver">
          Have a process that could use this treatment?{" "}
          <Link
            href="/builder-guide"
            className="font-medium text-brand-silver hover:text-brand-black"
          >
            Submit a project &rarr;
          </Link>
        </p>
      </footer>
    </div>
  );
}
