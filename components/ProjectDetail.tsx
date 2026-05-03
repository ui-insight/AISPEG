import Link from "next/link";
import type { ApplicationWithBlockers, Blocker } from "@/lib/work";
import { blockerCategoryLabels, daysSince } from "@/lib/work";
import {
  OPERATIONAL_LABEL,
  PUBLIC_STAGE_CHIP,
  PUBLIC_STAGE_LABEL,
  isProjectStatus,
  publicStageFromStatus,
} from "@/lib/lifecycle-display";

// Blocker severity is a documented exception to the brand-token rule —
// the amber/red signals are functional alerting, not status decoration.
// Mirrors components/PortfolioCard.tsx.
const severityStyles: Record<"low" | "medium" | "high", string> = {
  low: "border-gray-200 bg-gray-50 text-gray-700",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  high: "border-red-200 bg-red-50 text-red-900",
};

function LifecycleChips({ status }: { status: string }) {
  const stage = publicStageFromStatus(status);
  // Suppress the operational chip for `tracked` — the ladder doesn't
  // apply to externally-owned projects, so the stage chip carries the
  // whole signal. (See ADR 0001.)
  const showOperationalChip = isProjectStatus(status) && status !== "tracked";
  return (
    <>
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PUBLIC_STAGE_CHIP[stage]}`}
      >
        {PUBLIC_STAGE_LABEL[stage]}
      </span>
      {showOperationalChip && (
        <span className="inline-flex items-center rounded-full border border-hairline bg-surface-alt px-2 py-0.5 text-xs font-medium text-ink-muted">
          {OPERATIONAL_LABEL[status as keyof typeof OPERATIONAL_LABEL]}
        </span>
      )}
    </>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
      {children}
    </p>
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

export interface ProjectDetailProps {
  app: ApplicationWithBlockers;
  related: RelatedApp[];
  audience: "public" | "internal";
  basePath: string; // "/portfolio" or "/internal/portfolio"
}

export default function ProjectDetail({
  app,
  related,
  audience,
  basePath,
}: ProjectDetailProps) {
  const isEmbargoed = app.visibilityTier === "embargoed";
  const isInternal = app.visibilityTier === "internal";

  const ownerNames = app.operationalOwners.map((o) =>
    o.title ? `${o.name} (${o.title})` : o.name
  );
  const homeUnitLabel = app.homeUnits.join(", ");
  const buildParticipantsLabel = app.buildParticipants.join(", ");
  // Collapse the "Built by" segment when it would just repeat the home unit —
  // common for IIDS-built IIDS-housed projects, where the redundancy adds
  // noise to the owner-line without adding signal.
  const showBuildSegment =
    buildParticipantsLabel && buildParticipantsLabel !== homeUnitLabel;

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href={basePath} className="hover:text-brand-black">
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

      {/* Beat 1 — What is this? Hero band, no card shell. */}
      <header>
        <SectionEyebrow>
          The Work{app.homeUnits[0] ? ` · ${app.homeUnits[0]}` : ""}
        </SectionEyebrow>
        <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight text-brand-black md:text-5xl">
          {app.name}
        </h1>
        {app.tagline && (
          <p className="mt-4 text-xl leading-relaxed text-ink-muted">
            {app.tagline}
          </p>
        )}
        <p className="mt-4 text-sm leading-relaxed text-ui-charcoal">
          {ownerNames.length > 0 ? (
            <>
              Operationally owned by{" "}
              <em className="font-semibold italic text-brand-black">
                {ownerNames.join(", ")}
              </em>
            </>
          ) : app.trackingOnly ? (
            <em className="font-semibold italic text-brand-black">
              Awaiting contact with unit
            </em>
          ) : null}
          {showBuildSegment && (
            <>
              {ownerNames.length > 0 || app.trackingOnly ? " · " : ""}
              Built by {buildParticipantsLabel}
            </>
          )}
          {homeUnitLabel && (
            <>
              {ownerNames.length > 0 || app.trackingOnly || showBuildSegment
                ? " · "
                : ""}
              Home: {homeUnitLabel}
            </>
          )}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <LifecycleChips status={app.status} />
          {app.ai4raRelationship !== "None" && (
            <span className="rounded-full border border-brand-lupine/30 bg-brand-lupine/10 px-2.5 py-0.5 text-xs font-medium text-brand-lupine">
              AI4RA {app.ai4raRelationship}
            </span>
          )}
          {app.dualDestinyPlanned && (
            <span className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-ink-muted">
              Dual destiny (OSS + UI)
            </span>
          )}
          {app.tags.includes("diffusion") && (
            <span className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-ink-muted">
              Capability diffusion
            </span>
          )}
          {app.institutionalReviewStatus === "Under OIT review" && (
            <span className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-ink-muted">
              Under OIT review
            </span>
          )}
          {app.trackingOnly && (
            <span className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-ink-muted">
              Tracked — not built by IIDS
            </span>
          )}
          {audience === "internal" && (
            <span className="rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-ink-muted">
              Visibility: {app.visibilityTier}
            </span>
          )}
        </div>
        {app.funding && (
          <p className="mt-3 text-sm font-medium text-ink-muted">
            {app.funding}
          </p>
        )}
      </header>

      {/* Embargo notice for embargoed visibility (public view) */}
      {audience === "public" && isEmbargoed && (
        <div className="rounded-xl border border-brand-huckleberry/30 bg-brand-huckleberry/10 p-5">
          <p className="text-sm font-semibold text-brand-huckleberry">
            UI deployment details embargoed
          </p>
          <p className="mt-1 text-sm text-brand-huckleberry/90">
            This project exists in the inventory, but specific details
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
            This project is not visible on the public portfolio. Visible
            here because you&apos;re authenticated to the internal view.
          </p>
        </div>
      )}

      {/* Bridge prose — completes Beat 1's "What is this?" with the
          fuller paragraph. No card shell; the hero already framed it. */}
      {app.description && (
        <section>
          <SectionEyebrow>Overview</SectionEyebrow>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-ui-charcoal">
            {app.description}
          </p>
        </section>
      )}

      {/* Beat 2 — Why does it matter? Outcome is the lede; function and
          blockers are supporting context. The single gold left-rule on
          the outcome is the page's emotional center; per .impeccable.md,
          gold is reserved for rare emphasis. */}
      {app.operationalExcellenceOutcome && (
        <section className="border-l-4 border-ui-gold pl-6">
          <SectionEyebrow>Why this matters</SectionEyebrow>
          <p className="mt-2 max-w-3xl text-lg leading-relaxed text-ui-charcoal">
            {app.operationalExcellenceOutcome}
          </p>
        </section>
      )}

      {app.activeBlockers.length > 0 && (
        <section>
          <SectionEyebrow>What&apos;s in the way</SectionEyebrow>
          <div className="mt-3 space-y-2">
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
        </section>
      )}

      {app.operationalFunction && (
        <section>
          <SectionEyebrow>How it&apos;s used</SectionEyebrow>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-ink-muted">
            {app.operationalFunction}
          </p>
        </section>
      )}

      {/* Beat 3 — Can I use it? Engagement surface: links, deployments,
          tech, features, related. */}
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
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-ui-charcoal hover:border-brand-black"
            >
              Live site &rarr;
            </a>
          )}
          {app.docsUrl && (
            <a
              href={app.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-ui-charcoal hover:border-brand-black"
            >
              Documentation &rarr;
            </a>
          )}
        </div>
      )}

      {app.externalDeployments.length > 0 && (
        <section className="border-t border-hairline pt-6">
          <SectionEyebrow>Also deployed at</SectionEyebrow>
          <ul className="mt-2 space-y-1 text-sm text-ui-charcoal">
            {app.externalDeployments.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>
      )}

      {app.features.length > 0 && (
        <section>
          <SectionEyebrow>Key features</SectionEyebrow>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {app.features.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-gray-700"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-black"
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
        </section>
      )}

      {app.tech.length > 0 && (
        <section>
          <SectionEyebrow>Tech stack</SectionEyebrow>
          <div className="mt-3 flex flex-wrap gap-2">
            {app.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-hairline bg-surface-alt px-3 py-1 text-sm text-ui-charcoal"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <SectionEyebrow>Related projects</SectionEyebrow>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`${basePath}/${r.slug}`}
                className="group rounded-lg border border-hairline bg-white p-4 transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-semibold text-ui-charcoal">
                  {r.name}
                </p>
                {r.tagline && (
                  <p className="mt-1 text-xs text-gray-500">{r.tagline}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Closer — bookends the page with the eyebrow at the top.
          Signals the page is a curated artifact, not auto-generated. */}
      <footer className="border-t border-hairline pt-6 text-xs text-brand-silver">
        Coordinated by IIDS ·{" "}
        <Link
          href="/builder-guide"
          className="font-medium text-brand-silver hover:text-brand-black"
        >
          Submit a correction &rarr;
        </Link>
      </footer>
    </div>
  );
}
