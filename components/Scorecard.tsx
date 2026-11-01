// Shared presentation for the Build Evaluation Scorecard surfaces
// (/portfolio/scorecard and its subject detail pages). Server-only:
// no state, no handlers.

import {
  DATA_CONFIDENCE_LABEL,
  DIRECTION_LABEL,
  GATE_STATUS_LABEL,
  SCORE_GUIDE,
  formatUsd,
  scoreBand,
  scorecardField,
  type DataConfidence,
  type GateStatus,
  type NetFiveYear,
  type ScoredBucket,
} from "@/lib/build-scorecard";
import { OPERATIONAL_LABEL } from "@/lib/portfolio";
import { REQUEST_DISPOSITION_LABEL, REQUEST_ORIGIN_LABEL } from "@/lib/utr";
import type { ScorecardSubject } from "@/lib/scorecard-data";

const NEUTRAL_CHIP =
  "inline-flex whitespace-nowrap rounded-full border border-hairline bg-surface-alt px-2 py-0.5 text-[10px] font-medium text-ink-muted";

export function SubjectKindChip({ subject }: { subject: ScorecardSubject }) {
  const label =
    subject.kind === "project"
      ? `Project · ${subject.status ? OPERATIONAL_LABEL[subject.status] : "not in inventory"}`
      : `Request · ${REQUEST_ORIGIN_LABEL[subject.origin]} · ${REQUEST_DISPOSITION_LABEL[subject.disposition]}`;
  return <span className={NEUTRAL_CHIP}>{label}</span>;
}

// Gate status reads as text first. Only Status Unconfirmed takes a
// color — the codebase's amber caution signal — because it is the one
// gate answer that asks someone to go check something.
const GATE_CLASS: Record<GateStatus, string> = {
  "open-candidate": NEUTRAL_CHIP,
  "status-unconfirmed":
    "inline-flex whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700",
  "locked-constrained":
    "inline-flex whitespace-nowrap rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600",
};

export function GateChip({ gate }: { gate: GateStatus | null }) {
  if (!gate) return <span className="text-xs text-ink-subtle">–</span>;
  return <span className={GATE_CLASS[gate]}>{GATE_STATUS_LABEL[gate]}</span>;
}

export function ConfidenceText({ confidence }: { confidence: DataConfidence | null }) {
  if (!confidence) return <span className="text-ink-subtle">–</span>;
  return (
    <span
      title={scorecardField("financial_data_confidence").help}
      className={
        confidence === "observed" || confidence === "estimated"
          ? "text-brand-black"
          : "text-ink-subtle"
      }
    >
      {DATA_CONFIDENCE_LABEL[confidence]}
    </span>
  );
}

/** Net 5-Year $, with the partial-input marker the workbook lacks. */
export function NetFiveYearValue({ net }: { net: NetFiveYear }) {
  if (net.total === null) {
    return (
      <span
        className="text-ink-subtle"
        title="Not computable — no financial inputs, or savings with no start year."
      >
        –
      </span>
    );
  }
  const partial = net.missingInputs.length > 0;
  return (
    <span
      className={`tabular-nums ${net.total < 0 ? "text-ink-muted" : "text-brand-black"}`}
      title={
        partial
          ? `Partial: ${net.missingInputs.map((k) => scorecardField(k).label).join(", ")} unknown, counted as $0.`
          : undefined
      }
    >
      {formatUsd(net.total)}
      {partial && <span className="ml-0.5 text-ink-subtle">*</span>}
    </span>
  );
}

/**
 * A 1–10 bucket score with its band. The number carries no color: the
 * direction differs by bucket (Risk 10 = worst), so the band name does
 * the reading and the header states the direction.
 */
export function ScoreValue({
  bucket,
  score,
  showBand = false,
}: {
  bucket: ScoredBucket;
  score: number | null;
  showBand?: boolean;
}) {
  if (score === null) {
    return <span className="text-ink-subtle">–</span>;
  }
  const band = scoreBand(bucket, score);
  const guide = SCORE_GUIDE.find((g) => g.bucket === bucket)!;
  return (
    <span
      className="tabular-nums"
      title={band ? `${band.band} (${DIRECTION_LABEL[guide.direction]}): ${band.description}` : undefined}
    >
      <span className="font-semibold text-brand-black">{score}</span>
      {showBand && band && <span className="ml-1.5 text-ink-muted">{band.band}</span>}
    </span>
  );
}
