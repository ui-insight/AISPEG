// Eval metrics for the conversational agent — see Epic #107, Slice #112.
//
// Three axes:
//   - tool-selection accuracy: did the expected tool(s) appear in toolCalls?
//   - citation accuracy: did the expected citation URL(s) appear in citations?
//   - refusal correctness: when shouldRefuse, was the loop empty + the
//     response phrased as a refusal?
//
// Set membership (subset, not strict equality) — the model is allowed to
// invoke an extra tool or surface an extra citation as long as the
// expected ones are present. This keeps the harness stable as new tools
// land in slices #110 + #115.

import type { AgentResponse } from "@/lib/agent/loop";

export interface GoldenCase {
  id: string;
  question: string;
  expectedToolCalls?: string[];
  expectedCitations?: string[];
  shouldRefuse?: boolean;
  rationale?: string;
  tags?: string[];
}

export interface GoldenSet {
  description?: string;
  cases: GoldenCase[];
}

export interface CaseScore {
  id: string;
  question: string;
  toolSelection: { applicable: boolean; pass: boolean; missing: string[] };
  citation: { applicable: boolean; pass: boolean; missing: string[] };
  refusal: { applicable: boolean; pass: boolean; reason?: string };
  overallPass: boolean;
  rawResponse: AgentResponse | null;
  error?: string;
}

export interface AggregateMetrics {
  total: number;
  errors: number;
  toolSelection: { applicable: number; passed: number; rate: number };
  citation: { applicable: number; passed: number; rate: number };
  refusal: { applicable: number; passed: number; rate: number };
  overall: { passed: number; rate: number };
}

// Patterns the strict-citation system prompt steers the model toward when
// refusing. We accept any of these as evidence of an intentional refusal
// rather than a hallucinated answer. Loose enough to allow rephrasing.
const REFUSAL_PATTERNS = [
  /don'?t have data/i,
  /no data on/i,
  /can'?t (help|answer)/i,
  /not (something|able) (i|to) /i,
  /outside (my|the) scope/i,
  /unable to (answer|help)/i,
];

function looksLikeRefusal(text: string): boolean {
  return REFUSAL_PATTERNS.some((re) => re.test(text));
}

export function scoreCase(
  c: GoldenCase,
  result: AgentResponse | null,
  error?: string
): CaseScore {
  const score: CaseScore = {
    id: c.id,
    question: c.question,
    toolSelection: { applicable: false, pass: true, missing: [] },
    citation: { applicable: false, pass: true, missing: [] },
    refusal: { applicable: false, pass: true },
    overallPass: false,
    rawResponse: result,
    error,
  };

  if (error || !result) {
    score.overallPass = false;
    return score;
  }

  const toolNames = new Set(result.toolCalls.map((t) => t.name));
  const citationUrls = new Set(result.citations.map((c) => c.url));

  if (c.shouldRefuse) {
    score.refusal.applicable = true;
    // The strict-citation contract is about not hallucinating, not about
    // avoiding tool calls. An agent that calls search_portfolio for an
    // out-of-scope query, gets an empty result, and then refuses is
    // doing the right thing — it just wastes a round trip. Score on
    // refusal text alone; surface the (unnecessary) tool calls in the
    // FAIL output for diagnostic value when the case actually fails.
    const refusalText = looksLikeRefusal(result.response);
    score.refusal.pass = refusalText;
    if (!refusalText) {
      const calledNote =
        result.toolCalls.length > 0
          ? ` (called ${[...toolNames].join(", ")})`
          : "";
      score.refusal.reason = `response did not match a refusal pattern${calledNote}: ${result.response.slice(0, 140)}`;
    }
  }

  if (c.expectedToolCalls && c.expectedToolCalls.length > 0) {
    score.toolSelection.applicable = true;
    score.toolSelection.missing = c.expectedToolCalls.filter(
      (t) => !toolNames.has(t)
    );
    score.toolSelection.pass = score.toolSelection.missing.length === 0;
  }

  if (c.expectedCitations && c.expectedCitations.length > 0) {
    score.citation.applicable = true;
    score.citation.missing = c.expectedCitations.filter(
      (u) => !citationUrls.has(u)
    );
    score.citation.pass = score.citation.missing.length === 0;
  }

  // Overall pass = all applicable axes pass.
  const checks = [
    score.refusal.applicable ? score.refusal.pass : null,
    score.toolSelection.applicable ? score.toolSelection.pass : null,
    score.citation.applicable ? score.citation.pass : null,
  ].filter((v): v is boolean => v !== null);
  score.overallPass = checks.length > 0 && checks.every((v) => v);

  return score;
}

export function aggregate(scores: CaseScore[]): AggregateMetrics {
  const total = scores.length;
  const errors = scores.filter((s) => !!s.error).length;

  const tsApplicable = scores.filter((s) => s.toolSelection.applicable);
  const cApplicable = scores.filter((s) => s.citation.applicable);
  const rApplicable = scores.filter((s) => s.refusal.applicable);

  const tsPassed = tsApplicable.filter((s) => s.toolSelection.pass).length;
  const cPassed = cApplicable.filter((s) => s.citation.pass).length;
  const rPassed = rApplicable.filter((s) => s.refusal.pass).length;
  const overallPassed = scores.filter((s) => s.overallPass).length;

  const safeRate = (n: number, d: number) => (d === 0 ? 1 : n / d);

  return {
    total,
    errors,
    toolSelection: {
      applicable: tsApplicable.length,
      passed: tsPassed,
      rate: safeRate(tsPassed, tsApplicable.length),
    },
    citation: {
      applicable: cApplicable.length,
      passed: cPassed,
      rate: safeRate(cPassed, cApplicable.length),
    },
    refusal: {
      applicable: rApplicable.length,
      passed: rPassed,
      rate: safeRate(rPassed, rApplicable.length),
    },
    overall: {
      passed: overallPassed,
      rate: safeRate(overallPassed, total),
    },
  };
}
