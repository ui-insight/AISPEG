import Link from "next/link";
import SyncFreshness from "@/components/SyncFreshness";
import {
  listScoredRequests,
  getLastSync,
  type ScoredRequest,
} from "@/lib/clickup-data";
import { listIdForSlug, CLICKUP_PROJECT_LISTS } from "@/lib/clickup-map";
import { listTechRequests, type TechRequest } from "@/lib/requests";
import { roiClaimsByRequest, type RoiClaim } from "@/lib/roi-claims";
import {
  INTAKE_TRACK_SHORT,
  INTAKE_TRACK_TITLE,
  REQUEST_ORIGIN_LABEL,
  isIntakeTrack,
  roiDimensionLabel,
  type RequestOrigin,
} from "@/lib/utr";
import {
  IDEA_AI_INVOLVEMENT_LABEL,
  IDEA_DATA_SIGNAL_LABEL,
  IDEA_DATA_SIGNAL_SHORT,
} from "@/lib/oit-idea";
import { listApplications } from "@/lib/work";
import {
  RUBRIC_CRITERIA,
  RUBRIC_FORMULA,
  RUBRIC_GROUPS,
  REQUEST_VALUE_LENSES,
  isRequestValueLens,
  type RequestValueLens,
} from "@/lib/rubric";
import {
  OIT_EA_PROJECTS,
  SOURCE_FISCAL_YEAR,
  crosswalkedProjects,
  projectsByPriority,
  teamCounts,
} from "@/lib/oit-ea-portfolio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Requested Projects · UI AI Portfolio",
  description:
    "The unified technology request queue — every requested and suggested project from every origin, scored where reviewed, awaiting a start decision.",
};

interface PipelineSearchParams {
  value?: string;
  focus?: string;
  origin?: string;
}

// The unscored queue's two filter axes. `focus` defaults to the AI
// slice — this is the AI portfolio's page, and the IDEA-form import
// made the full queue mostly general software requests — with
// everything one click away (owner call, 2026-08-04). `origin` composes
// with it. Both are URL params so either view deep-links.
type QueueFocus = "ai" | "all";

function isAiRelevant(req: TechRequest): boolean {
  // Non-IDEA origins are AI-scoped by construction (the ClickUp AI4UI
  // backlog, the site's own AI intakes). IDEA-form rows carry the
  // machine-inferred involvement classification.
  if (req.origin !== "oit-idea") return true;
  return (
    req.inferredAiInvolvement === "ai-core" ||
    req.inferredAiInvolvement === "ai-feature"
  );
}

function pipelineHref(params: {
  value?: string | null;
  focus?: QueueFocus;
  origin?: string | null;
}): string {
  const qs = new URLSearchParams();
  if (params.value) qs.set("value", params.value);
  if (params.focus === "all") qs.set("focus", "all");
  if (params.origin) qs.set("origin", params.origin);
  const s = qs.toString();
  return s ? `/portfolio/pipeline?${s}` : "/portfolio/pipeline";
}

// A registry row paired with its ClickUp rubric enrichment when the
// request originated in the intake backlog. The registry is the truth
// for state (origin, disposition, track); ClickUp supplies the scores.
interface QueueItem {
  req: TechRequest;
  clickup: ScoredRequest | null;
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

function excerpt(text: string, title: string, max = 360): string {
  // Some need statements open by repeating the request title on its own
  // line (the hand-seeded submissions do); drop that line only when it
  // matches, keeping the problem statement intact otherwise.
  const firstBreak = text.indexOf("\n\n");
  const firstLine = (firstBreak === -1 ? text : text.slice(0, firstBreak)).trim();
  const body =
    firstBreak !== -1 && firstLine.toLowerCase() === title.toLowerCase()
      ? text.slice(firstBreak + 2)
      : text;
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, flat.lastIndexOf(" ", max))}…`;
}

function OriginChip({ req }: { req: TechRequest }) {
  return (
    <span className="rounded-full border border-hairline bg-white px-2.5 py-0.5 text-xs text-ink-muted">
      {REQUEST_ORIGIN_LABEL[req.origin]}
    </span>
  );
}

function TrackChip({ track }: { track: string }) {
  if (!isIntakeTrack(track)) return null;
  return (
    <span
      title={INTAKE_TRACK_TITLE[track]}
      className="rounded-full border border-ui-gold/50 bg-ui-gold/10 px-2.5 py-0.5 text-xs font-medium text-brand-black"
    >
      Track {INTAKE_TRACK_SHORT[track]}
    </span>
  );
}

// Machine-inferred chips (IDEA-form requests only). Deliberately
// distinct from human-claim chips: dashed border, muted ink, and the
// model named in every tooltip. The gold TrackChip above renders only
// a triage-assigned track — a suggestion never wears that treatment.
const INFERRED_CHIP =
  "rounded-full border border-dashed border-brand-silver/60 bg-white px-2.5 py-0.5 text-xs text-ink-muted";

function inferredTitle(detail: string, model: string | null): string {
  return `${detail} Inferred from the request text${model ? ` by ${model}` : ""} — a suggestion to speed triage, not a decision.`;
}

function InferredChips({ req }: { req: TechRequest }) {
  return (
    <>
      {!req.track && req.inferredTrack && (
        <span
          title={inferredTitle(
            INTAKE_TRACK_TITLE[req.inferredTrack],
            req.inferenceModel
          )}
          className={INFERRED_CHIP}
        >
          Suggested · Track {INTAKE_TRACK_SHORT[req.inferredTrack]}
        </span>
      )}
      {(req.inferredAiInvolvement === "ai-core" ||
        req.inferredAiInvolvement === "ai-feature") && (
        <span
          title={inferredTitle(
            req.inferredAiInvolvement === "ai-core"
              ? "AI or LLM functionality is the substance of this request."
              : "The requested product includes AI capabilities, but the need itself is not AI.",
            req.inferenceModel
          )}
          className={INFERRED_CHIP}
        >
          {IDEA_AI_INVOLVEMENT_LABEL[req.inferredAiInvolvement]}
        </span>
      )}
      {req.inferredTool && (
        <span
          title={inferredTitle(
            "The commercial product this request names.",
            req.inferenceModel
          )}
          className={INFERRED_CHIP}
        >
          {req.inferredTool}
        </span>
      )}
      {req.inferredDataSignals.map((signal) => (
        <span
          key={signal}
          title={inferredTitle(
            `${IDEA_DATA_SIGNAL_LABEL[signal]} — a data-sensitivity signal for intake triage, not a compliance determination.`,
            req.inferenceModel
          )}
          className="rounded-full border border-dashed border-brand-silver/60 bg-white px-2 py-0.5 text-[10px] text-ink-muted"
        >
          {IDEA_DATA_SIGNAL_SHORT[signal]}
        </span>
      ))}
    </>
  );
}

// OIT's own workflow status — source fact from the IDEA export, not
// an inference, so it wears the solid neutral treatment.
function OitStatusChip({ req }: { req: TechRequest }) {
  if (!req.oitStatus) return null;
  return (
    <span
      title="OIT's workflow status for this request, as of the latest IDEA-form export."
      className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-brand-black"
    >
      OIT: {req.oitStatus}
    </span>
  );
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
                  {[
                    "ClickUp intake",
                    request.unit,
                    request.category,
                    requestDate(request.dateCreated),
                  ]
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

// The ROI case a request carries into triage, from the
// kind-discriminated claims ledger (Migration 021). Quantified claims
// lead with their number; qualitative claims render their verbatim
// evidence — a claim is only as strong as its receipt. Collapsed by
// default so the queue stays scannable, matching the score-table
// disclosure pattern below.
function RoiClaimsBlock({ claims }: { claims: RoiClaim[] }) {
  if (claims.length === 0) return null;
  const claimants = [
    ...new Set(
      claims
        .map((claim) => claim.claimedBy)
        .filter((name): name is string => name !== null)
    ),
  ];
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-sm font-semibold text-brand-black">
        ROI case — {claims.length} claim{claims.length === 1 ? "" : "s"}
        {claimants.length > 0 && ` · ${claimants.join(", ")}`}
      </summary>
      <ul className="mt-3 max-w-3xl space-y-4">
        {claims.map((claim) => (
          <li key={claim.id}>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-brand-black">
                {roiDimensionLabel(claim.dimension)}
              </span>
              {claim.kind === "quantified" && claim.annualValueUsd !== null && (
                <span className="text-sm font-bold tabular-nums text-brand-black">
                  ${claim.annualValueUsd.toLocaleString("en-US")}/yr
                </span>
              )}
              {claim.kind === "quantified" && claim.fte !== null && (
                <span className="text-sm font-bold tabular-nums text-brand-black">
                  {claim.fte} FTE
                </span>
              )}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              {claim.basis}
            </p>
            {claim.kind === "qualitative" && (
              <p className="mt-1 text-xs italic leading-relaxed text-ink-subtle">
                {claim.evidence}
              </p>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

// Open requests that have not yet been rubric-scored — site submissions,
// direct entries, and survey-derived candidates. The registry knows
// them; triage scoring is what they are waiting on.
function UnscoredList({
  items,
  claimsByRequest,
}: {
  items: QueueItem[];
  claimsByRequest: Map<string, RoiClaim[]>;
}) {
  return (
    <ul className="divide-y divide-hairline border-y border-hairline">
      {items.map(({ req }) => (
        <li
          key={req.id}
          className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_9rem]"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-base font-bold text-brand-black">
                {req.title}
              </h3>
              <p className="text-xs text-ink-subtle">
                {[
                  req.requestorName,
                  req.requestorUnit,
                  requestDate(req.receivedAt),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            {req.needStatement && (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
                {excerpt(req.needStatement, req.title)}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <OriginChip req={req} />
              <OitStatusChip req={req} />
              {req.track && <TrackChip track={req.track} />}
              <InferredChips req={req} />
              {req.submissionTier !== null && (
                <span
                  title="Submit-a-Project assessment tier (1–4)"
                  className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-brand-black"
                >
                  Assessment tier {req.submissionTier}
                </span>
              )}
              {req.submissionId && (
                <Link
                  href={`/intake/${req.submissionId}`}
                  className="rounded-full border border-hairline bg-white px-2.5 py-0.5 text-xs text-ink-muted hover:border-brand-silver/40 hover:text-brand-black"
                >
                  View submission →
                </Link>
              )}
            </div>
            <RoiClaimsBlock claims={claimsByRequest.get(req.id) ?? []} />
          </div>
          <div className="md:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-silver">
              Priority score
            </p>
            <p className="mt-1 text-sm font-semibold text-ink-muted">
              Awaiting triage scoring
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CompactRequestList({
  items,
  slugByName,
}: {
  items: QueueItem[];
  slugByName: Map<string, string>;
}) {
  return (
    <ul className="space-y-1.5">
      {items.map(({ req, clickup }) => {
        const slug = slugByName.get(req.title.toLowerCase());
        const unit = clickup?.unit ?? req.requestorUnit;
        return (
          <li
            key={req.id}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm"
          >
            <span className="text-ui-charcoal">
              {slug ? (
                <Link
                  href={`/portfolio/${slug}`}
                  className="font-medium text-brand-black hover:underline"
                >
                  {req.title}
                </Link>
              ) : (
                req.title
              )}
              {unit && (
                <span className="text-xs text-ink-subtle"> · {unit}</span>
              )}
            </span>
            {req.weightedScore !== null && (
              <span className="text-xs tabular-nums text-ink-muted">
                scored {Math.round(req.weightedScore * 10) / 10}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Standing context for anything in this queue that would route to OIT.
// Deliberately makes no per-request claim: matching a free-text request
// against an OIT row on subject matter alone is the kind of inference
// the crosswalk in lib/oit-ea-portfolio.ts exists to prevent. What the
// reader gets is the shape of OIT's committed FY load, named by team and
// TPM, so a collision is something they can see rather than be told.
function OitCommitments() {
  const teams = teamCounts();
  const critical = projectsByPriority("Critical");
  const shared = crosswalkedProjects();

  return (
    <section className="space-y-4 border-t border-hairline pt-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Standing context
        </p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-brand-black">
          What OIT has already committed to
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-muted">
          This queue produces new asks. OIT&apos;s Enterprise Applications
          group is already carrying {OIT_EA_PROJECTS.length} committed
          efforts in {SOURCE_FISCAL_YEAR}, {critical.length} of them
          Critical. A request routed to OIT lands on top of that load, not
          into open capacity — so the queue is worth reading against it.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="rounded-xl border border-hairline bg-surface-alt p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
            Committed efforts by owning team
          </p>
          <dl className="mt-3 space-y-2">
            {teams.map(({ team, count }) => (
              <div key={team} className="flex items-baseline gap-3">
                <dt className="flex-1 text-sm text-ui-charcoal">{team}</dt>
                <dd className="text-sm font-semibold tabular-nums text-brand-black">
                  {count}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-hairline bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
            The Critical commitments
          </p>
          <ul className="mt-3 space-y-2">
            {critical.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
              >
                <span className="text-sm font-medium text-brand-black">
                  {row.name}
                </span>
                <span className="text-xs text-ink-subtle">
                  {row.tpmOrManager}
                </span>
                {row.portfolioSlug && (
                  <Link
                    href={`/portfolio/${row.portfolioSlug}`}
                    className="text-xs font-medium text-brand-clearwater"
                  >
                    in our inventory
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="max-w-3xl text-xs leading-relaxed text-ink-subtle">
        No request in this queue is matched to an OIT row — a shared subject
        is not evidence of shared work. The {shared.length} efforts the two
        inventories genuinely share are already active projects, not
        requests.{" "}
        <Link href="/coordination/oit-portfolio">
          See OIT&apos;s full {SOURCE_FISCAL_YEAR} portfolio
        </Link>{" "}
        for all {OIT_EA_PROJECTS.length} rows and how they were crosswalked.
      </p>
    </section>
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
  const focus: QueueFocus = params.focus?.trim() === "all" ? "all" : "ai";
  const [techRequests, scored, lastSync, apps, claimsByRequest] =
    await Promise.all([
      listTechRequests(),
      listScoredRequests(),
      getLastSync(),
      listApplications({ audience: "public" }).catch(() => []),
      roiClaimsByRequest().catch(() => new Map<string, RoiClaim[]>()),
    ]);

  const scoredByTask = new Map(scored.map((r) => [r.taskId, r]));
  const queue: QueueItem[] = techRequests.map((req) => ({
    req,
    clickup: req.clickupTaskId
      ? (scoredByTask.get(req.clickupTaskId) ?? null)
      : null,
  }));

  const inReview = queue.filter(({ req }) => req.disposition === "open");
  const promoted = queue.filter(({ req }) => req.disposition === "approved");
  const became = queue.filter(
    ({ req }) => req.disposition === "converted-to-project"
  );
  const routed = queue.filter(
    ({ req }) => req.disposition === "routed-to-existing"
  );
  const notPursued = queue.filter(({ req }) =>
    ["denied", "withdrawn", "closed", "merged"].includes(req.disposition)
  );

  const scoredOpen = inReview.filter((item) => item.clickup !== null);
  const unscoredOpen = inReview.filter((item) => item.clickup === null);

  // Unscored-queue filters. Each axis's chip counts are computed inside
  // the other axis's current selection so the numbers always describe
  // what clicking would show.
  const unscoredOrigins = [...new Set(unscoredOpen.map(({ req }) => req.origin))]
    .sort((a, b) =>
      REQUEST_ORIGIN_LABEL[a].localeCompare(REQUEST_ORIGIN_LABEL[b])
    );
  const selectedOrigin: RequestOrigin | null = unscoredOrigins.includes(
    params.origin?.trim() as RequestOrigin
  )
    ? (params.origin!.trim() as RequestOrigin)
    : null;
  const inFocus = (item: QueueItem) =>
    focus === "all" || isAiRelevant(item.req);
  const inOrigin = (item: QueueItem) =>
    selectedOrigin === null || item.req.origin === selectedOrigin;
  const filteredUnscored = unscoredOpen.filter(
    (item) => inFocus(item) && inOrigin(item)
  );
  const aiCount = unscoredOpen.filter(
    (item) => inOrigin(item) && isAiRelevant(item.req)
  ).length;
  const allCount = unscoredOpen.filter(inOrigin).length;
  const inferenceModel =
    unscoredOpen.find(({ req }) => req.inferenceModel !== null)?.req
      .inferenceModel ?? null;
  const sortedScoredOpen = sortPending(
    scoredOpen.map((item) => item.clickup!),
    selectedLens
  );
  const financialPotentialCount = scoredOpen.filter(
    (item) => (item.clickup!.rubric.a2 ?? 0) >= 3
  ).length;
  const originCount = new Set(techRequests.map(({ origin }) => origin)).size;

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
          Every technology request the registry knows about, from every
          origin — the OIT IDEA form backlog, the ClickUp intake backlog,
          Submit-a-Project assessments, requests captured directly from
          working sessions and email, and TDX once OIT wiring lands — in
          one queue per the Unified Technology Request process (ADR 0005). Requests from
          the intake backlog carry an 11-criterion prioritization score
          from Colin Addington: strategic impact (A1–A4), feasibility and
          effort (B1–B4), and urgency and buy-in (C1–C3). Newer arrivals
          hold in the queue unscored until triage. This page is the
          record — there is no separate internal copy.
        </p>
        {techRequests.length > 0 && (
          <p className="mt-5 flex flex-wrap items-baseline gap-x-2 text-sm text-ink-muted">
            <span>
              <span className="font-bold tabular-nums text-brand-black">
                {techRequests.length}
              </span>{" "}
              registered across {originCount} origin
              {originCount === 1 ? "" : "s"}
            </span>
            <span aria-hidden className="text-brand-silver">
              ·
            </span>
            <span>
              <span className="font-bold tabular-nums text-brand-black">
                {inReview.length}
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

      {techRequests.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface-alt p-8 text-center">
          <p className="text-sm font-medium text-ink-muted">
            No requests are registered yet. This view is the permanent
            home for intake requests before work starts — run Migration
            018 and a ClickUp sync to backfill the existing backlog.
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
                In review — scored
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
                href={pipelineHref({ focus, origin: selectedOrigin })}
                aria-current={!selectedLens ? "page" : undefined}
                className={`unstyled inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  !selectedLens
                    ? "border-ui-gold bg-ui-gold/15 text-brand-black"
                    : "border-hairline bg-white text-ink-muted hover:border-brand-silver/40 hover:bg-surface-alt"
                }`}
              >
                Overall priority
                <span className="rounded-full bg-surface-alt px-1.5 py-0 text-[10px] font-semibold text-ink-subtle">
                  {scoredOpen.length}
                </span>
              </Link>
              {REQUEST_VALUE_LENSES.map((lens) => {
                const count = scoredOpen.filter(
                  (item) => scoreForLens(item.clickup!, lens) !== null
                ).length;
                const active = selectedLens?.value === lens.value;
                return (
                  <Link
                    key={lens.value}
                    href={pipelineHref({
                      value: lens.value,
                      focus,
                      origin: selectedOrigin,
                    })}
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
            {scoredOpen.length > 0 ? (
              <>
                <p className="text-xs font-medium text-ink-subtle">
                  {selectedLens
                    ? `Sorted by ${selectedLens.label.toLowerCase()}, then overall priority.`
                    : "Sorted by overall priority score."}
                </p>
                <PendingExplorer
                  requests={sortedScoredOpen}
                  selectedLens={selectedLens}
                />
                <details className="group pt-2">
                  <summary className="cursor-pointer text-sm font-semibold text-brand-black">
                    Show the complete 11-criterion score table
                  </summary>
                  <div className="mt-4">
                    <DetailedScoreTable requests={sortedScoredOpen} />
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
                No scored requests are currently awaiting review.
              </p>
            )}
          </section>

          {unscoredOpen.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-brand-black">
                  In review — awaiting scoring
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
                  Registered requests and suggestions that have not yet
                  been through rubric scoring — the OIT IDEA form backlog,
                  site submissions, direct entries, and candidate projects
                  derived from the{" "}
                  <Link
                    href="/coordination/operational-excellence"
                    className="font-medium text-brand-black hover:underline"
                  >
                    Operational Excellence survey
                  </Link>
                  . Triage assigns each a track and a score. The default
                  view is the AI-relevant slice; the full queue is one
                  click away.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { key: "ai", label: "AI-relevant", count: aiCount },
                    { key: "all", label: "Everything", count: allCount },
                  ] as const
                ).map((chip) => {
                  const active = focus === chip.key;
                  return (
                    <Link
                      key={chip.key}
                      href={pipelineHref({
                        value: selectedValue,
                        focus: chip.key,
                        origin: selectedOrigin,
                      })}
                      aria-current={active ? "page" : undefined}
                      className={`unstyled inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "border-ui-gold bg-ui-gold/15 text-brand-black"
                          : "border-hairline bg-white text-ink-muted hover:border-brand-silver/40 hover:bg-surface-alt"
                      }`}
                    >
                      {chip.label}
                      <span
                        className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
                          active
                            ? "bg-brand-black/10 text-brand-black"
                            : "bg-surface-alt text-ink-subtle"
                        }`}
                      >
                        {chip.count}
                      </span>
                    </Link>
                  );
                })}
                <span aria-hidden className="mx-1 self-center text-brand-silver">
                  ·
                </span>
                {[null, ...unscoredOrigins].map((origin) => {
                  const active = selectedOrigin === origin;
                  const count =
                    origin === null
                      ? unscoredOpen.filter(inFocus).length
                      : unscoredOpen.filter(
                          (item) => inFocus(item) && item.req.origin === origin
                        ).length;
                  return (
                    <Link
                      key={origin ?? "all-origins"}
                      href={pipelineHref({
                        value: selectedValue,
                        focus,
                        origin,
                      })}
                      aria-current={active ? "page" : undefined}
                      className={`unstyled inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "border-ui-gold bg-ui-gold/15 text-brand-black"
                          : "border-hairline bg-white text-ink-muted hover:border-brand-silver/40 hover:bg-surface-alt"
                      }`}
                    >
                      {origin === null
                        ? "All origins"
                        : REQUEST_ORIGIN_LABEL[origin]}
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
              {inferenceModel && (
                <p className="max-w-3xl text-xs leading-relaxed text-ink-subtle">
                  Dashed chips on IDEA-form requests — suggested track, AI
                  relevance, named product, data-sensitivity flags — are
                  inferred from the request text by {inferenceModel} to
                  speed triage. They are suggestions, not decisions;
                  triage&apos;s track assignment renders in gold when made.
                </p>
              )}
              {filteredUnscored.length > 0 ? (
                <UnscoredList
                  items={[...filteredUnscored].sort((a, b) =>
                    b.req.receivedAt.localeCompare(a.req.receivedAt)
                  )}
                  claimsByRequest={claimsByRequest}
                />
              ) : (
                <p className="border-y border-hairline py-6 text-sm text-ink-muted">
                  No unscored requests match this view —{" "}
                  <Link
                    href={pipelineHref({ value: selectedValue })}
                    className="font-medium text-brand-black hover:underline"
                  >
                    reset the filters
                  </Link>
                  .
                </p>
              )}
            </section>
          )}

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
              <CompactRequestList items={promoted} slugByName={slugByName} />
            </section>
          )}

          {became.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-black tracking-tight text-brand-black">
                  Completed
                </h2>
                <span className="text-sm text-ink-subtle">{became.length}</span>
              </div>
              <CompactRequestList items={became} slugByName={slugByName} />
            </section>
          )}

          {routed.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-black tracking-tight text-brand-black">
                  Routed to an existing solution
                </h2>
                <span className="text-sm text-ink-subtle">{routed.length}</span>
              </div>
              <CompactRequestList items={routed} slugByName={slugByName} />
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
              <CompactRequestList items={notPursued} slugByName={slugByName} />
            </section>
          )}
        </>
      )}

      <OitCommitments />

      <footer className="space-y-2 border-t border-hairline pt-6">
        {lastSync && <SyncFreshness syncedAt={lastSync.finishedAt} />}
        <p className="text-xs text-brand-silver">
          Site submissions and direct entries register immediately; the
          ClickUp intake backlog refreshes on sync. Have a process that
          could use this treatment?{" "}
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
