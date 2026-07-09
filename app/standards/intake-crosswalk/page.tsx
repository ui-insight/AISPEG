import Link from "next/link";
import {
  allGovernanceProfiles,
  governanceCoverage,
  type ResolvedProfile,
  BUILD_TYPE_LABEL,
  INTAKE_TRACK_LABEL,
  INTAKE_TRACK_SHORT,
  INTAKE_TRACK_TITLE,
  DATA_CLASSIFICATION_LABEL,
  AI_RISK_LABEL,
} from "@/lib/governance-profile";
import {
  HOME_UNIT_GROUP_ORDER,
  PUBLIC_STAGE_CHIP,
  PUBLIC_STAGE_LABEL,
} from "@/lib/portfolio";
import { ROI_RUBRIC_READY } from "@/lib/roi-rubric";

export const metadata = {
  title: "Intake Crosswalk — Standards",
  description:
    "How the University of Idaho AI project inventory maps onto the Unified Technology Request intake process: business need, data touched, ownership, build track, AI-risk posture, funding, and ROI.",
};

const UNIFIED_REQUEST_URL =
  "https://bhunter-uidaho.github.io/UnifiedTechnologyRequest/";

type ViewMode = "cards" | "matrix";

// A value the CADSO office hasn't decided yet. Rendered quietly — the gap
// is the point (it tells the office what still needs a call), not a defect.
function Pending({ note }: { note: string }) {
  return <span className="text-ink-subtle italic">Pending — {note}</span>;
}

// Compact pending marker for the dense matrix cells.
function Dash({ note }: { note: string }) {
  return (
    <span className="text-ink-subtle" title={`Pending — ${note}`}>
      &mdash;
    </span>
  );
}

function Chip({
  label,
  title,
  className = "border-hairline bg-surface-alt text-brand-black",
}: {
  label: string;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[10.5rem_1fr] sm:gap-4">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
        {label}
      </dt>
      <dd className="text-sm text-brand-black">{children}</dd>
    </div>
  );
}

// ---- Toggle -----------------------------------------------------------

function ViewToggle({ active }: { active: ViewMode }) {
  const options: { mode: ViewMode; label: string; href: string }[] = [
    { mode: "cards", label: "Cards", href: "/standards/intake-crosswalk" },
    { mode: "matrix", label: "Matrix", href: "/standards/intake-crosswalk?view=matrix" },
  ];
  return (
    <nav
      aria-label="View"
      className="inline-flex rounded-md border border-hairline bg-white p-0.5"
    >
      {options.map((o) => {
        const isActive = o.mode === active;
        return (
          <Link
            key={o.mode}
            href={o.href}
            aria-current={isActive ? "true" : undefined}
            className={`unstyled rounded px-3 py-1 text-sm transition-colors ${
              isActive
                ? "bg-ui-gold/15 font-semibold text-brand-black"
                : "font-medium text-ink-muted hover:text-brand-black"
            }`}
          >
            {o.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ---- Cards view -------------------------------------------------------

function ProfileCard({ p }: { p: ResolvedProfile }) {
  return (
    <article className="rounded-lg border border-hairline bg-white p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <h3 className="text-xl font-black tracking-tight text-brand-black">
            <Link href={`/portfolio/${p.slug}`} className="unstyled hover:text-brand-clearwater">
              {p.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-ink-muted">{p.businessNeed}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Chip
            label={PUBLIC_STAGE_LABEL[p.publicStage]}
            className={PUBLIC_STAGE_CHIP[p.publicStage]}
          />
          <Chip
            label={INTAKE_TRACK_LABEL[p.intakeTrack]}
            title={INTAKE_TRACK_TITLE[p.intakeTrack]}
          />
        </div>
      </header>

      <dl className="mt-2 divide-y divide-hairline">
        <Field label="Why it exists">{p.whyItExists}</Field>

        <Field label="Data it touches">
          {p.dataDomains ? (
            <>
              <span>{p.dataDomains.join(" · ")}</span>
              {p.dataModelSlug && (
                <>
                  {" "}
                  <Link href={`/standards/data-model/projects/${p.dataModelSlug}`}>
                    View data model →
                  </Link>
                </>
              )}
            </>
          ) : (
            <Pending note="not yet documented" />
          )}
        </Field>

        <Field label="Data classification">
          {p.dataClassification ? (
            <Chip label={DATA_CLASSIFICATION_LABEL[p.dataClassification]} />
          ) : (
            <Pending note="the office's classification call" />
          )}
        </Field>

        <Field label="AI involvement">
          {p.aiRiskTier ? (
            <Chip label={AI_RISK_LABEL[p.aiRiskTier]} />
          ) : (
            <Pending note="AI-risk review not yet completed" />
          )}
        </Field>

        <Field label="Ownership">
          <ul className="space-y-0.5">
            <li>
              <span className="text-ink-muted">Functional:</span>{" "}
              {p.functionalOwners.length > 0 ? (
                p.functionalOwners.map((o, i) => (
                  <span key={o.name}>
                    {i > 0 && ", "}
                    <span className="font-semibold">{o.name}</span>
                    {o.title ? ` (${o.title})` : ""}
                  </span>
                ))
              ) : (
                <span className="italic text-ink-subtle">{p.homeUnits[0]}</span>
              )}
            </li>
            <li>
              <span className="text-ink-muted">Technical lead:</span>{" "}
              {p.technicalLead ? (
                <span className="font-semibold">{p.technicalLead}</span>
              ) : (
                <span className="italic text-ink-subtle">—</span>
              )}
            </li>
            <li>
              <span className="text-ink-muted">Build team:</span>{" "}
              {p.buildTeam.join(", ")}
            </li>
          </ul>
        </Field>

        <Field label="Buy vs. build">
          {BUILD_TYPE_LABEL[p.buildType]}
        </Field>

        <Field label="Integrations">
          {p.integrations.length > 0 ? (
            p.integrations.join(" · ")
          ) : (
            <span className="italic text-ink-subtle">None declared</span>
          )}
        </Field>

        <Field label="Funding">
          {p.fundingSource ?? <span className="italic text-ink-subtle">Not specified</span>}
        </Field>

        <Field label="Strategic alignment">
          {p.strategicPlanAlignment.length > 0 ? (
            <span className="flex flex-wrap gap-1.5">
              {p.strategicPlanAlignment.map((code) => (
                <Link
                  key={code}
                  href={`/standards/strategic-plan/priorities/${code}`}
                  className="unstyled"
                >
                  <Chip label={code} />
                </Link>
              ))}
            </span>
          ) : (
            <span className="italic text-ink-subtle">None declared</span>
          )}
        </Field>

        <Field label="ROI">
          {p.roi?.summary ? (
            <span>
              {p.roi.summary}
              {typeof p.roi.score === "number" && (
                <span className="font-semibold">
                  {" "}
                  ({p.roi.score}
                  {p.roi.scale ? ` / ${p.roi.scale}` : ""})
                </span>
              )}
            </span>
          ) : (
            <Pending note="ROI rubric in development" />
          )}
        </Field>
      </dl>
    </article>
  );
}

function CardsView({
  grouped,
}: {
  grouped: { unit: string; items: ResolvedProfile[] }[];
}) {
  return (
    <>
      {grouped.map((group) => (
        <section key={group.unit} className="space-y-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-brand-clearwater">
            {group.unit}
          </h2>
          <div className="grid gap-4">
            {group.items.map((p) => (
              <ProfileCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

// ---- Matrix view ------------------------------------------------------

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-brand-silver"
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-3 align-top text-sm text-brand-black ${className}`}>
      {children}
    </td>
  );
}

function MatrixView({ profiles }: { profiles: ResolvedProfile[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-hairline bg-surface-alt">
          <tr>
            <Th>Project</Th>
            <Th>Home unit</Th>
            <Th>Functional owner</Th>
            <Th>Stage</Th>
            <Th>Track</Th>
            <Th>Data classification</Th>
            <Th>AI risk</Th>
            <Th>Funding</Th>
            <Th>ROI</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {profiles.map((p) => (
            <tr key={p.slug} className="transition-colors hover:bg-surface-alt/60">
              <Td className="font-semibold">
                <Link href={`/portfolio/${p.slug}`} className="unstyled hover:text-brand-clearwater">
                  {p.name}
                </Link>
              </Td>
              <Td className="text-ink-muted">{p.homeUnits[0]}</Td>
              <Td>
                {p.functionalOwners.length > 0 ? (
                  p.functionalOwners.map((o) => o.name).join(", ")
                ) : (
                  <span className="italic text-ink-subtle">{p.homeUnits[0]}</span>
                )}
              </Td>
              <Td>
                <Chip
                  label={PUBLIC_STAGE_LABEL[p.publicStage]}
                  className={PUBLIC_STAGE_CHIP[p.publicStage]}
                />
              </Td>
              <Td>
                <Chip
                  label={INTAKE_TRACK_SHORT[p.intakeTrack]}
                  title={INTAKE_TRACK_TITLE[p.intakeTrack]}
                />
              </Td>
              <Td>
                {p.dataClassification ? (
                  DATA_CLASSIFICATION_LABEL[p.dataClassification]
                ) : (
                  <Dash note="the office's classification call" />
                )}
              </Td>
              <Td>
                {p.aiRiskTier ? (
                  AI_RISK_LABEL[p.aiRiskTier]
                ) : (
                  <Dash note="AI-risk review not yet completed" />
                )}
              </Td>
              <Td className="text-ink-muted">
                {p.fundingSource ?? <Dash note="funding not specified" />}
              </Td>
              <Td>
                {p.roi?.summary ? (
                  typeof p.roi.score === "number" ? (
                    <span className="font-semibold">{p.roi.score}</span>
                  ) : (
                    p.roi.summary
                  )
                ) : (
                  <Dash note="ROI rubric in development" />
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Page -------------------------------------------------------------

export default async function IntakeCrosswalkPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view: ViewMode = params.view === "matrix" ? "matrix" : "cards";

  const profiles = allGovernanceProfiles();
  const coverage = governanceCoverage(profiles);

  // Order profiles by the canonical home-unit sequence. Cards group;
  // the matrix flattens the same order into rows.
  const grouped = HOME_UNIT_GROUP_ORDER.map((unit) => ({
    unit,
    items: profiles.filter((p) => p.homeUnits[0] === unit),
  })).filter((g) => g.items.length > 0);
  const ordered = grouped.flatMap((g) => g.items);

  const trackedTracks: Array<{ key: keyof typeof coverage.byTrack; label: string }> = [
    { key: "track-b", label: "Track B" },
    { key: "track-c", label: "Track C" },
    { key: "track-a", label: "Track A" },
    { key: "external", label: "External" },
  ];

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight text-brand-black sm:text-4xl">
          How our AI work maps to the Unified Technology Request
        </h1>
        <p className="mt-4 text-base text-ink-muted">
          Every project in the inventory, profiled against the fields the
          Chief AI &amp; Data Science Officer&rsquo;s office reviews &mdash;
          business need, data touched, ownership, build track, AI-risk
          posture, funding, and ROI. Where a field is a governance decision
          the office hasn&rsquo;t made yet, we say so rather than guess.
        </p>
        <p className="mt-3 text-sm">
          <a href={UNIFIED_REQUEST_URL} target="_blank" rel="noreferrer">
            View the Unified Technology Request &rarr;
          </a>
        </p>
      </header>

      {/* Coverage strip — what's captured vs. what the office still owns */}
      <section className="rounded-lg border border-hairline bg-surface-alt p-5">
        <p className="text-sm font-semibold text-brand-black">
          {coverage.total} projects profiled
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {trackedTracks
            .filter((t) => coverage.byTrack[t.key] > 0)
            .map((t) => `${coverage.byTrack[t.key]} ${t.label}`)
            .join(" · ")}
        </p>
        <p className="mt-3 border-t border-hairline pt-3 text-xs text-ink-subtle">
          Awaiting the office&rsquo;s review: data classification pending on{" "}
          {coverage.classificationPending}, AI-risk posture pending on{" "}
          {coverage.aiRiskPending}.{" "}
          {ROI_RUBRIC_READY
            ? `ROI scored on ${coverage.total - coverage.roiPending}.`
            : "ROI rubric in development — scores land once the office supplies it."}
        </p>
      </section>

      {/* View switch */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {view === "matrix"
            ? "All projects at a glance."
            : "Full profile per project."}
        </p>
        <ViewToggle active={view} />
      </div>

      {view === "matrix" ? (
        <MatrixView profiles={ordered} />
      ) : (
        <CardsView grouped={grouped} />
      )}
    </div>
  );
}
