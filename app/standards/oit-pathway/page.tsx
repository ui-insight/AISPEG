import Link from "next/link";
import {
  OIT_SOURCE_DOCS,
  PATHWAY_STAGES,
  PATHWAY_MILESTONES,
  PATHWAY_RULES,
  IN_SCOPE_TRIGGERS,
  OUT_OF_SCOPE_EXAMPLES,
  PATHWAY_PROJECTS,
  type PathwayStage,
  type PathwayMilestone,
  type StageLead,
} from "@/lib/oit-pathway";

export const metadata = {
  title: "OIT Pathway — Standards",
  description:
    "How teams outside OIT build and deploy AI applications on OIT-managed infrastructure: the two governing documents, the six-stage lifecycle with gates, the six rules, and where our projects sit.",
};

const LEAD_STYLE: Record<StageLead, string> = {
  Builder: "bg-surface-alt text-brand-black border-hairline",
  Collaborative: "bg-brand-lupine/10 text-brand-huckleberry border-brand-lupine/30",
  OIT: "bg-brand-clearwater/10 text-brand-clearwater border-brand-clearwater/30",
};

function LeadChip({ lead }: { lead: StageLead }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${LEAD_STYLE[lead]}`}
    >
      {lead === "OIT" ? "OIT-led" : lead === "Builder" ? "Builder-led" : "Collaborative"}
    </span>
  );
}

function MilestoneCard({ milestone }: { milestone: PathwayMilestone }) {
  return (
    <div className="mt-3 rounded-lg border border-brand-lupine/30 bg-brand-lupine/5 p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-huckleberry">
          Operating milestone
        </p>
        <LeadChip lead={milestone.ledBy} />
      </div>
      <h4 className="mt-2 text-sm font-bold tracking-tight text-brand-black">
        {milestone.href ? (
          <a href={milestone.href} target="_blank" rel="noopener noreferrer">
            {milestone.name}
          </a>
        ) : (
          milestone.name
        )}
      </h4>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
        {milestone.summary}
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-silver">
        Complete when
      </p>
      <ul className="mt-1.5 space-y-1">
        {milestone.completeWhen.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-brand-black">
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-brand-lupine/20 pt-3 text-xs leading-relaxed text-ink-subtle">
        <span className="font-semibold text-brand-black">Boundary.</span>{" "}
        {milestone.boundary}
      </p>
      {milestone.openQuestions && milestone.openQuestions.length > 0 && (
        <div className="mt-3 border-t border-brand-lupine/20 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-silver">
            Still to define
          </p>
          <ul className="mt-1.5 space-y-1">
            {milestone.openQuestions.map((item) => (
              <li key={item} className="text-xs leading-relaxed text-ink-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StageRow({ stage }: { stage: PathwayStage }) {
  const milestones = PATHWAY_MILESTONES.filter(
    (milestone) => milestone.stage === stage.number
  );

  return (
    <li className="relative pl-12">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-black font-mono text-sm font-bold text-white"
      >
        {stage.number}
      </span>
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="text-base font-bold tracking-tight text-brand-black">
          {stage.name}
        </h3>
        <LeadChip lead={stage.ledBy} />
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
        {stage.summary}
      </p>
      {stage.gate && (
        <p className="mt-2 border-l-2 border-hairline pl-3 text-sm text-brand-black">
          <span className="font-semibold">Gate.</span> {stage.gate}
        </p>
      )}
      {milestones.map((milestone) => (
        <MilestoneCard key={milestone.id} milestone={milestone} />
      ))}
    </li>
  );
}

export default function OitPathwayPage() {
  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight text-brand-black sm:text-4xl">
          Building on OIT infrastructure
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          OIT&rsquo;s AI governance now runs on two tracks. The{" "}
          <span className="font-semibold text-brand-black">
            Enterprise AI Development Framework
          </span>{" "}
          sets the technology standards &mdash; the approved stack, the hosted
          environment, data classification &mdash; and is tracked ask-by-ask on
          the <Link href="/standards">Standards ledger</Link>. The{" "}
          <span className="font-semibold text-brand-black">
            AI-Assisted Builder Guide
          </span>{" "}
          sets the process for teams outside OIT who want their applications
          hosted, supported, and maintained on OIT-managed infrastructure.
          The platform both documents describe is what our inventory tracks
          as <Link href="/portfolio/nexus">Nexus</Link> — the OIT-managed
          application platform built collaboratively by OIT and IIDS. This
          page covers the second track: the lifecycle, the gates, the rules,
          and where our projects stand in it.
        </p>
      </header>

      {/* Source documents */}
      <section aria-labelledby="sources-heading" className="space-y-3">
        <p
          id="sources-heading"
          className="text-[11px] font-medium uppercase tracking-wider text-brand-silver"
        >
          Source documents
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {OIT_SOURCE_DOCS.map((doc) => (
            <article
              key={doc.href}
              className="rounded-lg border border-hairline bg-white p-4"
            >
              <h2 className="text-sm font-bold tracking-tight text-brand-black">
                <a href={doc.href} target="_blank" rel="noopener noreferrer">
                  {doc.title}
                </a>
              </h2>
              <p className="mt-1 text-xs text-ink-subtle">
                Updated{" "}
                {new Date(doc.updated + "T00:00:00Z").toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                {doc.role}
              </p>
            </article>
          ))}
        </div>
        <p className="text-xs text-ink-subtle">
          Both governance documents remain discussion drafts; entries here
          track the published wiki versions and update as OIT revises them.
        </p>
      </section>

      {/* Scope */}
      <section aria-labelledby="scope-heading" className="space-y-4">
        <div className="max-w-3xl">
          <h2
            id="scope-heading"
            className="text-xl font-black tracking-tight text-brand-black"
          >
            When the framework applies
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Any single trigger brings a project into scope &mdash; and
            enterprise tooling is then required from day one of development,
            not when institutional data first appears.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-hairline bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-clearwater">
              In scope — any one is sufficient
            </p>
            <ul className="mt-3 space-y-2">
              {IN_SCOPE_TRIGGERS.map((t) => (
                <li key={t} className="text-sm leading-relaxed text-brand-black">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-hairline bg-surface-alt p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
              Out of scope
            </p>
            <ul className="mt-3 space-y-2">
              {OUT_OF_SCOPE_EXAMPLES.map((t) => (
                <li key={t} className="text-sm leading-relaxed text-ink-muted">
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-hairline pt-3 text-xs text-ink-subtle">
              If scope changes and enterprise deployment is later pursued, the
              project enters at Stage 1 and existing code is reviewed at the
              Stage 3 security gate.
            </p>
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section aria-labelledby="lifecycle-heading" className="space-y-6">
        <div className="max-w-3xl">
          <h2
            id="lifecycle-heading"
            className="text-xl font-black tracking-tight text-brand-black"
          >
            The six-stage lifecycle
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Builders lead early, OIT leads the gates, and operation is shared.
            Gates close stages 1, 3, 4, and 5; the Stage 3 security review is
            a hard gate with no bypass process.
          </p>
        </div>
        <ol className="space-y-7">
          {PATHWAY_STAGES.map((stage) => (
            <StageRow key={stage.number} stage={stage} />
          ))}
        </ol>
      </section>

      {/* Six rules */}
      <section aria-labelledby="rules-heading" className="space-y-4">
        <div className="max-w-3xl">
          <h2
            id="rules-heading"
            className="text-xl font-black tracking-tight text-brand-black"
          >
            Six rules for every in-scope application
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PATHWAY_RULES.map((rule, i) => (
            <article
              key={rule.title}
              className="rounded-lg border border-hairline bg-white p-4"
            >
              <p className="font-mono text-xs font-medium text-brand-silver">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-sm font-bold tracking-tight text-brand-black">
                {rule.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                {rule.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Our projects in the pathway */}
      <section aria-labelledby="projects-heading" className="space-y-4">
        <div className="max-w-3xl">
          <h2
            id="projects-heading"
            className="text-xl font-black tracking-tight text-brand-black"
          >
            Our projects entering the pathway
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Two IIDS-built applications are moving from IIDS staging toward
            deployment on <Link href="/portfolio/nexus">Nexus</Link>. For
            each: why it is in scope, where it stands, what is already true
            of it, and what the intake and security gates will examine.
          </p>
        </div>
        <div className="grid gap-4">
          {PATHWAY_PROJECTS.map((p) => (
            <article
              key={p.slug}
              className="rounded-lg border border-hairline bg-white p-6"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-brand-black">
                    <Link
                      href={`/portfolio/${p.slug}`}
                      className="unstyled hover:text-brand-clearwater"
                    >
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-ink-muted">
                    {p.scopeTrigger}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full border border-brand-huckleberry/30 bg-brand-huckleberry/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-huckleberry">
                  Stage 1 — Idea &amp; Scoping
                </span>
              </header>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
                    Where it starts from
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {p.standingFacts.map((f) => (
                      <li
                        key={f}
                        className="text-sm leading-relaxed text-brand-black"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
                    What the gates will examine
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {p.gateQuestions.map((q) => (
                      <li
                        key={q}
                        className="text-sm leading-relaxed text-ink-muted"
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 border-t border-hairline pt-3 text-xs text-ink-subtle">
                {p.position}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
