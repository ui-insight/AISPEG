import {
  SOURCE_AUTHORITY_LABELS,
  standardsSourceById,
  type StandardDraft,
  type SourceAuthority,
} from "@/lib/standards-drafts";
import { FOUNDATION_DEFINITIONS } from "@/lib/standards-foundation";

const AUTHORITY_STYLES: Record<SourceAuthority, string> = {
  "binding-policy": "bg-brand-gold text-brand-black",
  "consensus-standard": "bg-violet-100 text-brand-huckleberry",
  "government-guidance": "bg-teal-50 text-teal-900",
  "higher-ed-practice": "bg-amber-100 text-amber-950",
  "implementation-guidance": "bg-gray-100 text-gray-700",
};

function SourceList({ draft }: { draft: StandardDraft }) {
  const sources = draft.sourceIds.map((sourceId) => {
    const source = standardsSourceById.get(sourceId);
    if (!source) throw new Error(`Unknown standards source: ${sourceId}`);
    return source;
  });

  return (
    <div>
      <h5 className="text-sm font-black tracking-tight text-brand-black">
        Source basis
      </h5>
      <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
        {sources.map((source) => (
          <li key={source.id} className="py-3">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-black"
              >
                {source.shortLabel}
              </a>
              <span
                className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${AUTHORITY_STYLES[source.authority]}`}
              >
                {SOURCE_AUTHORITY_LABELS[source.authority]}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {source.title}
              {source.version ? ` · ${source.version}` : ""} · checked{" "}
              {source.checkedOn}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {source.note}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StandardDraftPanel({ draft }: { draft: StandardDraft }) {
  const criticalCount = draft.requirements.filter(
    (requirement) => requirement.critical,
  ).length;
  const foundationTerms = FOUNDATION_DEFINITIONS.filter((definition) =>
    definition.relatedStandards.includes(draft.standardId),
  );

  return (
    <details className="group mt-4 border-y border-hairline bg-surface-alt">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-xs font-bold uppercase tracking-wider text-brand-huckleberry">
            Proposed measurable draft
          </span>
          <span className="mt-0.5 block text-sm text-ink-muted">
            {draft.requirements.length} requirements · {criticalCount} release{" "}
            {criticalCount === 1 ? "gate" : "gates"}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="text-xl font-light text-brand-silver transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
        >
          +
        </span>
      </summary>

      <div className="border-t border-hairline px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)] lg:gap-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              Applies to
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-black">
              {draft.scope}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              Why this belongs in the standard
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {draft.rationale}
            </p>
          </div>
        </div>

        {foundationTerms.length > 0 && (
          <div className="mt-6 border-y border-hairline py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-silver">
              Defined foundation terms
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {foundationTerms.map((definition) => (
                <a
                  key={definition.id}
                  href={`/standards/foundation#${definition.id}`}
                  className="text-sm font-semibold text-brand-black"
                >
                  {definition.term}
                </a>
              ))}
            </p>
          </div>
        )}

        <section className="mt-8" aria-label="Draft requirements">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h4 className="text-base font-black tracking-tight text-brand-black">
              Testable requirements
            </h4>
            <p className="text-xs text-ink-subtle">
              Critical gates cannot be averaged away
            </p>
          </div>
          <ol className="mt-3 divide-y divide-hairline border-y border-hairline">
            {draft.requirements.map((requirement) => (
              <li
                key={requirement.id}
                className="grid gap-4 py-5 md:grid-cols-[7.5rem_minmax(0,1fr)]"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-brand-huckleberry">
                    {requirement.id}
                  </span>
                  {requirement.critical && (
                    <span className="mt-2 block w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[0.68rem] font-semibold text-amber-900">
                      Critical gate
                    </span>
                  )}
                </div>
                <div>
                  <p className="max-w-3xl text-sm font-semibold leading-relaxed text-brand-black">
                    {requirement.statement}
                  </p>
                  <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="font-bold uppercase tracking-wider text-brand-silver">
                        Evidence
                      </dt>
                      <dd className="mt-1 leading-relaxed text-ink-muted">
                        {requirement.evidence.join(" · ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-wider text-brand-silver">
                        Assessment
                      </dt>
                      <dd className="mt-1 leading-relaxed text-ink-muted">
                        {requirement.assessment}
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <SourceList draft={draft} />

          <div className="space-y-7">
            <div>
              <h5 className="text-sm font-black tracking-tight text-brand-black">
                Open calibration items
              </h5>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                These do not suspend the proposed requirements. Use the stated
                default and record operational evidence until stronger
                institutional authority or pilot results justify revision.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted marker:text-brand-gold-dark">
                {draft.localDecisions.map((decision) => (
                  <li key={decision}>{decision}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-black tracking-tight text-brand-black">
                Assessment governance
              </h5>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-brand-black">Cadence</dt>
                  <dd className="mt-0.5 leading-relaxed text-ink-muted">
                    {draft.assessment.cadence}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-black">Assessor</dt>
                  <dd className="mt-0.5 leading-relaxed text-ink-muted">
                    {draft.assessment.assessor}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-black">
                    Conformance rule
                  </dt>
                  <dd className="mt-0.5 leading-relaxed text-ink-muted">
                    {draft.assessment.conformanceRule}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h5 className="text-sm font-black tracking-tight text-brand-black">
                Exception process
              </h5>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {draft.exceptionProcess}
              </p>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
