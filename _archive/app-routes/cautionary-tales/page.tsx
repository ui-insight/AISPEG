import Link from "next/link";
import { cautionaryTales, type CautionaryTale } from "@/lib/data";

export const metadata = {
  title: "Cautionary Tales · AISPEG",
  description:
    "External events informing AISPEG's institutional posture on AI-assisted development and governance.",
};

export default function CautionaryTalesPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-brand-black">
          Cautionary tales
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          External events that inform AISPEG&apos;s institutional posture on
          AI-assisted development. Each entry is a public incident or trend
          report chosen because it clarifies — by counter-example — why UI&apos;s
          governance layer (named owners, review gates, audit trails, baked-in
          security) is load-bearing rather than decorative.
        </p>
      </div>

      {cautionaryTales.map((tale) => (
        <TaleSection key={tale.id} tale={tale} />
      ))}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Know of an event we should add here?{" "}
          <Link
            href="/builder-guide"
            className="font-medium text-brand-black underline decoration-clearwater underline-offset-4 hover:decoration-2"
          >
            Submit it through the ingestion portal
          </Link>{" "}
          with a note that it&apos;s a cautionary tale.
        </p>
      </div>
    </div>
  );
}

function TaleSection({ tale }: { tale: CautionaryTale }) {
  return (
    <article className="space-y-6 border-t border-gray-200 pt-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold-dark">
          A cautionary tale &middot; {tale.source.date}
        </p>
        <h2 className="mt-2 text-2xl font-black text-brand-black">
          {tale.title}
        </h2>
        <p className="mt-2 max-w-3xl text-base text-gray-700">{tale.summary}</p>
      </header>

      {/* Source citation */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Source
        </p>
        <p className="mt-1 text-sm text-brand-black">
          <a
            href={tale.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-black underline decoration-clearwater underline-offset-4 hover:decoration-2"
          >
            &ldquo;{tale.source.headline}&rdquo;
          </a>
          <br />
          <span className="text-gray-600">
            {tale.source.author} &middot; {tale.source.outlet} &middot;{" "}
            {tale.source.date}
          </span>
        </p>
      </div>

      {/* Key stats */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          By the numbers
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tale.keyStats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <p className="text-3xl font-black text-brand-black">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      {tale.keyQuote && (
        <blockquote className="rounded-xl border-l-0 border-t-4 border-brand-gold bg-brand-gold/5 p-6">
          <p className="text-lg italic leading-relaxed text-brand-black">
            &ldquo;{tale.keyQuote}&rdquo;
          </p>
          <footer className="mt-3 text-sm text-gray-600">
            &mdash; {tale.source.outlet}, {tale.source.date}
          </footer>
        </blockquote>
      )}

      {/* What happened / Why it matters */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            What happened
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            {tale.whatHappened}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Why it matters for UI
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            {tale.whyItMatters}
          </p>
        </div>
      </div>

      {/* How AISPEG differs */}
      <div className="rounded-xl border border-brand-gold bg-brand-gold/5 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold-dark">
          How AISPEG&apos;s posture differs
        </h3>
        <ul className="mt-3 space-y-2">
          {tale.howAispegDiffers.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm leading-relaxed text-brand-black"
            >
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
