import { notFound } from "next/navigation";
import Link from "next/link";
import { queryOne } from "@/lib/db";
import { intakeConfig, submissionStatusLabels } from "@/lib/intake-config";

export const dynamic = "force-dynamic";

interface SubmissionRow {
  id: string;
  idea_text: string;
  tier: number;
  status: string;
  submitter_name: string | null;
  submitter_email: string | null;
  department: string | null;
  created_at: Date;
  updated_at: Date;
}

const tierLabels: Record<number, string> = {
  1: "Tier 1 — Simple Static App",
  2: "Tier 2 — Standard Web App",
  3: "Tier 3 — Managed Service App",
  4: "Tier 4 — Enterprise / Regulated App",
};

const toneStyles = {
  neutral: "border-gray-200 bg-gray-50 text-gray-800",
  active: "border-amber-200 bg-amber-50 text-amber-900",
  done: "border-green-200 bg-green-50 text-green-900",
} as const;

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// UUID format: 8-4-4-4-12 hex digits
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return {
    title: `Submission ${token.slice(0, 8)} · UI AI Project Intake`,
    description: "Track the status of your submitted AI project idea.",
  };
}

export default async function IntakeStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!UUID_RE.test(token)) notFound();

  const submission = await queryOne<SubmissionRow>(
    `SELECT id, idea_text, tier, status,
            submitter_name, submitter_email, department,
            created_at, updated_at
     FROM submissions
     WHERE id = $1`,
    [token]
  );

  if (!submission) notFound();

  const statusInfo =
    submissionStatusLabels[submission.status] ?? {
      label: submission.status,
      description: "Status unknown.",
      tone: "neutral" as const,
    };
  const owner = intakeConfig.intakeOwner;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ui-gold-dark">
          UI AI Project Intake
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ui-charcoal">
          Submission status
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Submitted {formatDate(submission.created_at)}
          {submission.submitter_name ? ` by ${submission.submitter_name}` : ""}
          {submission.department ? ` · ${submission.department}` : ""}
        </p>
      </div>

      {/* Status panel */}
      <section
        className={`rounded-xl border p-6 ${toneStyles[statusInfo.tone]}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold">{statusInfo.label}</h2>
          <span className="text-xs">
            Last updated {formatDate(submission.updated_at)}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed">
          {statusInfo.description}
        </p>
      </section>

      {/* Assigned human + SLA */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Assigned to
        </p>
        <p className="mt-2 text-base font-semibold text-ui-charcoal">
          {owner.name}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({owner.title})
          </span>
        </p>
        {owner.email && (
          <p className="mt-1 text-sm text-gray-600">
            <a
              href={`mailto:${owner.email}`}
              className="text-ui-gold-dark hover:underline"
            >
              {owner.email}
            </a>
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          {intakeConfig.sla.text}
        </p>
      </section>

      {/* Submission summary */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          What you submitted
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          {submission.idea_text}
        </p>
        <p className="mt-4 text-sm font-medium text-ui-gold-dark">
          {tierLabels[submission.tier] ?? `Tier ${submission.tier}`}
        </p>
      </section>

      {/* What happens next */}
      <section className="rounded-xl bg-ui-charcoal p-6 text-white">
        <h2 className="text-base font-semibold text-ui-gold">
          What happens next
        </h2>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ui-gold/20 text-xs font-bold text-ui-gold">
              1
            </span>
            <span className="leading-relaxed text-white/90">
              {owner.name} reviews the assessment and reaches out within{" "}
              {intakeConfig.sla.businessDaysToFirstResponse} business days.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ui-gold/20 text-xs font-bold text-ui-gold">
              2
            </span>
            <span className="leading-relaxed text-white/90">
              IIDS scopes the project, checks for related work, and either
              accepts it into the portfolio or refers you to the right
              partner unit.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ui-gold/20 text-xs font-bold text-ui-gold">
              3
            </span>
            <span className="leading-relaxed text-white/90">
              Accepted projects appear on{" "}
              <Link
                href="/portfolio"
                className="text-ui-gold hover:underline"
              >
                /portfolio
              </Link>{" "}
              with named operational ownership.
            </span>
          </li>
        </ol>
      </section>

      <p className="text-center text-xs text-gray-400">
        Bookmark this page to check back. The link is unique to your
        submission.
      </p>
    </div>
  );
}
