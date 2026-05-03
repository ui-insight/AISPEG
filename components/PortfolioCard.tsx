import Link from "next/link";
import type { ApplicationWithBlockers, Blocker } from "@/lib/work";
import { blockerCategoryLabels, daysSince } from "@/lib/work";
import { WORK_CATEGORY_LABELS } from "@/lib/work-categories";
import { getPriority } from "@/lib/strategic-plan/catalog";
import {
  OPERATIONAL_LABEL,
  OPERATIONAL_TITLE,
  PUBLIC_STAGE_CHIP,
  PUBLIC_STAGE_LABEL,
  PUBLIC_STAGE_TITLE,
  isProjectStatus,
  publicStageFromStatus,
} from "@/lib/lifecycle-display";

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

  const stage = publicStageFromStatus(app.status);
  // The operational chip is suppressed for `tracked` — the ladder
  // doesn't apply to externally-owned projects, so the primary
  // stage chip carries the whole signal. (See ADR 0001.)
  const showOperationalChip =
    isProjectStatus(app.status) && app.status !== "tracked";
  const operationalStatus = isProjectStatus(app.status) ? app.status : null;

  const isAi4ra =
    app.ai4raRelationship === "Core" ||
    app.ai4raRelationship === "Adjacent" ||
    app.ai4raRelationship === "Reference";
  const isCapabilityDiffusion = app.tags.includes("diffusion");

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
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            title={PUBLIC_STAGE_TITLE[stage]}
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${PUBLIC_STAGE_CHIP[stage]}`}
          >
            {PUBLIC_STAGE_LABEL[stage]}
          </span>
          {showOperationalChip && operationalStatus && (
            <span
              title={OPERATIONAL_TITLE[operationalStatus]}
              className="inline-flex items-center rounded-full border border-hairline bg-surface-alt px-1.5 py-0.5 text-[10px] font-medium text-ink-muted"
            >
              {OPERATIONAL_LABEL[operationalStatus]}
            </span>
          )}
        </div>
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
        {isAi4ra && (
          <span
            title={`Part of the NSF-funded UI+SUU AI4RA partnership · ${app.ai4raRelationship}`}
            className="rounded-full border border-brand-lupine/30 bg-brand-lupine/10 px-2 py-0.5 text-xs font-semibold text-brand-lupine"
          >
            AI4RA
          </span>
        )}
        {isCapabilityDiffusion && (
          <span
            title="A non-IIDS UI unit is co-building this project."
            className="rounded-full border border-brand-clearwater/40 bg-brand-clearwater/10 px-2 py-0.5 text-xs font-medium text-brand-clearwater"
          >
            Capability diffusion
          </span>
        )}
        {app.workCategories.slice(0, 2).map((slug) => (
          <span
            key={slug}
            className="rounded-full border border-hairline bg-surface-alt px-2 py-0.5 text-xs font-medium text-brand-black"
          >
            {WORK_CATEGORY_LABELS[slug].label}
          </span>
        ))}
        {app.workCategories.length > 2 && (
          <span className="rounded-full border border-hairline bg-surface-alt px-2 py-0.5 text-xs font-medium text-brand-black">
            +{app.workCategories.length - 2}
          </span>
        )}
        {app.strategicPlanAlignment.slice(0, 3).map((code) => {
          const priority = getPriority(code);
          return (
            <Link
              key={code}
              href={`/standards/strategic-plan/priorities/${code}`}
              title={priority ? priority.text : undefined}
              className="unstyled relative z-10 rounded-full border border-brand-clearwater/40 bg-brand-clearwater/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand-clearwater hover:bg-brand-clearwater hover:text-white"
            >
              {code}
            </Link>
          );
        })}
        {app.strategicPlanAlignment.length > 3 && (
          <span
            className="rounded-full border border-brand-clearwater/40 bg-brand-clearwater/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand-clearwater"
            title={app.strategicPlanAlignment.slice(3).join(", ")}
          >
            +{app.strategicPlanAlignment.length - 3}
          </span>
        )}
      </div>

      {app.liveUrl && liveHost && (
        <div className="mt-auto border-t border-gray-100 pt-3">
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
