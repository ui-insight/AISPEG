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
} from "@/lib/rubric";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Project Pipeline · UI AI Portfolio",
  description:
    "How new AI project requests are scored and prioritized — the full rubric, weighted scores, and current review queue.",
};

function scoreCell(value: number | null): string {
  return value === null ? "–" : String(value);
}

function PendingTable({ requests }: { requests: ScoredRequest[] }) {
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

export default async function PipelinePage() {
  const [requests, lastSync, apps] = await Promise.all([
    listScoredRequests(),
    getLastSync(),
    listApplications({ audience: "public" }).catch(() => []),
  ]);

  const pending = requests.filter((r) => r.status === "pending");
  const promoted = requests.filter((r) => r.status === "active");
  const notPursued = requests.filter((r) => r.status === "rejected");
  const completed = requests.filter((r) => r.status === "complete");

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
        <span className="text-ui-charcoal">Pipeline</span>
      </nav>

      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Projects · Pipeline
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">
          How new project requests are prioritized
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Every AI project request submitted to IIDS is scored by Colin
          Addington on an 11-criterion rubric — strategic impact (A1–A4),
          feasibility and effort (B1–B4), and urgency and buy-in (C1–C3) —
          and prioritized by weighted score. This is the live review queue,
          synced from the IIDS-AI4UI workspace.
        </p>
      </header>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface-alt p-8 text-center">
          <p className="text-sm font-medium text-ink-muted">
            No synced request data yet. The queue appears here after the
            first ClickUp sync runs.
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-black tracking-tight text-brand-black">
                In review
              </h2>
              <span className="text-sm text-ink-subtle">
                {pending.length}{" "}
                {pending.length === 1 ? "request" : "requests"}, highest
                score first
              </span>
            </div>
            <PendingTable requests={pending} />
            <p className="text-xs text-ink-subtle">
              Weighted score = {RUBRIC_FORMULA}, on a 0–100 scale. Criteria
              are scored 1–5 — full definitions below. Hover a column header
              for the criterion name.
            </p>
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
