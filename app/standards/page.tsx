import Link from "next/link";
import StandardDraftPanel from "@/components/StandardDraftPanel";
import {
  MATURITY_LEVELS,
  draftSummary,
  standardDraftById,
} from "@/lib/standards-drafts";
import {
  standardsWatch,
  summary,
  type StandardsWatchItem,
  type StandardsWatchStatus,
} from "@/lib/standards-watch";

const STATUS_LABEL: Record<StandardsWatchStatus, string> = {
  "not-started": "Not started",
  "in-discussion": "In discussion",
  "in-draft": "In draft",
  approved: "Approved",
};

const STATUS_STYLES: Record<StandardsWatchStatus, string> = {
  "not-started": "bg-gray-100 text-gray-700",
  "in-discussion": "bg-amber-100 text-amber-800",
  "in-draft": "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
};

function StatusChip({ status }: { status: StandardsWatchStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function StandardRow({ item }: { item: StandardsWatchItem }) {
  const draft = standardDraftById.get(item.id);

  return (
    <article id={item.id} className="scroll-mt-28 border-t border-hairline py-6">
      <div className="grid gap-4 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-6">
        <div>
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-black font-mono text-xs font-bold text-white">
            {item.agenda}.{item.id.split("-")[1]}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-ui-charcoal">
              {item.title}
            </h3>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <StatusChip status={item.status} />
            {item.responseUrl && (
              <a
                href={item.responseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-black underline"
              >
                Response artifact
              </a>
            )}
            {draft && (
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-brand-huckleberry">
                Measurable draft attached
              </span>
            )}
          </div>

          <details className="group mt-4">
            <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-brand-black">
              Requested scope ({item.details.length} sub-items)
            </summary>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-brand-gold-dark">
              {item.details.map((d, i) => (
                <li key={i} className="text-sm leading-relaxed text-gray-700">
                  {d}
                </li>
              ))}
            </ul>
            {item.links && item.links.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
                  Existing references
                </p>
                <ul className="mt-2 space-y-1.5">
                  {item.links.map((l) => (
                    <li key={l.href} className="text-sm leading-relaxed">
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </details>

          {item.responseNote && (
            <p className="mt-4 bg-green-50 px-3 py-2 text-xs leading-relaxed text-green-950">
              <strong>OIT response to date:</strong> {item.responseNote}
            </p>
          )}

          {draft && <StandardDraftPanel draft={draft} />}
        </div>
      </div>
    </article>
  );
}

export default function StandardsWatchPage() {
  const stats = summary();
  const drafts = draftSummary();
  const agendaI = standardsWatch.filter((s) => s.agenda === "I");
  const agendaII = standardsWatch.filter((s) => s.agenda === "II");

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-black tracking-tight text-brand-black">
          Software-development and user-experience standards
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-muted">
          The catalog of institutional IT, data, and AI governance
          standards surfaced through this portal &mdash; drafting status,
          the artifacts that ratify them, and the references behind each.
          Entries move to{" "}
          <span className="font-medium text-green-700">Approved</span> as
          the Office of Information Technology publishes them.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-black">
          <span className="font-bold">{stats.outstanding}</span>{" "}
          in progress. <span className="font-bold">{stats.counts.approved}</span>{" "}
          approved.
        </p>
      </header>

      <section
        aria-labelledby="proposed-drafts-heading"
        className="bg-brand-black px-5 py-6 text-white sm:px-7 sm:py-8"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">
          Working material — not yet University policy
        </p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)] lg:gap-12">
          <div>
            <h2
              id="proposed-drafts-heading"
              className="text-xl font-black tracking-tight text-white sm:text-2xl"
            >
              Evidence-backed drafts now cover all twenty categories
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-200">
              {drafts.requirements} atomic requirements draw on {drafts.sources}{" "}
              published sources. Each requirement states what evidence an
              assessor examines and how it is tested. {drafts.criticalRequirements}{" "}
              requirements are explicit gates that cannot disappear inside an
              average score.
            </p>
          </div>
          <div className="border-t border-gray-700 pt-4 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            <p className="text-sm font-semibold text-white">Publication rule</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              External sources justify and shape a proposal. Only a named
              University authority can resolve local thresholds and move an
              entry from draft to approved.
            </p>
            <Link
              href="/standards/foundation"
              className="mt-3 inline-block text-sm font-semibold text-white"
            >
              Read the definitions and assessment instruments →
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="assessment-heading">
        <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.55fr)_minmax(0,1.45fr)] lg:gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              Assessment method
            </p>
            <h2
              id="assessment-heading"
              className="mt-2 text-xl font-black tracking-tight text-brand-black"
            >
              Conformance and maturity answer different questions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Every requirement is marked Met, Partially met, Not met, Not
              applicable, or Not assessed. Maturity describes how reliably the
              institution sustains that practice; it does not excuse a failed
              legal, accessibility, privacy, or security gate.
            </p>
          </div>
          <ol className="grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-5">
            {MATURITY_LEVELS.map((level) => (
              <li key={level.score} className="bg-white p-4">
                <span className="font-mono text-xs font-bold text-brand-huckleberry">
                  {level.score}
                </span>
                <p className="mt-2 text-sm font-black text-brand-black">
                  {level.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {level.definition}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Active sources — resources OIT is currently drafting against
          that answer (in part or whole) the asks below. As OIT
          publishes formal policy artifacts, link them per-entry via
          responseUrl rather than expanding this block. */}
      <section
        aria-labelledby="active-sources-heading"
        className="rounded-xl border border-hairline bg-surface-alt p-5"
      >
        <p
          id="active-sources-heading"
          className="text-xs font-medium uppercase tracking-wider text-brand-silver"
        >
          Active sources
        </p>
        <h2 className="mt-2 text-lg font-black tracking-tight text-brand-black">
          OIT&rsquo;s AI governance runs on two tracks
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          The joint IIDS/OIT &ldquo;AI for UI&rdquo; effort (OIT delivery
          lead: Kali Armitage) is drafting two companion documents. The{" "}
          <span className="font-semibold text-brand-black">
            Enterprise AI Development Framework
          </span>{" "}
          (discussion draft, updated June 2026) sets the technology
          standards — a paved road of pre-approved tools, a two-zone
          hosted environment, APM 30.11 data classification, and a
          required pre-deploy artifact set. The{" "}
          <span className="font-semibold text-brand-black">
            AI-Assisted Builder Guide
          </span>{" "}
          (May 2026) sets the process for teams outside OIT deploying on
          OIT infrastructure — a six-stage lifecycle with gates and six
          rules for every in-scope application. Open decisions include
          the AI model gateway (MindRouter is the named candidate),
          model-registry ownership, local AI tooling policy, and
          long-term application ownership.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <a
            href="https://dev.azure.com/uidaho/Development/_wiki/wikis/Development.wiki/19540/Enterprise-AI-Development-Framework"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2"
          >
            Framework draft &rarr;
          </a>
          <a
            href="https://dev.azure.com/uidaho/Development/_wiki/wikis/Development.wiki/19581/AI-Assisted-Builder-Guide"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2"
          >
            Builder Guide &rarr;
          </a>
          <Link
            href="/coordination/oit-pathway"
            className="font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2"
          >
            The pathway, and where our projects sit &rarr;
          </Link>
        </p>
        <p className="mt-3 text-xs text-ink-subtle">
          Entries below tagged{" "}
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
            In draft
          </span>{" "}
          or{" "}
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
            In discussion
          </span>{" "}
          are addressed in part or whole by these sources.
        </p>
      </section>

      {/* Agenda I */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-brand-black">
            Software Development Standards
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Standards governing how applications are architected, secured,
            deployed, and maintained at the University of Idaho.
          </p>
        </div>
        <div>
          {agendaI.map((item) => (
            <StandardRow key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Agenda II */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-brand-black">
            User Experience Standards
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Standards governing how University of Idaho applications look,
            behave, and treat the people who use them.
          </p>
        </div>
        <div>
          {agendaII.map((item) => (
            <StandardRow key={item.id} item={item} />
          ))}
        </div>
      </section>

    </div>
  );
}
