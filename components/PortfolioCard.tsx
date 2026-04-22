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

  return (
    <Link
      href={`/portfolio/${intervention.slug}`}
      className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ui-charcoal group-hover:text-ui-gold-dark transition-colors">
            {intervention.name}
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

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {intervention.tagline}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ai4raChip[intervention.ai4raRelationship] && (
          <span className="rounded-full border border-ui-gold/30 bg-ui-gold/10 px-2 py-0.5 text-xs font-medium text-ui-gold-dark">
            {ai4raChip[intervention.ai4raRelationship]}
          </span>
        )}
        {intervention.dualDestinyPlanned && (
          <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
            Dual destiny
          </span>
        )}
        {intervention.tags?.includes("diffusion") && (
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            Capability diffusion
          </span>
        )}
        {intervention.externalDeployments?.length ? (
          <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
            Also at {intervention.externalDeployments.join(", ")}
          </span>
        ) : null}
        {intervention.trackingOnly && (
          <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
            Tracked (not built by AISPEG)
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-gray-400">
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
          <span className="text-amber-700">Under OIT review</span>
        )}
        {intervention.institutionalReviewStatus === "OIT-endorsed" && (
          <span className="text-green-700">OIT-endorsed</span>
        )}
        {intervention.funding && (
          <span className="truncate text-ui-gold-dark">{intervention.funding}</span>
        )}
      </div>
    </Link>
  );
}
