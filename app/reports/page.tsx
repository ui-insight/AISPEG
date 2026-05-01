import Link from "next/link";
import {
  artifacts,
  featuredArtifact,
  nonFeaturedArtifacts,
  kindLabel,
  type Artifact,
  type ArtifactKind,
} from "@/lib/artifacts";

export const metadata = {
  title: "Reports · Institutional AI Initiative",
  description:
    "Activity reports, executive briefs, and presentations from IIDS and partner leadership.",
};

const kindStyles: Record<ArtifactKind, string> = {
  "activity-report": "bg-ui-gold/15 text-ui-gold-dark",
  brief: "bg-blue-100 text-blue-800",
  deck: "bg-violet-100 text-violet-800",
  presentation: "bg-emerald-100 text-emerald-800",
};

function ExternalIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-10h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const isExternal = !!artifact.external;
  const cardInner = (
    <article className="group relative h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${kindStyles[artifact.kind]}`}
        >
          {kindLabel(artifact.kind)}
        </span>
        <span className="text-xs text-gray-400">{artifact.dateLabel}</span>
      </div>

      <h2 className="mt-3 text-lg font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
        {artifact.title}
        {isExternal && (
          <span className="ml-1 inline-flex translate-y-px text-gray-400">
            <ExternalIcon />
          </span>
        )}
      </h2>
      {artifact.subtitle && (
        <p className="mt-1 text-sm font-medium text-ui-gold-dark">
          {artifact.subtitle}
        </p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        By {artifact.author} · Audience: {artifact.audience}
        {artifact.duration && ` · ${artifact.duration}`}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {artifact.abstract}
      </p>

      {artifact.tags && artifact.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {artifact.tags.map((t) => (
            <span
              key={t}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );

  if (isExternal) {
    return (
      <a
        href={artifact.href}
        target="_blank"
        rel="noopener noreferrer"
        className="unstyled block h-full"
      >
        {cardInner}
      </a>
    );
  }
  return (
    <Link href={artifact.href} className="unstyled block h-full">
      {cardInner}
    </Link>
  );
}

function FeaturedHero({ artifact }: { artifact: Artifact }) {
  const isExternal = !!artifact.external;
  const inner = (
    <article className="group relative rounded-xl border border-gray-200 bg-gradient-to-br from-ui-charcoal to-ui-charcoal/90 p-7 text-white shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="rounded-full bg-ui-gold/20 px-2.5 py-0.5 text-xs font-medium text-ui-gold">
          {artifact.subtitle ?? kindLabel(artifact.kind)}
        </span>
        <span className="text-xs text-white/60">{artifact.dateLabel}</span>
      </div>
      <h2 className="mt-3 text-xl font-semibold leading-snug !text-white group-hover:!text-ui-gold">
        {artifact.title}
        {isExternal && (
          <span className="ml-1 inline-flex translate-y-px text-white/60">
            <ExternalIcon />
          </span>
        )}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">
        {artifact.abstract}
      </p>
      <p className="mt-4 text-sm font-medium text-ui-gold group-hover:underline">
        Read the full report &rarr;
      </p>
    </article>
  );

  if (isExternal) {
    return (
      <a
        href={artifact.href}
        target="_blank"
        rel="noopener noreferrer"
        className="unstyled block"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={artifact.href} className="unstyled block">
      {inner}
    </Link>
  );
}

export default function ReportsPage() {
  const featured = featuredArtifact();
  const rest = nonFeaturedArtifacts();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Reports</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Activity reports, executive briefs, and presentations from IIDS
          and partner leadership. Reverse-chronological.
        </p>
      </div>

      {/* Featured */}
      {featured && <FeaturedHero artifact={featured} />}

      {/* Timeline */}
      {rest.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Earlier
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {rest.map((a) => (
              <ArtifactCard key={a.slug} artifact={a} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state — only renders if no artifacts at all */}
      {artifacts.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-gray-500">
            No artifacts published yet. Add entries to{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
              lib/artifacts.ts
            </code>
            .
          </p>
        </div>
      )}
    </div>
  );
}
