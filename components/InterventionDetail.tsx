import Link from "next/link";
import type { ApplicationWithBlockers, Blocker } from "@/lib/work";
import { blockerCategoryLabels, daysSince } from "@/lib/work";

const statusStyles: Record<string, string> = {
  Production: "bg-green-100 text-green-800",
  Piloting: "bg-blue-100 text-blue-800",
  Prototype: "bg-amber-100 text-amber-800",
  Planned: "bg-gray-100 text-gray-700",
  Tracked: "bg-violet-100 text-violet-800",
  Archived: "bg-gray-100 text-gray-500",
};

const severityStyles: Record<"low" | "medium" | "high", string> = {
  low: "border-gray-200 bg-gray-50 text-gray-700",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  high: "border-red-200 bg-red-50 text-red-900",
};

function StatusBadge({ status }: { status: string }) {
  const cls = statusStyles[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function OwnershipBlock({
  label,
  values,
  emptyText,
}: {
  label: string;
  values: string[];
  emptyText?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      {values.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm text-ui-charcoal">
          {values.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm italic text-gray-400">
          {emptyText || "—"}
        </p>
      )}
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.86 10.92c.58.1.78-.25.78-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.12-3.04 0 0 .97-.31 3.18 1.17a11 11 0 015.78 0C17.27 4.62 18.24 4.93 18.24 4.93c.63 1.58.24 2.75.12 3.04.73.8 1.18 1.82 1.18 3.08 0 4.43-2.7 5.41-5.27 5.69.41.36.77 1.06.77 2.15v3.19c0 .31.2.67.79.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"
      />
    </svg>
  );
}

function ActiveBlockerRow({
  blocker,
  audience,
}: {
  blocker: Blocker;
  audience: "public" | "internal";
}) {
  const days = daysSince(blocker.since);
  const label = blockerCategoryLabels[blocker.category] ?? blocker.category;
  const detail =
    audience === "internal" && blocker.internalText
      ? blocker.internalText
      : blocker.publicText;

  return (
    <article
      className={`rounded-md border px-4 py-3 ${severityStyles[blocker.severity]}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">
          {label}
          {blocker.namedParty ? ` · ${blocker.namedParty}` : ""}
        </p>
        <p className="text-xs">
          Day {days} · since {blocker.since}
        </p>
      </div>
      {detail && (
        <p className="mt-1 text-sm leading-relaxed">{detail}</p>
      )}
      {audience === "internal" && blocker.publicText && blocker.internalText && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer opacity-70">
            Public-facing version of this entry
          </summary>
          <p className="mt-1 leading-relaxed opacity-80">
            {blocker.publicText}
          </p>
        </details>
      )}
    </article>
  );
}

interface RelatedApp {
  slug: string;
  name: string;
  tagline: string | null;
}

export interface InterventionDetailProps {
  app: ApplicationWithBlockers;
  related: RelatedApp[];
  audience: "public" | "internal";
  basePath: string; // "/portfolio" or "/internal/portfolio"
}

export default function InterventionDetail({
  app,
  related,
  audience,
  basePath,
}: InterventionDetailProps) {
  const isEmbargoed = app.visibilityTier === "embargoed";
  const isInternal = app.visibilityTier === "internal";

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href={basePath} className="hover:text-ui-gold-dark">
          {audience === "internal" ? "Internal portfolio" : "Portfolio"}
        </Link>
        {app.homeUnits[0] && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gray-400">{app.homeUnits[0]}</span>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">{app.name}</span>
      </nav>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={app.status} />
          {app.ai4raRelationship !== "None" && (
            <span className="rounded-full border border-ui-gold/30 bg-ui-gold/10 px-2.5 py-0.5 text-xs font-medium text-ui-gold-dark">
              AI4RA {app.ai4raRelationship}
            </span>
          )}
          {app.dualDestinyPlanned && (
            <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600">
              Dual destiny (OSS + UI)
            </span>
          )}
          {app.tags.includes("diffusion") && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Capability diffusion
            </span>
          )}
          {app.institutionalReviewStatus === "Under OIT review" && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs text-amber-800">
              Under OIT review
            </span>
          )}
          {app.trackingOnly && (
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
              Tracked — not built by IIDS
            </span>
          )}
          {audience === "internal" && (
            <span className="rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              Visibility: {app.visibilityTier}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold text-ui-charcoal">{app.name}</h1>
        {app.tagline && (
          <p className="mt-2 text-lg text-gray-600">{app.tagline}</p>
        )}
        {app.funding && (
          <p className="mt-2 text-sm font-medium text-ui-gold-dark">
            {app.funding}
          </p>
        )}
      </div>

      {/* Embargo notice for embargoed visibility (public view) */}
      {audience === "public" && isEmbargoed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">
            UI deployment details embargoed
          </p>
          <p className="mt-1 text-sm text-amber-800">
            This intervention exists in the inventory, but specific details
            about UI&apos;s operational deployment (pilot scope, timelines, or
            configuration) are held back from the public site. Contact the
            operational owner for authorized access.
          </p>
        </div>
      )}

      {/* Internal-only banner (only reachable on /internal) */}
      {audience === "internal" && isInternal && (
        <div className="rounded-xl border border-brand-huckleberry/30 bg-brand-huckleberry/10 p-5">
          <p className="text-sm font-semibold text-brand-huckleberry">
            Internal-only record
          </p>
          <p className="mt-1 text-sm text-brand-huckleberry/90">
            This intervention is not visible on the public portfolio. Visible
            here because you&apos;re authenticated to the internal view.
          </p>
        </div>
      )}

      {/* Active blockers (friction ledger) */}
      {app.activeBlockers.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ui-charcoal">
            Active blockers
          </h2>
          <div className="space-y-2">
            {app.activeBlockers.map((b) => (
              <ActiveBlockerRow key={b.id} blocker={b} audience={audience} />
            ))}
          </div>
          {audience === "public" && (
            <p className="mt-3 text-xs text-gray-500">
              Showing public-safe detail. Sharper detail (named individuals,
              contact history) lives on the internal view.
            </p>
          )}
        </div>
      )}

      {/* Ownership */}
      <div className="grid gap-4 md:grid-cols-3">
        <OwnershipBlock label="Home unit(s)" values={app.homeUnits} />
        <OwnershipBlock
          label={
            app.operationalOwners.length === 1
              ? "Operational owner"
              : "Operational owners"
          }
          values={app.operationalOwners.map((o) =>
            o.title ? `${o.name} (${o.title})` : o.name
          )}
          emptyText={app.trackingOnly ? "Awaiting contact with unit" : undefined}
        />
        <OwnershipBlock
          label="Build participants"
          values={app.buildParticipants}
        />
      </div>

      {/* Links */}
      {(app.repoUrl || app.docsUrl || app.liveUrl) && (
        <div className="flex flex-wrap gap-3">
          {app.repoUrl && (
            <a
              href={app.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-ui-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-ui-charcoal/90"
            >
              <GitHubIcon />
              Repository
              {app.isPrivateRepo && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                  Private
                </span>
              )}
            </a>
          )}
          {app.liveUrl && (
            <a
              href={app.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-ui-charcoal hover:border-ui-gold/40"
            >
              Live site &rarr;
            </a>
          )}
          {app.docsUrl && (
            <a
              href={app.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-ui-charcoal hover:border-ui-gold/40"
            >
              Documentation &rarr;
            </a>
          )}
        </div>
      )}

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ui-charcoal">Overview</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          {app.description}
        </p>
      </div>

      {/* Operational function + outcome */}
      {(app.operationalFunction || app.operationalExcellenceOutcome) && (
        <div className="grid gap-4 md:grid-cols-2">
          {app.operationalFunction && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-ui-charcoal">
                Operational function at UI
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {app.operationalFunction}
              </p>
            </div>
          )}
          {app.operationalExcellenceOutcome && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-ui-charcoal">
                Operational excellence outcome
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {app.operationalExcellenceOutcome}
              </p>
            </div>
          )}
        </div>
      )}

      {/* External deployments */}
      {app.externalDeployments.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ui-charcoal">
            Also deployed at
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            {app.externalDeployments.map((d) => (
              <li key={d}>&bull; {d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Features */}
      {app.features.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ui-charcoal">
            Key features
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {app.features.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-ui-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech stack */}
      {app.tech.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ui-charcoal">
            Tech stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {app.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ui-charcoal">
            Related interventions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`${basePath}/${r.slug}`}
                className="group rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-ui-gold/40"
              >
                <p className="text-sm font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
                  {r.name}
                </p>
                {r.tagline && (
                  <p className="mt-1 text-xs text-gray-500">{r.tagline}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
