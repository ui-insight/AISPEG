import {
  standardsWatch,
  summary,
  daysSince,
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

function DayCounter({ since, status }: { since: string; status: StandardsWatchStatus }) {
  if (status === "published") return null;
  const days = daysSince(since);
  const tone =
    days >= 90
      ? "text-red-700"
      : days >= 30
      ? "text-orange-700"
      : "text-gray-700";
  return (
    <span className={`text-xs font-medium ${tone}`}>
      Day {days} since requested
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
            <DayCounter since={item.dateRequested} status={item.status} />
            <span className="text-gray-400">
              Requested {item.dateRequested}
            </span>
            {item.responseUrl && (
              <a
                href={item.responseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ui-gold-dark underline"
              >
                Response artifact
              </a>
            )}
          </div>
        </div>
      </div>

      <details className="mt-4 group">
        <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-ui-gold-dark">
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
        <h1 className="text-3xl font-black tracking-tight text-ui-charcoal">
          Software-development and user-experience standards
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-700">
          The institutional standards IIDS has formally requested from the
          Office of Information Technology. Each entry shows the date
          requested and elapsed time since. Entries move to{" "}
          <span className="font-medium text-green-700">Published</span> as
          OIT releases them.
        </p>
      </header>

      {/* Summary band */}
      <section className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total asks
          </p>
          <p className="mt-1 text-2xl font-black text-ui-charcoal">{stats.total}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Outstanding
          </p>
          <p className="mt-1 text-2xl font-black text-orange-700">
            {stats.outstanding}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Published
          </p>
          <p className="mt-1 text-2xl font-black text-green-700">
            {stats.counts.published}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Oldest open
          </p>
          <p className="mt-1 text-2xl font-black text-ui-charcoal">
            {stats.oldestOutstanding} <span className="text-sm font-medium text-gray-500">days</span>
          </p>
        </div>
      </section>

      {/* Agenda I */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ui-charcoal">
            Software Development Standards
          </h2>
          <p className="mt-1 text-sm text-gray-600">
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
          <h2 className="text-xl font-bold text-ui-charcoal">
            User Experience Standards
          </h2>
          <p className="mt-1 text-sm text-gray-600">
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
