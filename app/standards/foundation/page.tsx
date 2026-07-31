import type { Metadata } from "next";
import {
  ASSURANCE_DIMENSIONS,
  ASSURANCE_LEVELS,
  CONFIDENCE_LABELS,
  EVIDENCE_ARTIFACTS,
  EVIDENCE_HIERARCHY,
  FOUNDATION_DEFINITIONS,
  FOUNDATION_TEMPLATE_LINKS,
  PROVISIONAL_DEFAULT_PROCESS,
  THREAT_MODEL_SECTIONS,
  foundationSummary,
} from "@/lib/standards-foundation";
import {
  SOURCE_AUTHORITY_LABELS,
  standardsSourceById,
} from "@/lib/standards-drafts";

export const metadata: Metadata = {
  title: "Standards Foundation",
  description:
    "Definitions, assurance profiles, evidence instruments, and provisional-default rules supporting the proposed University technology standards.",
};

const sectionLinks = [
  { href: "#evidence", label: "Evidence" },
  { href: "#assurance", label: "Assurance" },
  { href: "#definitions", label: "Definitions" },
  { href: "#threat-model", label: "Threat model" },
  { href: "#artifacts", label: "Artifacts" },
  { href: "#defaults", label: "Defaults" },
] as const;

function SourceLinks({ sourceIds }: { sourceIds: readonly string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
      {sourceIds.map((sourceId) => {
        const source = standardsSourceById.get(sourceId);
        if (!source) throw new Error(`Unknown foundation source: ${sourceId}`);
        return (
          <a
            key={source.id}
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-brand-black"
          >
            {source.shortLabel}
          </a>
        );
      })}
    </span>
  );
}

export default function StandardsFoundationPage() {
  const summary = foundationSummary();
  const usedSourceIds = new Set([
    ...EVIDENCE_HIERARCHY.flatMap((tier) => tier.sourceIds ?? []),
    ...FOUNDATION_DEFINITIONS.flatMap((definition) => definition.sourceIds),
  ]);
  const sources = [...usedSourceIds]
    .map((sourceId) => standardsSourceById.get(sourceId))
    .filter((source) => source !== undefined);

  return (
    <div className="space-y-16 pb-12">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Working reference — not yet University policy
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-brand-black sm:text-4xl">
          The definitions and instruments behind the standards
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          This foundation supplies the terms, risk profiles, templates, and
          evidence rules needed to assess the twenty proposed standards without
          relying on undocumented institutional knowledge. Where stronger
          authority does not determine an answer, it publishes a measurable
          provisional default and the reasoning behind it.
        </p>
      </header>

      <section className="bg-brand-black px-5 py-6 text-white sm:px-8 sm:py-8">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">
          Usable now; designed to be superseded cleanly
        </p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] lg:gap-12">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              A complete starting position, not a claim of final authority
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-200">
              {summary.definitions} controlled definitions, {summary.assuranceDimensions}{" "}
              assurance dimensions, {summary.threatModelSections} threat-model
              sections, and {summary.evidenceArtifacts} evidence artifacts turn
              broad best practice into reviewable work. Each may be refined when
              institutional evidence or an authorized decision becomes available.
            </p>
          </div>
          <div className="border-t border-gray-700 pt-4 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            <p className="text-sm font-semibold text-white">Escalation rule</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              Stronger authority always wins: law and policy outrank consensus,
              sector practice, implementation guidance, and first-principles
              defaults.
            </p>
          </div>
        </div>
      </section>

      <nav
        aria-label="Foundation sections"
        className="overflow-x-auto border-y border-hairline py-3"
      >
        <ul className="flex min-w-max gap-6">
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm font-semibold text-brand-black">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="evidence" className="scroll-mt-28" aria-labelledby="evidence-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(15rem,0.55fr)_minmax(0,1.45fr)] lg:gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              Evidence hierarchy
            </p>
            <h2 id="evidence-heading" className="mt-2 text-2xl font-black tracking-tight text-brand-black">
              Every claim shows what kind of authority supports it
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              A useful standard can combine several kinds of evidence, but it
              must not make implementation guidance look like law or a local
              judgment look like external consensus.
            </p>
          </div>
          <ol className="divide-y divide-hairline border-y border-hairline">
            {EVIDENCE_HIERARCHY.map((tier) => (
              <li key={tier.rank} className="grid gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)]">
                <span className="font-mono text-sm font-bold text-brand-huckleberry">
                  {tier.rank.toString().padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-base font-black text-brand-black">{tier.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{tier.use}</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-black">
                    {tier.treatment}
                  </p>
                  {tier.sourceIds && (
                    <p className="mt-2">
                      <SourceLinks sourceIds={tier.sourceIds} />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="assurance" className="scroll-mt-28" aria-labelledby="assurance-heading">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Application Assurance Profile
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="assurance-heading" className="text-2xl font-black tracking-tight text-brand-black">
              The highest trigger determines the minimum level
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
              Levels are not averaged. A single Level 3 trigger makes Level 3
              the minimum until an assessor documents why the trigger does not
              apply or an authorized exception changes the decision.
            </p>
          </div>
          <a
            href="/templates/application-assurance-profile.md"
            download
            className="rounded bg-brand-gold px-4 py-2 text-sm font-bold text-brand-black no-underline hover:bg-brand-gold-light"
          >
            Download profile template
          </a>
        </div>

        <div className="mt-8 grid gap-px border border-hairline bg-hairline lg:grid-cols-3">
          {ASSURANCE_LEVELS.map((level) => (
            <article key={level.level} className="bg-white p-5 sm:p-6">
              <p className="font-mono text-xs font-bold text-brand-huckleberry">
                LEVEL {level.level}
              </p>
              <h3 className="mt-2 text-lg font-black text-brand-black">{level.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{level.defaultUse}</p>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-brand-silver">
                Minimum evidence
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-muted marker:text-brand-gold-dark">
                {level.minimumEvidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-brand-black">
                <strong>Verification:</strong> {level.verification}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-y border-hairline bg-surface-alt">
                <th className="px-3 py-3 font-bold text-brand-black">Dimension</th>
                <th className="px-3 py-3 font-bold text-brand-black">Question</th>
                <th className="px-3 py-3 font-bold text-brand-black">Level 2 trigger</th>
                <th className="px-3 py-3 font-bold text-brand-black">Level 3 trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {ASSURANCE_DIMENSIONS.map((dimension) => (
                <tr key={dimension.id} className="align-top">
                  <th className="px-3 py-4 font-semibold text-brand-black">{dimension.label}</th>
                  <td className="px-3 py-4 leading-relaxed text-ink-muted">{dimension.question}</td>
                  <td className="px-3 py-4 leading-relaxed text-ink-muted">{dimension.level2Trigger}</td>
                  <td className="px-3 py-4 leading-relaxed text-ink-muted">{dimension.level3Trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="definitions" className="scroll-mt-28" aria-labelledby="definitions-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(15rem,0.55fr)_minmax(0,1.45fr)] lg:gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              Controlled glossary
            </p>
            <h2 id="definitions-heading" className="mt-2 text-2xl font-black tracking-tight text-brand-black">
              Terms that change an assessment result
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              These are operational definitions. Each includes a decision rule,
              examples, evidence basis, and confidence so assessors do not have
              to invent meaning independently.
            </p>
          </div>
          <div className="divide-y divide-hairline border-y border-hairline">
            {FOUNDATION_DEFINITIONS.map((definition) => (
              <details key={definition.id} id={definition.id} className="group scroll-mt-28 py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block text-base font-black text-brand-black">{definition.term}</span>
                    <span className="mt-1 block text-xs text-ink-muted">
                      {CONFIDENCE_LABELS[definition.confidence]} · used by {definition.relatedStandards.join(", ").toUpperCase()}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-xl font-light text-brand-silver transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
                </summary>
                <div className="pb-5 pr-8">
                  <p className="max-w-3xl text-sm leading-relaxed text-brand-black">{definition.definition}</p>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
                    <strong className="text-brand-black">Decision rule:</strong> {definition.decisionRule}
                  </p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-silver">Examples</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {definition.examples.map((example) => (
                      <li key={example} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{example}</li>
                    ))}
                  </ul>
                  <p className="mt-4"><SourceLinks sourceIds={definition.sourceIds} /></p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="threat-model" className="scroll-mt-28" aria-labelledby="threat-model-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">Reusable instrument</p>
            <h2 id="threat-model-heading" className="mt-2 text-2xl font-black tracking-tight text-brand-black">Threat model: the minimum complete record</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">
              Level 1 uses this as a short attack-surface review. Levels 2 and 3
              complete every section, with depth proportional to plausible harm.
            </p>
          </div>
          <a href="/templates/threat-model.md" download className="rounded bg-brand-gold px-4 py-2 text-sm font-bold text-brand-black no-underline hover:bg-brand-gold-light">Download threat-model template</a>
        </div>
        <ol className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
          {THREAT_MODEL_SECTIONS.map((section, index) => (
            <li key={section.id} className="bg-white p-5">
              <p className="font-mono text-xs font-bold text-brand-huckleberry">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-base font-black text-brand-black">{section.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{section.prompt}</p>
              <p className="mt-3 text-xs leading-relaxed text-brand-black"><strong>Acceptable evidence:</strong> {section.acceptableEvidence}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="artifacts" className="scroll-mt-28" aria-labelledby="artifacts-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(15rem,0.55fr)_minmax(0,1.45fr)] lg:gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">Evidence catalog</p>
            <h2 id="artifacts-heading" className="mt-2 text-2xl font-black tracking-tight text-brand-black">What acceptable evidence must contain</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">A filename is not evidence by itself. Each artifact has minimum contents and a freshness rule tied to the assessed version and environment.</p>
          </div>
          <div className="divide-y divide-hairline border-y border-hairline">
            {EVIDENCE_ARTIFACTS.map((artifact) => (
              <details key={artifact.id} id={artifact.id} className="group scroll-mt-28 py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block text-base font-black text-brand-black">{artifact.name}</span>
                    <span className="mt-1 block text-xs text-ink-muted">Freshness: {artifact.freshness}</span>
                  </span>
                  <span aria-hidden="true" className="text-xl font-light text-brand-silver transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
                </summary>
                <div className="pb-5 pr-8">
                  <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">{artifact.purpose}</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-silver">Minimum contents</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted marker:text-brand-gold-dark">
                    {artifact.minimumContents.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="defaults" className="scroll-mt-28" aria-labelledby="defaults-heading">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">Provisional-default method</p>
        <h2 id="defaults-heading" className="mt-2 text-2xl font-black tracking-tight text-brand-black">How to decide when no authoritative definition exists</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">The absence of institutional documentation becomes an explicit standards-design task—not an indefinite dependency.</p>
        <ol className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {PROVISIONAL_DEFAULT_PROCESS.map((item) => (
            <li key={item.step} className="bg-white p-5">
              <p className="font-mono text-xs font-bold text-brand-huckleberry">STEP {item.step}</p>
              <h3 className="mt-2 text-base font-black text-brand-black">{item.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.requirement}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="templates-heading" className="border-y border-hairline py-8">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">Working files</p>
        <h2 id="templates-heading" className="mt-2 text-xl font-black tracking-tight text-brand-black">Start with an instrument, not a blank page</h2>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
          {FOUNDATION_TEMPLATE_LINKS.map((template) => (
            <a key={template.href} href={template.href} download className="text-sm font-semibold text-brand-black">{template.label} ↓</a>
          ))}
        </div>
      </section>

      <section aria-labelledby="foundation-sources-heading">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">Provenance</p>
        <h2 id="foundation-sources-heading" className="mt-2 text-xl font-black tracking-tight text-brand-black">Sources used by this foundation</h2>
        <ul className="mt-5 divide-y divide-hairline border-y border-hairline">
          {sources.map((source) => (
            <li key={source.id} className="grid gap-2 py-4 sm:grid-cols-[minmax(12rem,0.55fr)_minmax(0,1.45fr)] sm:gap-6">
              <div>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-black">{source.title}</a>
                <p className="mt-1 text-xs text-ink-subtle">{source.publisher} · {SOURCE_AUTHORITY_LABELS[source.authority]}</p>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">{source.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
