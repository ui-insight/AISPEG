import {
  standardsWatch,
  summary,
  type StandardsWatchItem,
  type StandardsWatchStatus,
} from "@/lib/standards-watch";

const STATUS_LABEL: Record<StandardsWatchStatus, string> = {
  requested: "Requested",
  acknowledged: "Acknowledged",
  "in-draft": "In draft",
  published: "Published",
};

const STATUS_STYLES: Record<StandardsWatchStatus, string> = {
  requested: "bg-orange-100 text-orange-800",
  acknowledged: "bg-yellow-100 text-yellow-800",
  "in-draft": "bg-blue-100 text-blue-800",
  published: "bg-green-100 text-green-800",
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
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-600">
              {item.agenda}.{item.id.split("-")[1]}
            </span>
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
          </div>
        </div>
      </div>

      <details className="mt-4 group">
        <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-brand-black">
          Show requested detail ({item.details.length} sub-items)
        </summary>
        <ul className="mt-3 space-y-2 border-l-2 border-gray-100 pl-4">
          {item.details.map((d, i) => (
            <li key={i} className="text-sm leading-relaxed text-gray-700">
              {d}
            </li>
          ))}
        </ul>
        {item.links && item.links.length > 0 && (
          <div className="mt-4 border-l-2 border-gray-100 pl-4">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              References
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
        <p className="mt-3 rounded bg-green-50 px-3 py-2 text-xs text-green-900">
          <strong>Response note:</strong> {item.responseNote}
        </p>
      )}
    </article>
  );
}

export default function StandardsWatchPage() {
  const stats = summary();
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
          The institutional standards IIDS has formally requested from the
          Office of Information Technology. Entries move to{" "}
          <span className="font-medium text-green-700">Published</span> as
          OIT releases them.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-black">
          <span className="font-bold">{stats.outstanding}</span>{" "}
          outstanding asks. <span className="font-bold">{stats.counts.published}</span>{" "}
          published.
        </p>
      </header>

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
          OIT Enterprise AI Development Framework
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          OIT (Kali Armitage) is circulating a discussion draft of the
          Enterprise AI Development Framework, dated April 2026. It
          proposes a paved-road model — a catalog of pre-approved tools,
          patterns, and infrastructure so teams can build within safe
          boundaries without per-project review — alongside a two-zone
          hosted environment (OIT-operated platform plus per-team
          Kubernetes namespace), APM 30.11 data classification, and a
          required pre-deploy artifact set. Several decisions remain
          open, including the AI model gateway, model-registry
          ownership, local AI tooling policy, and long-term application
          ownership.
        </p>
        <p className="mt-3 text-sm">
          <a
            href="https://dev.azure.com/uidaho/Development/_wiki/wikis/Development.wiki/19540/Enterprise-AI-Development-Framework"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2"
          >
            Read the draft on the Azure DevOps wiki &rarr;
          </a>
        </p>
        <p className="mt-3 text-xs text-ink-subtle">
          Entries below tagged{" "}
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
            In draft
          </span>{" "}
          or{" "}
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 font-medium text-yellow-800">
            Acknowledged
          </span>{" "}
          are addressed in part or whole by this source.
        </p>
      </section>

      {/* Agenda I */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-brand-black">
            Software Development Standards
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Requested deliverables governing how applications are architected,
            secured, deployed, and maintained at the University of Idaho.
          </p>
        </div>
        <div className="space-y-3">
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
            Requested deliverables governing how University of Idaho
            applications look, behave, and treat the people who use them.
          </p>
        </div>
        <div className="space-y-3">
          {agendaII.map((item) => (
            <StandardRow key={item.id} item={item} />
          ))}
        </div>
      </section>

    </div>
  );
}
