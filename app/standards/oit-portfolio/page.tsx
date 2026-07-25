import Link from "next/link";
import {
  CROSSWALK_CONFIDENCE_LABELS,
  OIT_CATEGORY_ORDER,
  OIT_EA_PROJECTS,
  OIT_EFFORT_DISCIPLINES,
  OIT_PRIORITY_ORDER,
  SOURCE_AS_OF,
  SOURCE_FISCAL_YEAR,
  crosswalkedProjects,
  highEffortCounts,
  priorityCounts,
  projectsByCategory,
  surfaceLinkedProjects,
  teamCounts,
  type OitEaProject,
  type OitPriority,
} from "@/lib/oit-ea-portfolio";
import { projects } from "@/lib/portfolio";

export const metadata = {
  title: "OIT Portfolio — Standards",
  description:
    "OIT's FY2027 Enterprise Applications portfolio in OIT's own tracking structure — priority, owning team, TPM, and effort by discipline — and the three projects it shares with this inventory.",
};

// Priority is the one dimension where OIT is making a commitment claim, so
// it earns the site's one accent color at Critical and nothing below it.
const PRIORITY_CHIP: Record<OitPriority, string> = {
  Critical: "border-ui-gold bg-ui-gold/15 text-ui-gold-dark",
  High: "border-brand-huckleberry/30 bg-brand-huckleberry/10 text-brand-huckleberry",
  Medium: "border-hairline bg-surface-alt text-ui-charcoal",
  Low: "border-hairline bg-white text-brand-silver",
};

function PriorityChip({ priority }: { priority: OitPriority }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${PRIORITY_CHIP[priority]}`}
    >
      {priority}
    </span>
  );
}

function EffortChips({ row }: { row: OitEaProject }) {
  const efforts = OIT_EFFORT_DISCIPLINES.filter(
    ({ key }) => row.effort[key] !== undefined
  );
  if (efforts.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {efforts.map(({ key, label }) => (
        <span
          key={key}
          className="rounded border border-hairline bg-white px-2 py-0.5 text-[11px] text-ink-muted"
        >
          {label} <span className="font-semibold">{row.effort[key]}</span>
        </span>
      ))}
    </div>
  );
}

function nameForSlug(slug: string): string {
  return projects.find((p) => p.slug === slug)?.name ?? slug;
}

function ProjectRow({ row }: { row: OitEaProject }) {
  return (
    <li className="border-t border-hairline py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <PriorityChip priority={row.priority} />
        <p className="text-sm font-semibold tracking-tight text-brand-black">
          {row.name}
        </p>
        <p className="text-xs text-brand-silver">
          {row.primaryTeam} &middot; {row.tpmOrManager}
        </p>
      </div>

      <EffortChips row={row} />

      {row.notes && (
        <p className="mt-2 text-xs text-ink-muted">{row.notes}</p>
      )}

      {row.portfolioSlug && row.crosswalkConfidence && (
        <p className="mt-2 text-xs leading-relaxed text-ink-subtle">
          <span className="font-semibold text-brand-clearwater">
            {CROSSWALK_CONFIDENCE_LABELS[row.crosswalkConfidence]}
          </span>{" "}
          with{" "}
          <Link href={`/portfolio/${row.portfolioSlug}`}>
            {nameForSlug(row.portfolioSlug)}
          </Link>{" "}
          in this inventory. {row.crosswalkNote}
        </p>
      )}

      {row.relatedSurface && (
        <p className="mt-2 text-xs leading-relaxed text-ink-subtle">
          Related to{" "}
          <Link href={row.relatedSurface.href}>
            {row.relatedSurface.label}
          </Link>{" "}
          on this site. {row.relatedSurface.note}
        </p>
      )}
    </li>
  );
}

export default function OitPortfolioPage() {
  const crosswalked = crosswalkedProjects();
  const surfaceLinked = surfaceLinkedProjects();
  const priorities = priorityCounts();
  const teams = teamCounts();
  const highEffort = highEffortCounts();

  return (
    <div className="space-y-14">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-brand-black">
          OIT&apos;s {SOURCE_FISCAL_YEAR} portfolio
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-muted">
          OIT&apos;s Enterprise Applications group tracks{" "}
          {OIT_EA_PROJECTS.length} committed efforts for {SOURCE_FISCAL_YEAR},
          sized by priority, owning team, and the load each of four
          disciplines carries. This page reproduces that structure as OIT
          keeps it, then names where their portfolio and this inventory
          describe the same work.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-ink-subtle">
          Source: OIT&apos;s FY2027 Enterprise Applications projects and
          priorities spreadsheet, shared July 2026. Transcribed as of{" "}
          {SOURCE_AS_OF} — a point-in-time snapshot, not a live feed. OIT owns
          every fact on this page; the crosswalk notes are ours.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-black tracking-tight text-brand-black">
          Where the two inventories meet
        </h2>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-ink-muted">
          {crosswalked.length} of OIT&apos;s {OIT_EA_PROJECTS.length} rows
          describe work this inventory also tracks, each confirmed by the
          portfolio owner rather than inferred from a shared subject. The
          rest is OIT&apos;s own — infrastructure, Softdocs forms, Banner
          operations. The overlap is genuinely this small, and rows that
          merely read as adjacent are left unlinked.
        </p>
        <ul className="mt-6 space-y-0">
          {crosswalked.map((row) => (
            <ProjectRow key={row.id} row={row} />
          ))}
        </ul>

        {surfaceLinked.length > 0 && (
          <>
            <h3 className="mt-10 text-lg font-bold tracking-tight text-brand-black">
              Related, but not the same work
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              Not a project in our inventory, and not a match — a row whose
              subject overlaps a surface this site maintains, where the
              scopes differ enough that saying more would overstate it.
            </p>
            <ul className="mt-4 space-y-0">
              {surfaceLinked.map((row) => (
                <ProjectRow key={row.id} row={row} />
              ))}
            </ul>
          </>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-black tracking-tight text-brand-black">
          How OIT sizes the year
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-hairline bg-surface-alt p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
              By priority
            </p>
            <dl className="mt-3 space-y-2">
              {priorities.map(({ priority, count }) => (
                <div key={priority} className="flex items-center gap-3">
                  <dt className="flex-1">
                    <PriorityChip priority={priority} />
                  </dt>
                  <dd className="text-sm font-semibold tabular-nums text-ui-charcoal">
                    {count}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-alt p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
              By owning team
            </p>
            <dl className="mt-3 space-y-2">
              {teams.map(({ team, count }) => (
                <div key={team} className="flex items-baseline gap-3">
                  <dt className="flex-1 text-sm text-ui-charcoal">{team}</dt>
                  <dd className="text-sm font-semibold tabular-nums text-ui-charcoal">
                    {count}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-hairline bg-surface-alt p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
              Rows drawing high effort
            </p>
            <dl className="mt-3 space-y-2">
              {highEffort.map(({ key, label, count }) => (
                <div key={key} className="flex items-baseline gap-3">
                  <dt className="flex-1 text-sm text-ui-charcoal">{label}</dt>
                  <dd className="text-sm font-semibold tabular-nums text-ui-charcoal">
                    {count}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-subtle">
              OIT leaves a discipline blank when it contributes no effort, and
              records &ldquo;Unknown&rdquo; when the effort is real but
              unsized.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black tracking-tight text-brand-black">
          The full portfolio
        </h2>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-ink-muted">
          Every row OIT tracks, grouped by their work category and ordered by
          priority within it.
        </p>
        <div className="mt-8 space-y-10">
          {OIT_CATEGORY_ORDER.map((category) => {
            const rows = projectsByCategory(category).sort(
              (a, b) =>
                OIT_PRIORITY_ORDER.indexOf(a.priority) -
                OIT_PRIORITY_ORDER.indexOf(b.priority)
            );
            if (rows.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
                  {category} &middot; {rows.length}
                </h3>
                <ul className="mt-4 space-y-0">
                  {rows.map((row) => (
                    <ProjectRow key={row.id} row={row} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
