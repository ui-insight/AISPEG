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
