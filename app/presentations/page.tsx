import Link from "next/link";
import { decks } from "@/lib/decks";

export default function PresentationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Presentations</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Interactive slide decks built with reveal.js. Each deck is a
          live, navigable presentation &mdash; not a PDF export. Use arrow
          keys to navigate, press <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs">F</kbd> for fullscreen, <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs">Esc</kbd> for overview.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Looking for written briefs and reports?{" "}
          <Link href="/reports" className="text-ui-gold-dark hover:underline">
            Reports &amp; Briefs &rarr;
          </Link>
        </p>
      </div>

      {decks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-gray-500">
            No decks are currently published. A new presentation is in
            development &mdash; check back soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {decks.map((deck) => (
            <Link
              key={deck.slug}
              href={`/presentations/${deck.slug}`}
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ui-gold-dark">
                    {deck.audience}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
                    {deck.title}
                  </h2>
                  {deck.subtitle && (
                    <p className="mt-1 text-sm text-gray-500">{deck.subtitle}</p>
                  )}
                </div>
                <StatusBadge status={deck.status} />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {deck.abstract}
              </p>

              <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-gray-500">
                <span>{deck.author}</span>
                <span>&middot;</span>
                <span>{deck.date}</span>
                {deck.duration && (
                  <>
                    <span>&middot;</span>
                    <span>{deck.duration}</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Draft: "bg-amber-100 text-amber-800",
    Ready: "bg-green-100 text-green-800",
    Delivered: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}
