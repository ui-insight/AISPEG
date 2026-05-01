import Link from "next/link";
import PortfolioCard from "@/components/PortfolioCard";
import {
  getPubliclyVisible,
  groupByHomeUnit,
  interventions,
} from "@/lib/portfolio";

export default function PortfolioPage() {
  const visible = getPubliclyVisible();
  const groups = groupByHomeUnit(visible);
  const internalCount = interventions.length - visible.length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">
          AI Interventions for Operational Excellence
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          A growing inventory of AI-powered efforts across University of Idaho
          units — some built by IIDS, others led by partner units. Each entry
          names a{" "}
          <span className="font-medium text-ui-charcoal">UI home unit</span>{" "}
          and{" "}
          <span className="font-medium text-ui-charcoal">
            operational owner
          </span>{" "}
          whose work depends on the intervention — the people accountable for
          the outcome, not the code.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          {visible.length} interventions visible
          {internalCount > 0 ? ` · ${internalCount} internal-only (not listed publicly)` : ""}
          {" · "}
          <Link href="/builder-guide" className="text-ui-gold-dark hover:underline">
            Submit a new AI project &rarr;
          </Link>
        </p>
      </div>

      {/* Context callout — how to read the inventory */}
      <div className="rounded-xl border-l-4 border-ui-gold bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">How to read this inventory</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Interventions are grouped by <strong>UI home unit</strong>. Each card
          shows the operational owner, current status, and tags —{" "}
          <span className="inline-block rounded-full border border-ui-gold/30 bg-ui-gold/10 px-2 py-0.5 text-xs font-medium text-ui-gold-dark">
            AI4RA Core
          </span>{" "}
          means the work is part of our NSF-funded UI+SUU partnership and has a
          dual open-source / UI-implementation identity;{" "}
          <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            Capability diffusion
          </span>{" "}
          flags interventions where a non-IIDS UI unit is co-building; {" "}
          <span className="inline-block rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
            Tracked
          </span>{" "}
          means the work is in the inventory but is not built by IIDS.
        </p>
      </div>

      {/* Groups by home unit */}
      {groups.map(({ unit, items }) => (
        <section key={unit} className="space-y-4">
          <div className="border-l-4 border-ui-gold pl-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-bold text-ui-charcoal">{unit}</h2>
              <span className="text-sm text-gray-500">
                {items.length} {items.length === 1 ? "intervention" : "interventions"}
              </span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((i) => (
              <PortfolioCard key={i.slug} intervention={i} />
            ))}
          </div>
        </section>
      ))}

      {/* AI4RA pointer */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          About AI4RA
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          <span className="font-semibold text-ui-charcoal">AI4RA</span> is a
          UI + Southern Utah University NSF GRANTED partnership producing
          open-source reference tools for research administration. Its
          projects — the UDM spec, prompt library, evaluation harness — are
          reference material, not UI interventions.
        </p>
        <p className="mt-2 text-sm">
          <Link
            href="/ai4ra-ecosystem"
            className="font-medium text-ui-gold-dark hover:underline"
          >
            See the AI4RA ecosystem &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
