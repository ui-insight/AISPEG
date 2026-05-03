import Link from "next/link";
import type { ApplicationWithBlockers, Blocker } from "@/lib/work";
import { blockerCategoryLabels, daysSince } from "@/lib/work";

const statusStyles: Record<string, string> = {
  Production: "bg-green-100 text-green-800",
  Piloting: "bg-blue-100 text-blue-800",
  Prototype: "bg-amber-100 text-amber-800",
  Planned: "bg-gray-100 text-gray-700",
  Tracked: "bg-brand-huckleberry/10 text-brand-huckleberry",
  Archived: "bg-gray-100 text-gray-500",
};

const visibilityNote: Record<"public" | "embargoed" | "internal", string | null> = {
  public: null,
  embargoed: "Embargoed",
  internal: "Internal",
};

const ai4raChip: Record<string, string | undefined> = {
  Core: "AI4RA Core",
  Adjacent: "AI4RA Adjacent",
  Reference: "AI4RA Reference",
};

const severityStyles: Record<"low" | "medium" | "high", string> = {
  low: "border-gray-200 bg-gray-50 text-gray-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-800",
};

function BlockerChip({
  blocker,
  audience,
}: {
  blocker: Blocker;
  audience: "public" | "internal";
}) {
  const days = daysSince(blocker.since);
  const label = blockerCategoryLabels[blocker.category] ?? blocker.category;
  const partySuffix = blocker.namedParty ? ` · ${blocker.namedParty}` : "";
  const detail =
    audience === "internal" && blocker.internalText
      ? blocker.internalText
      : blocker.publicText;

  return (
    <div
      className={`relative z-10 rounded-md border px-2.5 py-1.5 text-xs ${severityStyles[blocker.severity]}`}
    >
      <p className="font-medium">
        {label}
        {partySuffix} · day {days}
      </p>
      {detail && (
        <p className="mt-0.5 leading-snug opacity-80">{detail}</p>
      )}
    </div>
  );
}

export default function PortfolioCard({
  app,
  audience = "public",
  basePath = "/portfolio",
}: {
  app: ApplicationWithBlockers;
  audience?: "public" | "internal";
  basePath?: string;
}) {
  const owners = app.operationalOwners
    .map((o) => o.name)
    .slice(0, 2)
    .join(", ");
  const extraOwners =
    app.operationalOwners.length > 2
      ? ` +${app.operationalOwners.length - 2}`
      : "";

  const liveHost = app.liveUrl ? hostnameOf(app.liveUrl) : null;
  const ai4raLabel = ai4raChip[app.ai4raRelationship];

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-hairline bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-brand-black">
            <Link
              href={`${basePath}/${app.slug}`}
              className="unstyled before:absolute before:inset-0"
            >
              {app.name}
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
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            statusStyles[app.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {app.status}
        </span>
      </div>

      {app.tagline && (
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          {app.tagline}
        </p>
      )}

      {app.activeBlockers.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {app.activeBlockers.map((b) => (
            <BlockerChip key={b.id} blocker={b} audience={audience} />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ai4raLabel && (
          <span className="rounded-full border border-brand-lupine/30 bg-brand-lupine/10 px-2 py-0.5 text-xs font-semibold text-brand-lupine">
            {ai4raLabel}
          </span>
        )}
        {app.dualDestinyPlanned && (
          <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
            Dual destiny
          </span>
        )}
        {app.tags.includes("diffusion") && (
          <span className="rounded-full border border-brand-clearwater/40 bg-brand-clearwater/10 px-2 py-0.5 text-xs font-medium text-brand-clearwater">
            Capability diffusion
          </span>
        )}
        {app.externalDeployments.length > 0 && (
          <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
            Also at {app.externalDeployments.join(", ")}
          </span>
        )}
        {app.trackingOnly && (
          <span className="rounded-full border border-brand-huckleberry/30 bg-brand-huckleberry/10 px-2 py-0.5 text-xs font-medium text-brand-huckleberry">
            Tracked (not built by IIDS)
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-gray-500">
        {visibilityNote[app.visibilityTier] && (
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
            {visibilityNote[app.visibilityTier]}
          </span>
        )}
        {app.institutionalReviewStatus === "Under OIT review" && (
          <span className="font-medium text-amber-700">Under OIT review</span>
        )}
        {app.institutionalReviewStatus === "OIT-endorsed" && (
          <span className="font-medium text-green-700">OIT-endorsed</span>
        )}
        {app.funding && (
          <span className="truncate font-medium text-gray-600">
            {app.funding}
          </span>
        )}
      </div>

      {app.liveUrl && liveHost && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <a
            href={app.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit the live site for ${app.name} at ${liveHost}`}
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
