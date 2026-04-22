import { notFound } from "next/navigation";
import Link from "next/link";
import {
  interventions,
  getInterventionBySlug,
  getRelatedInterventions,
  type InterventionStatus,
} from "@/lib/portfolio";

export function generateStaticParams() {
  // Only generate pages for entries that are not internal-only
  return interventions
    .filter((i) => i.visibility !== "Internal-only")
    .map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const i = getInterventionBySlug(slug);
  if (!i) return { title: "Not found" };
  return {
    title: `${i.name} · AISPEG Portfolio`,
    description: i.tagline,
  };
}

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const intervention = getInterventionBySlug(slug);
  if (!intervention) notFound();
  if (intervention.visibility === "Internal-only") notFound();

  const related = getRelatedInterventions(intervention);
  const isPartial = intervention.visibility === "Partial";

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/portfolio" className="hover:text-ui-gold-dark">
          Portfolio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-400">{intervention.homeUnits[0]}</span>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">{intervention.name}</span>
      </nav>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={intervention.status} />
          {intervention.ai4raRelationship !== "None" && (
            <span className="rounded-full border border-ui-gold/30 bg-ui-gold/10 px-2.5 py-0.5 text-xs font-medium text-ui-gold-dark">
              AI4RA {intervention.ai4raRelationship}
            </span>
          )}
          {intervention.dualDestinyPlanned && (
            <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600">
              Dual destiny (OSS + UI)
            </span>
          )}
          {intervention.tags?.includes("diffusion") && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Capability diffusion
            </span>
          )}
          {intervention.institutionalReviewStatus === "Under OIT review" && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs text-amber-800">
              Under OIT review
            </span>
          )}
          {intervention.trackingOnly && (
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
              Tracked — not built by AISPEG
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold text-ui-charcoal">
          {intervention.name}
        </h1>
        <p className="mt-2 text-lg text-gray-600">{intervention.tagline}</p>
        {intervention.funding && (
          <p className="mt-2 text-sm font-medium text-ui-gold-dark">
            {intervention.funding}
          </p>
        )}
      </div>

      {/* Embargo notice for Partial visibility */}
      {isPartial && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">
            UI deployment details embargoed
          </p>
          <p className="mt-1 text-sm text-amber-800">
            This intervention exists in the AISPEG inventory, but specific
            details about UI&apos;s operational deployment (pilot scope,
            timelines, or configuration) are held back from the public site.
            Contact the operational owner for authorized access.
          </p>
        </div>
      )}

      {/* Ownership */}
      <div className="grid gap-4 md:grid-cols-3">
        <OwnershipBlock label="Home unit(s)" values={intervention.homeUnits} />
        <OwnershipBlock
          label={intervention.operationalOwners.length === 1 ? "Operational owner" : "Operational owners"}
          values={intervention.operationalOwners.map((o) =>
            o.title ? `${o.name} (${o.title})` : o.name
          )}
          emptyText={intervention.trackingOnly ? "Awaiting contact with unit" : undefined}
        />
        <OwnershipBlock
          label="Build participants"
          values={intervention.buildParticipants}
        />
      </div>

      {/* Links */}
      {(intervention.repoUrl || intervention.docsUrl || intervention.liveUrl) && (
        <div className="flex flex-wrap gap-3">
          {intervention.repoUrl && (
            <a
              href={intervention.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-ui-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-ui-charcoal/90"
            >
              <GitHubIcon />
              Repository
              {intervention.isPrivateRepo && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs">Private</span>
              )}
            </a>
          )}
          {intervention.liveUrl && (
            <a
              href={intervention.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-ui-charcoal hover:border-ui-gold/40"
            >
              Live site &rarr;
            </a>
          )}
          {intervention.docsUrl && (
            <a
              href={intervention.docsUrl}
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
          {intervention.description}
        </p>
      </div>

      {/* Operational function + outcome */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ui-charcoal">
            Operational function at UI
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            {intervention.operationalFunction}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ui-charcoal">
            Operational excellence outcome
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            {intervention.operationalExcellenceOutcome}
          </p>
        </div>
      </div>

      {/* External deployments */}
      {intervention.externalDeployments?.length ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ui-charcoal">
            Also deployed at
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            {intervention.externalDeployments.map((d) => (
              <li key={d}>&bull; {d}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Features */}
      {intervention.features?.length ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ui-charcoal">
            Key features
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {intervention.features.map((f, i) => (
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
      ) : null}

      {/* Tech stack */}
      {intervention.tech?.length ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ui-charcoal">
            Tech stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {intervention.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}

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
                href={`/portfolio/${r.slug}`}
                className="group rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-ui-gold/40"
              >
                <p className="text-sm font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
                  {r.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">{r.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
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

function StatusBadge({ status }: { status: InterventionStatus }) {
  const styles: Record<InterventionStatus, string> = {
    Production: "bg-green-100 text-green-800",
    Piloting: "bg-blue-100 text-blue-800",
    Prototype: "bg-amber-100 text-amber-800",
    Planned: "bg-gray-100 text-gray-700",
    Tracked: "bg-violet-100 text-violet-800",
    Archived: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
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
