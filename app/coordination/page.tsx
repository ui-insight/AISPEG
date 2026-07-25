import Link from "next/link";
import {
  allGovernanceProfiles,
  governanceCoverage,
} from "@/lib/governance-profile";
import {
  OIT_EA_PROJECTS,
  SOURCE_AS_OF,
  SOURCE_FISCAL_YEAR,
  crosswalkedProjects,
} from "@/lib/oit-ea-portfolio";
import {
  PATHWAY_PROJECTS,
  PATHWAY_RULES,
  PATHWAY_STAGES,
} from "@/lib/oit-pathway";
import {
  OPERATIONAL_EXCELLENCE_META,
  totalResponseCount,
} from "@/lib/surveys/operational-excellence";
import { CANDIDATE_PROJECTS } from "@/lib/surveys/candidate-projects";
import { ROI_RUBRIC_READY, formatAnnualUsd } from "@/lib/roi-rubric";

export const metadata = {
  title: "Coordination — Institutional AI Initiative",
  description:
    "How a technology request becomes tracked institutional work at the University of Idaho: where demand arrives, how requests are classified, the deployment pathway they follow, and how commitments are tracked against OIT's portfolio.",
};

// ── Step rail ────────────────────────────────────────────────
// The four movements of the process, in the order a request travels
// them. `owed` is the honest gap — what does not exist yet at this step.

interface Step {
  n: number;
  title: string;
  detail: string;
  href: string;
  linkLabel: string;
  owed?: string;
}

function StepRow({ step }: { step: Step }) {
  return (
    <li className="relative pl-12">
      <span
        aria-hidden
        className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-white text-sm font-black text-brand-black"
      >
        {step.n}
      </span>
      <h3 className="text-base font-bold tracking-tight text-brand-black">
        {step.title}
      </h3>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">
        {step.detail}
      </p>
      {step.owed && (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-subtle">
          <span className="font-semibold text-brand-black">Still owed:</span>{" "}
          {step.owed}
        </p>
      )}
      <p className="mt-2">
        <Link
          href={step.href}
          className="text-sm font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2"
        >
          {step.linkLabel} &rarr;
        </Link>
      </p>
    </li>
  );
}

// ── Section cards ────────────────────────────────────────────

interface SurfaceCard {
  href: string;
  label: string;
  claim: string;
  facts: string[];
}

function SurfaceCardBlock({ card }: { card: SurfaceCard }) {
  return (
    <Link
      href={card.href}
      className="unstyled group flex flex-col rounded-xl border border-hairline bg-white p-5 shadow-sm transition-colors hover:border-brand-clearwater/40"
    >
      <h3 className="text-base font-bold tracking-tight text-brand-black group-hover:text-brand-clearwater">
        {card.label}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
        {card.claim}
      </p>
      <ul className="mt-3 space-y-1 border-t border-hairline pt-3">
        {card.facts.map((f) => (
          <li key={f} className="text-xs leading-relaxed text-ink-subtle">
            {f}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default function CoordinationOverviewPage() {
  const coverage = governanceCoverage(allGovernanceProfiles());
  const crosswalked = crosswalkedProjects().length;
  // Two different numbers on the survey: open-ended responses (one person
  // answers several cluster questions) and respondents. Keep them
  // distinguished here exactly as /coordination/operational-excellence does.
  const surveyResponses = totalResponseCount();
  const surveyRespondents = OPERATIONAL_EXCELLENCE_META.respondents.reduce(
    (n, r) => n + r.count,
    0,
  );

  const steps: Step[] = [
    {
      n: 1,
      title: "Demand arrives — from four directions at once",
      detail: `Requests reach the institution through the Chief AI & Data Science Officer's Unified Technology Request, through this site's Submit a Project form, through ClickUp as IIDS project work, and through direct asks that never get written down. The Operational Excellence survey added ${surveyResponses} unsolicited statements from ${surveyRespondents} faculty, staff, and students about what they want fixed. The request queue is the single place all of those origins land.`,
      href: "/portfolio/pipeline",
      linkLabel: "The request queue",
      owed:
        "A TDX sync, so requests filed in the university ticketing system appear here without re-entry. Blocked on API access.",
    },
    {
      n: 2,
      title: "Requests get classified against one vocabulary",
      detail: `Every project in the inventory carries an intake track, a build type, a data classification, and an AI-risk tier — the same four dimensions the Unified Technology Request asks for. ${coverage.total} projects are profiled today. Where a project replaces a licensed system, the crosswalk carries the incumbent's annual cost and renewal date rather than a projected saving.`,
      href: "/coordination/intake-crosswalk",
      linkLabel: "Intake Crosswalk",
      owed: ROI_RUBRIC_READY
        ? undefined
        : `A published ROI rubric and the authoritative data-classification determinations, both owed by the CADSO office. Data classification is pending on ${coverage.classificationPending} of ${coverage.total} projects and AI-risk posture on ${coverage.aiRiskPending} — those cells read "pending" rather than being guessed at.`,
    },
    {
      n: 3,
      title: "Work follows a published deployment pathway",
      detail: `Teams outside OIT that deploy onto OIT-managed infrastructure follow the AI-Assisted Builder Guide: ${PATHWAY_STAGES.length} stages with gates, ${PATHWAY_RULES.length} rules that apply to every in-scope application, and a data-classification review at Stage 1 rather than at deployment. ${PATHWAY_PROJECTS.length} of our projects are positioned on it.`,
      href: "/coordination/oit-pathway",
      linkLabel: "OIT Pathway",
    },
    {
      n: 4,
      title: "Commitments get tracked next to OIT's own",
      detail: `OIT's ${SOURCE_FISCAL_YEAR} Enterprise Applications portfolio holds ${OIT_EA_PROJECTS.length} projects with their own priority, owning team, and effort estimates. Their structure is kept intact rather than folded into ours, so the two portfolios can be compared without either vocabulary being flattened. ${crosswalked} rows are confirmed as the same work we track.`,
      href: "/coordination/oit-portfolio",
      linkLabel: "OIT Portfolio",
      owed:
        "Owner confirmation on further matches. Subject-matter adjacency is not treated as evidence that two rows are the same project.",
    },
  ];

  const cards: SurfaceCard[] = [
    {
      href: "/coordination/intake-crosswalk",
      label: "Intake Crosswalk",
      claim:
        "Every project mapped onto the Unified Technology Request vocabulary — business need, data touched, ownership, build track, AI-risk posture, and replacement economics.",
      facts: [
        `${coverage.total} projects profiled`,
        coverage.bottomLineCount > 0
          ? `${coverage.bottomLineCount} with declared replacement economics — ${formatAnnualUsd(coverage.bottomLineTotalUsd)} in incumbent license cost`
          : "Replacement economics not yet declared",
        `${coverage.classificationPending} data classifications still pending`,
      ],
    },
    {
      href: "/coordination/oit-pathway",
      label: "OIT Pathway",
      claim:
        "The six-stage lifecycle, its gates, and the six rules that govern any application built outside OIT and deployed on OIT infrastructure.",
      facts: [
        `${PATHWAY_STAGES.length} stages, ${PATHWAY_RULES.length} standing rules`,
        `${PATHWAY_PROJECTS.length} of our projects positioned on the pathway`,
        "Sourced from the Framework and Builder Guide drafts",
      ],
    },
    {
      href: "/coordination/oit-portfolio",
      label: "OIT Portfolio",
      claim: `OIT's ${SOURCE_FISCAL_YEAR} Enterprise Applications inventory in OIT's own tracking structure, and the rows it shares with this inventory.`,
      facts: [
        `${OIT_EA_PROJECTS.length} projects in OIT's ${SOURCE_FISCAL_YEAR} portfolio`,
        `${crosswalked} owner-confirmed crosswalks to our projects`,
        `Transcribed from OIT's cut of ${SOURCE_AS_OF}`,
      ],
    },
    {
      href: "/coordination/operational-excellence",
      label: "Op Excellence Survey",
      claim:
        "What the campus actually asked for, in its own words — the demand evidence behind the queue, from the October 2025 Operational Excellence survey.",
      facts: [
        `${surveyResponses} open-ended responses from ${surveyRespondents} respondents`,
        `${CANDIDATE_PROJECTS.length} candidate projects triaged from the themes`,
        OPERATIONAL_EXCELLENCE_META.pillar,
      ],
    },
  ];

  return (
    <div className="space-y-14">
      <header>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-brand-black sm:text-4xl">
          One process, from request to tracked work
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          The University of Idaho asks for technology in four or five
          different places, evaluates it against vocabularies that
          don&rsquo;t quite match, and tracks the result in systems that
          don&rsquo;t talk to each other. This section holds the work of
          converging that into a single institutional process &mdash; and
          it is deliberately honest about which parts exist today and which
          are still owed.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-black">
          Every page below is a working artifact built from real data, not a
          proposal for one.
        </p>
      </header>

      <section aria-labelledby="flow-heading" className="space-y-6">
        <div>
          <h2
            id="flow-heading"
            className="text-xl font-black tracking-tight text-brand-black"
          >
            How a request travels
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Four movements. Each one has a surface on this site, and each
            one has a named gap.
          </p>
        </div>
        <ol className="space-y-8">
          {steps.map((step) => (
            <StepRow key={step.n} step={step} />
          ))}
        </ol>
      </section>

      <section aria-labelledby="surfaces-heading" className="space-y-5">
        <div>
          <h2
            id="surfaces-heading"
            className="text-xl font-black tracking-tight text-brand-black"
          >
            The surfaces
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Each one is maintained against a source that changes &mdash;
            OIT&rsquo;s drafts, OIT&rsquo;s portfolio cut, the survey
            corpus, the project inventory.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <SurfaceCardBlock key={card.href} card={card} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="reference-heading"
        className="rounded-xl border border-hairline bg-surface-alt p-6"
      >
        <p
          id="reference-heading"
          className="text-xs font-medium uppercase tracking-wider text-brand-silver"
        >
          Related
        </p>
        <h2 className="mt-2 text-lg font-black tracking-tight text-brand-black">
          Process lives here. What it&rsquo;s measured against lives under
          Standards.
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          This section covers how work gets in and moves. The published
          standards it has to satisfy, the shared data model beneath the
          projects, and the strategic-plan priorities the work is claimed
          against are reference material and sit on their own surface.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <Link
            href="/standards"
            className="font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2"
          >
            Standards ledger &rarr;
          </Link>
          <Link
            href="/standards/data-model"
            className="font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2"
          >
            Data Model &rarr;
          </Link>
          <Link
            href="/standards/strategic-plan"
            className="font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2"
          >
            Strategic Plan &rarr;
          </Link>
        </p>
      </section>
    </div>
  );
}
