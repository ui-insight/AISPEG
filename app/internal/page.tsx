export default function InternalHome() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-ui-gold-dark">
          IIDS Internal
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ui-charcoal">
          Internal coordination view
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-700">
          This view shows the same project data as the public portfolio with
          sharper detail: named individuals on each blocker, contact history,
          embargoed-project records, and intake-queue admin during the
          ClickUp transition.
        </p>
      </header>

      <section className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-6">
        <h2 className="text-base font-semibold text-ui-charcoal">
          Coming in Sprint 2
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          The full friction ledger with internal-text blocker detail and
          embargoed-project records lands here once Migration 005 is applied
          and the registry is wired to render via the new schema. See
          <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            REFACTOR.md
          </code>
          at the project root for sequencing.
        </p>
      </section>
    </div>
  );
}
