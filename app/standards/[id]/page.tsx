import Link from "next/link";
import { notFound } from "next/navigation";

import { standardDocuments, institutionalStandards } from "@/lib/data";

export function generateStaticParams() {
  return standardDocuments.map((doc) => ({ id: doc.id }));
}

export default async function StandardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = standardDocuments.find((d) => d.id === id);
  if (!doc) notFound();

  const standard = institutionalStandards.find((s) => s.id === id);

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/standards"
        className="inline-flex items-center gap-1 text-sm font-medium text-ui-gold-dark hover:underline"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Standards Roadmap
      </Link>

      {/* Document header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-ui-charcoal">{doc.title}</h1>
          <span className="rounded-full bg-ui-gold/15 px-3 py-1 text-xs font-semibold text-ui-gold-dark">
            v{doc.version}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
          <span>Effective: {doc.effectiveDate}</span>
          <span>Last Reviewed: {doc.lastReviewed}</span>
          <span>Owner: {doc.owner}</span>
        </div>
      </div>

      {/* Scope */}
      <section className="rounded-xl border-l-4 border-ui-gold bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Scope</p>
        <p className="mt-2 text-sm text-gray-700">{doc.scope}</p>
      </section>

      {/* Requirement sections */}
      <div className="space-y-6">
        {doc.sections.map((section, i) => (
          <section
            key={section.heading}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ui-charcoal text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-ui-charcoal">{section.heading}</h2>
                <ul className="mt-3 space-y-2">
                  {section.content.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ui-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Enforcement */}
      <section className="rounded-xl bg-ui-charcoal p-6 text-white">
        <h2 className="text-lg font-semibold text-ui-gold">Enforcement</h2>
        <p className="mt-2 text-sm text-white/85">{doc.enforcement}</p>
      </section>

      {/* Known gaps */}
      {standard && standard.gapsToFill.length > 0 && (
        <section className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <h2 className="text-base font-semibold text-orange-800">Known Gaps</h2>
          <p className="mt-1 text-xs text-orange-600">
            Items identified for future revisions of this standard.
          </p>
          <ul className="mt-3 space-y-2">
            {standard.gapsToFill.map((gap) => (
              <li key={gap} className="flex items-start gap-2 text-sm text-orange-700">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-300" />
                {gap}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* References */}
      {doc.references.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-ui-charcoal">References</h2>
          <ul className="space-y-1">
            {doc.references.map((ref) => (
              <li key={ref.href}>
                <a
                  href={ref.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-ui-gold-dark hover:underline"
                >
                  {ref.label} &rarr;
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
