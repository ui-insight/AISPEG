import Link from "next/link";
import type {
  Intervention,
  InterventionStatus,
  Visibility,
  AI4RARelationship,
} from "@/lib/portfolio";

const statusStyles: Record<InterventionStatus, string> = {
  Production: "bg-green-100 text-green-800",
  Piloting: "bg-blue-100 text-blue-800",
  Prototype: "bg-amber-100 text-amber-800",
  Planned: "bg-gray-100 text-gray-700",
  Tracked: "bg-violet-100 text-violet-800",
  Archived: "bg-gray-100 text-gray-500",
};

const visibilityNote: Record<Visibility, string | null> = {
  Public: null,
  Partial: "Embargoed",
  "Internal-only": "Internal",
};

const ai4raChip: Partial<Record<AI4RARelationship, string>> = {
  Core: "AI4RA Core",
  Adjacent: "AI4RA Adjacent",
  Reference: "AI4RA Reference",
};

export default function PortfolioCard({
  intervention,
}: {
  intervention: Intervention;
}) {
  const owners = intervention.operationalOwners
    .map((o) => o.name)
    .slice(0, 2)
    .join(", ");
  const extraOwners =
    intervention.operationalOwners.length > 2
      ? ` +${intervention.operationalOwners.length - 2}`
      : "";

  const liveHost = intervention.liveUrl
    ? hostnameOf(intervention.liveUrl)
    : null;

  return (
    // Stretched-link pattern: whole card is clickable via the title's
    // ::before overlay; the live-site anchor uses z-10 to stay clickable
    // on top of the overlay without nesting anchors.
    <article className="group relative flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-brand-gold hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-brand-black group-hover:text-brand-gold-dark transition-colors">
            <Link
              href={`/portfolio/${intervention.slug}`}
              className="unstyled before:absolute before:inset-0"
            >
              {intervention.name}
            </Link>
          </h3>
          {owners && (
            <p className="mt-0.5 text-xs text-gray-500">
              {owners}
              {extraOwners}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[intervention.status]}`}
        >
          {intervention.status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        {intervention.tagline}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ai4raChip[intervention.ai4raRelationship] && (
          <span className="rounded-full border border-brand-gold bg-brand-gold/15 px-2 py-0.5 text-xs font-semibold text-brand-gold-dark">
            {ai4raChip[intervention.ai4raRelationship]}
          </span>
        )}
        {intervention.dualDestinyPlanned && (
          <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
            Dual destiny
          </span>
        )}
        {intervention.tags?.includes("diffusion") && (
          <span className="rounded-full border border-brand-clearwater/40 bg-brand-clearwater/10 px-2 py-0.5 text-xs font-medium text-brand-clearwater">
            Capability diffusion
          </span>
        )}
        {intervention.externalDeployments?.length ? (
          <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
            Also at {intervention.externalDeployments.join(", ")}
          </span>
        ) : null}
        {intervention.trackingOnly && (
          <span className="rounded-full border border-brand-huckleberry/30 bg-brand-huckleberry/10 px-2 py-0.5 text-xs font-medium text-brand-huckleberry">
            Tracked (not built by AISPEG)
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-gray-500">
        {visibilityNote[intervention.visibility] && (
          <span className="inline-flex items-center gap-1 rounded border border-gray-200 px-1.5 py-0.5">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            {visibilityNote[intervention.visibility]}
          </span>
        )}
        {intervention.institutionalReviewStatus === "Under OIT review" && (
          <span className="font-medium text-amber-700">Under OIT review</span>
        )}
        {intervention.institutionalReviewStatus === "OIT-endorsed" && (
          <span className="font-medium text-green-700">OIT-endorsed</span>
        )}
        {intervention.funding && (
          <span className="truncate font-medium text-brand-gold-dark">
            {intervention.funding}
          </span>
        )}
      </div>

      {intervention.liveUrl && liveHost && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <a
            href={intervention.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit the live site for ${intervention.name} at ${liveHost}`}
            className="unstyled relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-clearwater hover:text-brand-black"
          >
            <LiveDot />
            Live · {liveHost}
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
          </a>
        </div>
      )}
    </article>
  );
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function LiveDot() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-clearwater"
    />
  );
}
