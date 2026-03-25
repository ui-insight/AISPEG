"use client";

import { useState } from "react";
import Link from "next/link";
import {
  quizSteps,
  calculateScore,
  getTierForScore,
  generateSummary,
  type Answers,
  type QuizStep,
  type TierRecommendation,
} from "@/lib/builder-guide-data";

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

function ReviewStep({ answers }: { answers: Answers }) {
  return (
    <div className="space-y-4">
      {quizSteps.map((step) => {
        const answer = answers[step.id];
        const display = Array.isArray(answer)
          ? answer.join(", ")
          : answer || "(not answered)";

        return (
          <div key={step.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {step.title}
            </p>
            <p className="mt-1 text-sm text-ui-charcoal">{display}</p>
          </div>
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

function ResultsView({
  answers,
  onStartOver,
}: {
  answers: Answers;
  onStartOver: () => void;
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

      {/* Project Idea */}
      {answers.idea && (
        <div className="rounded-xl border-l-4 border-ui-gold bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Your Project Idea
          </p>
          <p className="mt-2 text-sm text-ui-charcoal">{answers.idea as string}</p>
        </div>
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
          Template repositories are being developed. Check back soon or contact AISPEG for guidance.
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

const TOTAL_STEPS = quizSteps.length; // 6 quiz steps
const REVIEW_STEP = TOTAL_STEPS; // index 6 = review

export default function BuilderGuidePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);

  const step = quizSteps[currentStep];

  const updateAnswer = (value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  };

  const canProceed = () => {
    if (!step) return true; // review step
    const answer = answers[step.id];
    if (step.type === "text") return true; // text is optional
    if (step.type === "single") return !!answer;
    if (step.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return false;
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    } else {
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
    setShowResults(false);
  };

  const handleJumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (showResults) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-ui-charcoal">App Builder Guide</h1>
          <p className="mt-2 text-gray-600">
            Your personalized assessment and recommendations.
          </p>
        </div>
        <ResultsView answers={answers} onStartOver={handleStartOver} />
      </div>
    );
  }

  const isReview = currentStep === REVIEW_STEP;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">App Builder Guide</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Answer a few questions about your project idea and we&apos;ll recommend the right
          standards, tech stack, deployment path, and GitHub template to get you started.
        </p>
      </div>

      {/* Progress */}
      {!isReview && (
        <ProgressBar current={currentStep} total={TOTAL_STEPS} />
      )}

      {/* Step Content */}
      <div className="mx-auto max-w-2xl">
        {isReview ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-ui-charcoal">Review Your Answers</h2>
              <p className="mt-1 text-sm text-gray-500">
                Click any section to go back and change your answer.
              </p>
            </div>
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
            disabled={!isReview && !canProceed()}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              !isReview && !canProceed()
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-ui-gold text-ui-black hover:bg-ui-gold-light shadow-sm"
            }`}
          >
            {isReview ? "See Results" : "Next"}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
