"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  quizSteps,
  calculateScore,
  getTierForScore,
  generateSummary,
  DEPARTMENTS,
  type Answers,
  type QuizStep,
  type TierRecommendation,
  type ContactInfo,
} from "@/lib/builder-guide-data";
import { intakeConfig, statusUrlFor } from "@/lib/intake-config";
import { Callout } from "@/components/Callout";

// Subset of the similarity engine's SimilarityResult shape — the wizard
// only renders name + status + overlap counts, not the full overlap detail.
interface SimilarMatch {
  application_id: string;
  application_name: string;
  application_status: string;
  application_department: string | null;
  score: number;
  overlap_details: {
    sensitivity: string[];
    integrations: string[];
    data_sources: string[];
    university_systems: string[];
    output_types: string[];
    complexity_match: boolean;
    userbase_match: boolean;
    auth_match: boolean;
  };
}

// ============================================
// Types
// ============================================

interface IdeaAnalysis {
  summary: string;
  suggested_sensitivity: string[];
  suggested_complexity: string;
  suggested_userbase: string;
  suggested_auth: string;
  suggested_integrations: string[];
  suggested_data_sources: string[];
  suggested_university_systems: string[];
  suggested_output_types: string[];
  clarifying_questions: string[];
  similar_existing_tools: string[];
  risks_and_considerations: string[];
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

// ============================================
// Sub-components
// ============================================

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>
          Step {current + 1} of {total}
        </span>
        <span>{quizSteps[current]?.title}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-ui-gold transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TextStep({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={step.placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold resize-none"
      />
    </div>
  );
}

function SingleChoiceStep({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-3">
      {step.options?.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.label)}
          className={`w-full rounded-xl border p-4 text-left transition-colors ${
            value === opt.label
              ? "border-ui-gold bg-ui-gold/10 ring-1 ring-ui-gold"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                value === opt.label
                  ? "border-ui-gold bg-ui-gold"
                  : "border-gray-300"
              }`}
            >
              {value === opt.label && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-ui-charcoal">{opt.label}</p>
              {opt.description && (
                <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function MultiChoiceStep({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (label: string) => {
    if (value.includes(label)) {
      onChange(value.filter((v) => v !== label));
    } else {
      onChange([...value, label]);
    }
  };

  return (
    <div className="space-y-3">
      {step.options?.map((opt) => {
        const selected = value.includes(opt.label);
        return (
          <button
            key={opt.label}
            onClick={() => toggle(opt.label)}
            className={`w-full rounded-xl border p-4 text-left transition-colors ${
              selected
                ? "border-ui-gold bg-ui-gold/10 ring-1 ring-ui-gold"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                  selected
                    ? "border-ui-gold bg-ui-gold"
                    : "border-gray-300"
                }`}
              >
                {selected && (
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-ui-charcoal">{opt.label}</p>
                {opt.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TierBadge({ tier }: { tier: TierRecommendation }) {
  const colors: Record<string, string> = {
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    red: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${colors[tier.color]}`}>
      Tier {tier.tier}: {tier.label}
    </span>
  );
}

function ScoreBreakdown({ answers }: { answers: Answers }) {
  const rows: { label: string; score: number }[] = [];

  for (const step of quizSteps) {
    if (step.type === "text" || !step.options) continue;
    const answer = answers[step.id];
    let stepScore = 0;

    if (step.type === "multi" && Array.isArray(answer)) {
      for (const selected of answer) {
        const opt = step.options.find((o) => o.label === selected);
        if (opt) stepScore += opt.points;
      }
    } else if (step.type === "single" && typeof answer === "string") {
      const opt = step.options.find((o) => o.label === answer);
      if (opt) stepScore += opt.points;
    }

    rows.push({ label: step.title, score: stepScore });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Score Breakdown
      </h3>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{row.label}</span>
            <span className="font-mono font-medium text-ui-charcoal">
              {row.score} pts
            </span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-sm font-semibold">
          <span className="text-ui-charcoal">Total</span>
          <span className="font-mono text-ui-charcoal">
            {rows.reduce((sum, r) => sum + r.score, 0)} pts
          </span>
        </div>
      </div>
    </div>
  );
}

// ── AI Analysis Panel ────────────────────────────────────────

function AiAnalysisPanel({
  analysis,
  analyzing,
  error,
  onAnalyze,
  onApplySuggestions,
}: {
  analysis: IdeaAnalysis | null;
  analyzing: boolean;
  error: string | null;
  onAnalyze: () => void;
  onApplySuggestions: () => void;
}) {
  if (!analysis && !analyzing && !error) {
    return (
      <div className="mt-4 rounded-xl border border-hairline bg-surface-alt p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-black">
              Pre-fill the assessment from a description
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Optional. The on-prem MindRouter LLM reads your idea and proposes
              answers to the next 8 steps. You review and edit every answer.
            </p>
          </div>
          <button
            onClick={onAnalyze}
            className="rounded-lg bg-brand-black px-4 py-2 text-sm font-medium text-white hover:bg-brand-black/90 transition-colors"
          >
            Pre-fill
          </button>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="mt-4 rounded-xl border border-hairline bg-surface-alt p-5">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-hairline border-t-brand-black" />
          <p className="text-sm text-ink-muted">
            Reading your idea with MindRouter (on-prem LLM)…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm text-orange-700">{error}</p>
        <button
          onClick={onAnalyze}
          className="mt-2 text-xs font-medium text-orange-600 hover:text-orange-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="mt-4 rounded-xl border border-hairline bg-surface-alt p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-clearwater">
            Pre-fill suggestions
          </p>
          <p className="mt-0.5 text-xs text-ink-subtle">via MindRouter (on-prem)</p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-hairline bg-white p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Summary</p>
        <p className="mt-1 text-sm text-brand-black">{analysis.summary}</p>
      </div>

      {/* Clarifying Questions */}
      {analysis.clarifying_questions.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-clearwater">
            Questions to consider
          </p>
          <ul className="mt-2 space-y-1.5">
            {analysis.clarifying_questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-clearwater" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Similar Tools */}
      {analysis.similar_existing_tools.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-clearwater">
            Similar existing tools
          </p>
          <ul className="mt-2 space-y-1.5">
            {analysis.similar_existing_tools.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-clearwater" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {analysis.risks_and_considerations.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-orange-700">
            Risks &amp; considerations
          </p>
          <ul className="mt-2 space-y-1.5">
            {analysis.risks_and_considerations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={onApplySuggestions}
        className="w-full rounded-lg bg-brand-black px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-black/90 transition-colors"
      >
        Apply suggestions to the quiz
      </button>
      <p className="text-center text-xs text-ink-subtle">
        You can review and modify every answer before submitting.
      </p>
    </div>
  );
}

// ── AI Chat Panel ────────────────────────────────────────────

function AiChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.status === 503) {
        setUnavailable(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "AI chat is not yet configured. The MindRouter API key needs to be set up by an administrator.",
          },
        ]);
      } else if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-brand-black px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-brand-black/90 transition-colors"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Ask a question
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[480px] w-96 flex-col rounded-2xl border border-hairline bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-brand-black px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Ask a question</p>
          <p className="text-xs text-white/60">MindRouter (on-prem)</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-brand-black">What can we help with?</p>
            <p className="mt-1 text-xs text-ink-muted">
              Ask about data sensitivity, tech stacks, university systems, or anything about your project idea.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-brand-black text-white"
                  : "bg-surface-alt text-brand-black"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-surface-alt px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-subtle" style={{ animationDelay: "0ms" }} />
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-subtle" style={{ animationDelay: "200ms" }} />
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-subtle" style={{ animationDelay: "400ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={unavailable ? "Assistant not configured..." : "Ask a question..."}
            disabled={unavailable}
            className="flex-1 rounded-lg border border-hairline px-3 py-2 text-sm focus:border-brand-black focus:outline-none focus:ring-1 focus:ring-brand-black disabled:bg-surface-alt disabled:text-ink-subtle"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || unavailable}
            className="rounded-lg bg-brand-black p-2 text-white hover:bg-brand-black/90 disabled:bg-hairline disabled:text-ink-subtle transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Contact Info Step ────────────────────────────────────────

function ContactInfoStep({
  contact,
  onChange,
  errors,
}: {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
  errors: Partial<Record<keyof ContactInfo, string>>;
}) {
  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={contact.name}
          onChange={(e) => onChange({ ...contact, name: e.target.value })}
          placeholder="e.g., Jane Smith"
          className={`w-full rounded-xl border ${
            errors.name ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-ui-gold focus:ring-ui-gold"
          } bg-white p-3 text-sm shadow-sm focus:outline-none focus:ring-1`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={contact.email}
          onChange={(e) => onChange({ ...contact, email: e.target.value })}
          placeholder="e.g., jsmith@uidaho.edu"
          className={`w-full rounded-xl border ${
            errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-ui-gold focus:ring-ui-gold"
          } bg-white p-3 text-sm shadow-sm focus:outline-none focus:ring-1`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Department */}
      <div>
        <label htmlFor="contact-dept" className="block text-sm font-medium text-gray-700 mb-1">
          Department / College <span className="text-red-500">*</span>
        </label>
        <select
          id="contact-dept"
          value={contact.department}
          onChange={(e) => onChange({ ...contact, department: e.target.value })}
          className={`w-full rounded-xl border ${
            errors.department ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-ui-gold focus:ring-ui-gold"
          } bg-white p-3 text-sm shadow-sm focus:outline-none focus:ring-1`}
        >
          <option value="">Select your department...</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
      </div>
    </div>
  );
}

// ── Similar Matches Callout ──────────────────────────────────
//
// Renders the live similarity matches from /api/similarity/preview.
// Shown both on the review step (with a "consider talking to..." nudge)
// and on the results page (as a "related work" section).

function SimilarMatchesCallout({
  matches,
  loading,
  context,
}: {
  matches: SimilarMatch[];
  loading: boolean;
  context: "review" | "results";
}) {
  if (loading || matches.length === 0) return null;

  const headline =
    context === "review"
      ? "Similar projects already in the portfolio"
      : "Related work in the portfolio";
  const sub =
    context === "review"
      ? "These projects share data sources, integrations, or scope with your idea. Worth a quick conversation before submitting — the portfolio owner may already be solving your problem."
      : "These projects share dimensions with what you described. Submitter and IIDS reviewer will both see them.";

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">
      <p className="text-sm font-semibold text-blue-900">{headline}</p>
      <p className="mt-1 text-xs text-blue-900/80 leading-relaxed">{sub}</p>
      <ul className="mt-3 space-y-2">
        {matches.map((m) => {
          const overlapBits: string[] = [];
          if (m.overlap_details.data_sources.length > 0)
            overlapBits.push(
              `${m.overlap_details.data_sources.length} data source${m.overlap_details.data_sources.length > 1 ? "s" : ""}`
            );
          if (m.overlap_details.university_systems.length > 0)
            overlapBits.push(
              `${m.overlap_details.university_systems.length} UI system${m.overlap_details.university_systems.length > 1 ? "s" : ""}`
            );
          if (m.overlap_details.integrations.length > 0)
            overlapBits.push(
              `${m.overlap_details.integrations.length} integration${m.overlap_details.integrations.length > 1 ? "s" : ""}`
            );
          if (m.overlap_details.sensitivity.length > 0)
            overlapBits.push(`shared sensitivity class`);
          return (
            <li
              key={m.application_id}
              className="rounded-lg border border-blue-100 bg-white px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-ui-charcoal">
                  {m.application_name}
                </p>
                <span className="text-xs text-blue-900/70">
                  {Math.round(m.score * 100)}% match
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-600">
                {m.application_department ?? "Unassigned home unit"} ·{" "}
                {m.application_status}
              </p>
              {overlapBits.length > 0 && (
                <p className="mt-1 text-xs text-blue-900/80">
                  Overlap: {overlapBits.join(" · ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Results View ─────────────────────────────────────────────

function ResultsView({
  answers,
  onStartOver,
  submissionId,
  similarMatches,
}: {
  answers: Answers;
  onStartOver: () => void;
  submissionId: string | null;
  similarMatches: SimilarMatch[];
}) {
  const score = calculateScore(answers);
  const tier = getTierForScore(score);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const summary = generateSummary(answers, score, tier);
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const owner = intakeConfig.intakeOwner;
  const statusUrl = submissionId ? statusUrlFor(submissionId) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-ui-charcoal">Your Assessment Results</h2>
        <div className="mt-3">
          <TierBadge tier={tier} />
        </div>
        <p className="mt-4 max-w-xl mx-auto text-sm text-gray-600">{tier.description}</p>
      </div>

      {/* What happens next — named human + SLA + status link */}
      <Callout eyebrow="What happens next" tone="emphasis">
        <p className="text-sm leading-relaxed text-brand-black">
          Your submission is in the IIDS intake queue.{" "}
          <span className="font-semibold">{owner.name}</span> ({owner.title}) will
          review the assessment and reach out within{" "}
          <span className="font-semibold">
            {intakeConfig.sla.businessDaysToFirstResponse} business days
          </span>
          .
        </p>
        {statusUrl && (
          <div className="mt-3 rounded-lg border border-hairline bg-white p-3 text-xs">
            <p className="font-medium text-ink-muted">
              Bookmark this URL to track your submission:
            </p>
            <Link
              href={statusUrl}
              className="mt-1 block break-all font-mono text-brand-black hover:underline"
            >
              {statusUrl}
            </Link>
          </div>
        )}
        {!statusUrl && (
          <p className="mt-3 text-xs italic text-ink-subtle">
            Status link will appear shortly. Your submission is being recorded.
          </p>
        )}
      </Callout>

      {/* Related work in the portfolio */}
      <SimilarMatchesCallout
        matches={similarMatches}
        loading={false}
        context="results"
      />

      {/* Project Idea */}
      {answers.idea && (
        <Callout eyebrow="Your project idea">
          <p className="text-sm text-brand-black">{answers.idea as string}</p>
        </Callout>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Score Breakdown */}
        <ScoreBreakdown answers={answers} />

        {/* Tech Stack */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Recommended Tech Stack
          </h3>
          <ul className="mt-3 space-y-2">
            {tier.techStack.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ui-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Deployment */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Deployment Path
        </h3>
        <p className="mt-2 text-sm text-gray-600">{tier.deployment}</p>
      </div>

      {/* GitHub Template */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          GitHub Template
        </h3>
        <div className="mt-2 flex items-center gap-3">
          <code className="rounded bg-gray-100 px-3 py-1.5 text-sm font-mono text-ui-charcoal">
            {tier.githubTemplate}
          </code>
          <span className="rounded-full bg-ui-gold/15 px-2.5 py-0.5 text-xs font-medium text-ui-gold-dark">
            Placeholder
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Template repositories are being developed. Check back soon or contact IIDS for guidance.
        </p>
      </div>

      {/* Standards Required */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Standards Required
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {tier.standards.map((std) => (
            <Link
              key={std}
              href={`/standards/${std}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-ui-gold/30 bg-ui-gold/10 px-3 py-1 text-xs font-medium text-ui-gold-dark hover:bg-ui-gold/20 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {std}
            </Link>
          ))}
        </div>
      </div>

      {/* Key Considerations */}
      <div className="rounded-xl bg-ui-charcoal p-6 text-white">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ui-gold">
          Key Considerations
        </h3>
        <ul className="mt-4 space-y-3">
          {tier.considerations.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/85">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ui-gold/20 text-xs font-bold text-ui-gold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-ui-charcoal shadow-sm hover:bg-gray-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? "Copied!" : "Copy Summary"}
        </button>
        <button
          onClick={onStartOver}
          className="inline-flex items-center gap-2 rounded-lg bg-ui-gold px-5 py-2.5 text-sm font-medium text-ui-black shadow-sm hover:bg-ui-gold-light transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

// ============================================
// Main Wizard Component
// ============================================

const TOTAL_STEPS = quizSteps.length;
const REVIEW_STEP = TOTAL_STEPS;
const CONTACT_STEP = TOTAL_STEPS + 1;

// Maps AI analysis fields → quiz step IDs
const AI_FIELD_MAP: Record<string, string> = {
  suggested_sensitivity: "sensitivity",
  suggested_complexity: "complexity",
  suggested_userbase: "userbase",
  suggested_auth: "auth",
  suggested_integrations: "integrations",
  suggested_data_sources: "dataSources",
  suggested_university_systems: "universitySystems",
  suggested_output_types: "outputTypes",
};

export default function BuilderGuidePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const submittedRef = useRef(false);

  // Contact info state
  const [contact, setContact] = useState<ContactInfo>({ name: "", email: "", department: "" });
  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof ContactInfo, string>>>({});

  // AI state
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Submission ID — captured from POST /api/submissions response so the
  // ResultsView can hand the submitter their tokenized status URL.
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Live similarity matches — fetched once on entering the review step,
  // surfaced both there (to give the user a chance to coordinate before
  // submitting) and in the ResultsView.
  const [liveMatches, setLiveMatches] = useState<SimilarMatch[]>([]);
  const [liveMatchesLoading, setLiveMatchesLoading] = useState(false);

  const step = quizSteps[currentStep];

  // Fetch similarity preview when the user reaches the review step. Cancels
  // on unmount or step change so a fast Back doesn't race a stale request.
  useEffect(() => {
    if (currentStep !== REVIEW_STEP) return;
    let cancelled = false;
    setLiveMatchesLoading(true);
    fetch("/api/similarity/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sensitivity: answers.sensitivity ?? [],
        complexity: answers.complexity ?? null,
        userbase: answers.userbase ?? null,
        auth: answers.auth ?? null,
        integrations: answers.integrations ?? [],
        dataSources: answers.dataSources ?? [],
        universitySystems: answers.universitySystems ?? [],
        outputTypes: answers.outputTypes ?? [],
      }),
    })
      .then((r) => (r.ok ? r.json() : { matches: [] }))
      .then((data: { matches?: SimilarMatch[] }) => {
        if (!cancelled) setLiveMatches(data.matches ?? []);
      })
      .catch(() => {
        // Silent: similarity is a hint, not load-bearing.
      })
      .finally(() => {
        if (!cancelled) setLiveMatchesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentStep, answers]);

  const updateAnswer = (value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  };

  const canProceed = () => {
    if (!step) return true;
    const answer = answers[step.id];
    if (step.type === "text") return true;
    if (step.type === "single") return !!answer;
    if (step.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return false;
  };

  // ── AI analysis ──────────────────────────

  const handleAnalyze = async () => {
    const idea = (answers.idea as string) || "";
    if (idea.trim().length < 10) {
      setAnalysisError("Please describe your idea in more detail before analyzing.");
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/ai/analyze-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      if (res.status === 503) {
        setAnalysisError(
          "AI analysis is not yet configured. An administrator needs to set up the MindRouter API key."
        );
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAnalysisError(data.error || "Analysis failed. Please try again.");
        return;
      }

      const data = await res.json();
      setAnalysis(data);
    } catch {
      setAnalysisError("Connection error. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplySuggestions = () => {
    if (!analysis) return;

    const newAnswers = { ...answers };

    for (const [aiField, stepId] of Object.entries(AI_FIELD_MAP)) {
      const value = (analysis as unknown as Record<string, unknown>)[aiField];
      if (!value) continue;

      // Find the corresponding quiz step to validate options
      const quizStep = quizSteps.find((s) => s.id === stepId);
      if (!quizStep || !quizStep.options) continue;

      const validLabels = quizStep.options.map((o) => o.label);

      if (Array.isArray(value)) {
        // Multi-select: filter to valid options
        const filtered = (value as string[]).filter((v) => validLabels.includes(v));
        if (filtered.length > 0) {
          newAnswers[stepId] = filtered;
        }
      } else if (typeof value === "string") {
        // Single-select: check if valid
        if (validLabels.includes(value)) {
          newAnswers[stepId] = value;
        }
      }
    }

    setAnswers(newAnswers);
  };

  // ── Submission ───────────────────────────

  const validateContact = (): boolean => {
    const errors: Partial<Record<keyof ContactInfo, string>> = {};
    if (!contact.name.trim()) errors.name = "Name is required";
    if (!contact.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
    if (!contact.department) errors.department = "Please select a department";
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitToDatabase = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    try {
      const score = calculateScore(answers);
      const tier = getTierForScore(score);
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_text: (answers.idea as string) || "",
          answers,
          score,
          tier: tier.tier,
          submitter_name: contact.name.trim(),
          submitter_email: contact.email.trim(),
          department: contact.department,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.id) setSubmissionId(data.id as string);
    } catch (err) {
      console.error("Failed to save submission:", err);
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      // Quiz steps or moving to review
      setCurrentStep((s) => s + 1);
    } else if (currentStep === REVIEW_STEP) {
      // Review → Contact Info
      setCurrentStep(CONTACT_STEP);
    } else if (currentStep === CONTACT_STEP) {
      // Contact Info → Submit + Show Results
      if (!validateContact()) return;
      submitToDatabase();
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setAnswers({});
    setContact({ name: "", email: "", department: "" });
    setContactErrors({});
    setShowResults(false);
    setAnalysis(null);
    setAnalysisError(null);
    setSubmissionId(null);
    setLiveMatches([]);
    submittedRef.current = false;
  };

  const handleJumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (showResults) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-black">Submit a project</h1>
          <p className="mt-2 text-ink-muted">
            Your assessment and recommendations.
          </p>
        </div>
        <ResultsView
          answers={answers}
          onStartOver={handleStartOver}
          submissionId={submissionId}
          similarMatches={liveMatches}
        />
      </div>
    );
  }

  const isReview = currentStep === REVIEW_STEP;
  const isContact = currentStep === CONTACT_STEP;
  const isIdeaStep = step?.id === "idea";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-brand-black">Submit a project</h1>
        <p className="mt-2 max-w-3xl text-ink-muted">
          Nine short questions. The assessment classifies the project,
          surfaces similar work already in the inventory, and routes the
          submission to a named IIDS owner who responds within{" "}
          <span className="font-semibold text-brand-black">2 business days</span>.
        </p>
      </div>

      {/* Progress */}
      {!isReview && !isContact && (
        <ProgressBar current={currentStep} total={TOTAL_STEPS} />
      )}

      {/* Step Content */}
      <div className="mx-auto max-w-2xl">
        {isContact ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-ui-charcoal">Contact Information</h2>
              <p className="mt-1 text-sm text-gray-500">
                Before we generate your results, tell us who you are so we can follow up.
              </p>
              <div className="mt-6">
                <ContactInfoStep
                  contact={contact}
                  onChange={(c) => { setContact(c); setContactErrors({}); }}
                  errors={contactErrors}
                />
              </div>
            </div>
          </div>
        ) : isReview ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-ui-charcoal">Review Your Answers</h2>
              <p className="mt-1 text-sm text-gray-500">
                Click any section to go back and change your answer.
              </p>
            </div>
            <SimilarMatchesCallout
              matches={liveMatches}
              loading={liveMatchesLoading}
              context="review"
            />
            <div className="space-y-3">
              {quizSteps.map((s, i) => {
                const answer = answers[s.id];
                const display = Array.isArray(answer)
                  ? answer.join(", ")
                  : answer || "(not answered)";
                return (
                  <button
                    key={s.id}
                    onClick={() => handleJumpToStep(i)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-ui-gold transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {s.title}
                      </p>
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <p className="mt-1 text-sm text-ui-charcoal">{display}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-ui-charcoal">{step.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{step.subtitle}</p>

            <div className="mt-6">
              {step.type === "text" && (
                <TextStep
                  step={step}
                  value={(answers[step.id] as string) || ""}
                  onChange={updateAnswer}
                />
              )}
              {step.type === "single" && (
                <SingleChoiceStep
                  step={step}
                  value={(answers[step.id] as string) || ""}
                  onChange={updateAnswer}
                />
              )}
              {step.type === "multi" && (
                <MultiChoiceStep
                  step={step}
                  value={(answers[step.id] as string[]) || []}
                  onChange={updateAnswer}
                />
              )}
            </div>

            {/* AI Analysis Panel — only on the idea step */}
            {isIdeaStep && (
              <AiAnalysisPanel
                analysis={analysis}
                analyzing={analyzing}
                error={analysisError}
                onAnalyze={handleAnalyze}
                onApplySuggestions={handleApplySuggestions}
              />
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              currentStep === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:text-ui-charcoal"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!isReview && !isContact && !canProceed()}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              !isReview && !isContact && !canProceed()
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-ui-gold text-ui-black hover:bg-ui-gold-light shadow-sm"
            }`}
          >
            {isContact ? "See Results" : isReview ? "Continue" : "Next"}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating AI Chat */}
      <AiChatPanel />
    </div>
  );
}
