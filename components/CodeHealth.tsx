// Code-health display primitives (ADR 0010). Server components only:
// sparkline hover uses native SVG <title> tooltips, and every plotted
// value is also printed as text, so nothing here needs client JS.

import Link from "next/link";
import {
  BASIS_LABEL,
  BASIS_NOTE,
  COLLECTOR_REPO_URL,
  COVERAGE_STATUS_LABEL,
  GATE_LABEL,
  GATE_ORDER,
  LANGUAGE_LABEL,
  measuredComponents,
  projectCoveragePercent,
  projectDuplicatedPercent,
  projectTestToSource,
  totalFunctionsOver20,
  totalSourceNloc,
  type CodeHealthBasis,
  type CodeHealthComponent,
  type CodeHealthPoint,
  type CodeHealthProject,
  type ProjectCodeHealth,
} from "@/lib/code-health";

// ── Formatting ───────────────────────────────────────────────────────

const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const two = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DASH = "—";

export function fmtInt(v: number | null): string {
  return v === null ? DASH : int.format(v);
}
export function fmtOne(v: number | null): string {
  return v === null ? DASH : one.format(v);
}
export function fmtRatio(v: number | null): string {
  return v === null ? DASH : two.format(v);
}
export function fmtPercent(v: number | null): string {
  return v === null ? DASH : `${one.format(v)}%`;
}
export function fmtShare(v: number | null): string {
  return v === null ? DASH : `${one.format(v * 100)}%`;
}
export function fmtHours(v: number | null): string {
  if (v === null) return DASH;
  return v < 48 ? `${one.format(v)} h` : `${one.format(v / 24)} d`;
}

export function formatAsOf(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
      {children}
    </p>
  );
}

// ── Basis chip ───────────────────────────────────────────────────────

export function BasisChip({ basis }: { basis: CodeHealthBasis }) {
  const declared = basis === "manifest";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        declared
          ? "border-brand-clearwater/40 bg-brand-clearwater/5 text-brand-clearwater"
          : "border-hairline bg-surface-alt text-ink-muted"
      }`}
    >
      {BASIS_LABEL[basis]}
    </span>
  );
}

// ── Sparkline ────────────────────────────────────────────────────────

export interface SparkPoint {
  asOf: string;
  value: number | null;
}

/**
 * One series over monthly snapshots. Line in the de-emphasis neutral, the
 * latest point in clearwater. A single point draws a dot and says so.
 */
export function Sparkline({
  label,
  points,
  format,
}: {
  label: string;
  points: SparkPoint[];
  format: (v: number | null) => string;
}) {
  const W = 104;
  const H = 28;
  const PAD = 5;
  const present = points.filter((p): p is { asOf: string; value: number } => p.value !== null);
  // One point is not a trend; the section says when trends start instead.
  if (present.length < 2) return null;

  const values = present.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = points.length > 1 ? (W - 2 * PAD) / (points.length - 1) : 0;
  const x = (i: number) => (points.length > 1 ? PAD + i * step : W / 2);
  const y = (v: number) => (max === min ? H / 2 : H - PAD - ((v - min) / span) * (H - 2 * PAD));

  const coords = points
    .map((p, i) => (p.value === null ? null : ([x(i), y(p.value), p] as const)))
    .filter((c): c is readonly [number, number, SparkPoint] => c !== null);
  const last = coords[coords.length - 1];
  const summary = `${label} over ${present.length} snapshots, from ${format(present[0].value)} to ${format(present[present.length - 1].value)}.`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="img"
      aria-label={summary}
      className="overflow-visible"
    >
      <title>{summary}</title>
      {coords.length > 1 && (
        <polyline
          points={coords.map(([cx, cy]) => `${cx},${cy}`).join(" ")}
          fill="none"
          className="stroke-brand-silver"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {coords.map(([cx, cy, p]) => (
        <g key={p.asOf}>
          {/* Hit target larger than the mark. */}
          <circle cx={cx} cy={cy} r={8} fill="transparent">
            <title>{`${formatAsOf(p.asOf)}: ${format(p.value)}`}</title>
          </circle>
          <circle
            cx={cx}
            cy={cy}
            r={p === last[2] ? 4 : 2.5}
            className={p === last[2] ? "fill-brand-clearwater stroke-white" : "fill-brand-silver"}
            strokeWidth={p === last[2] ? 2 : 0}
            pointerEvents="none"
          />
        </g>
      ))}
    </svg>
  );
}

// ── Stat tile ────────────────────────────────────────────────────────

function StatTile({
  label,
  hint,
  value,
  points,
  format,
}: {
  label: string;
  hint?: string;
  value: string;
  points: SparkPoint[];
  format: (v: number | null) => string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-white px-4 py-3">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-2xl font-black tabular-nums text-brand-black">{value}</p>
        <Sparkline label={label} points={points} format={format} />
      </div>
      {hint && <p className="mt-1 text-[11px] leading-snug text-ink-subtle">{hint}</p>}
    </div>
  );
}

function series(
  history: CodeHealthPoint[],
  pick: (p: CodeHealthProject) => number | null
): SparkPoint[] {
  return history.map((h) => ({ asOf: h.asOf, value: pick(h.project) }));
}

// ── Component table ──────────────────────────────────────────────────

const TH = "px-3 py-2 text-left text-xs font-semibold text-brand-black";
const TD = "whitespace-nowrap px-3 py-2 text-right tabular-nums text-ui-charcoal";

function coverageCell(c: CodeHealthComponent) {
  if (c.coverageStatus === "measured") return fmtPercent(c.coverageLinePercent);
  if (c.coverageStatus === "other commit" && c.coverageLinePercent !== null) {
    return `${fmtPercent(c.coverageLinePercent)}*`;
  }
  return <span className="text-ink-subtle">{COVERAGE_STATUS_LABEL[c.coverageStatus] ?? "Not available"}</span>;
}

function ComponentTable({ project }: { project: CodeHealthProject }) {
  const rows = project.components;
  const anyOtherCommit = rows.some((c) => c.coverageStatus === "other commit");
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-hairline">
      <table className="w-full min-w-[880px] border-collapse text-sm">
        <caption className="sr-only">Code health by component</caption>
        <thead className="bg-surface-alt">
          <tr className="border-b border-hairline">
            <th scope="col" className={TH}>Component</th>
            <th scope="col" className={`${TH} text-right`} title="Non-comment lines of authored source">Source lines</th>
            <th scope="col" className={`${TH} text-right`}>Test lines</th>
            <th scope="col" className={`${TH} text-right`}>Test : source</th>
            <th scope="col" className={`${TH} text-right`} title="Cyclomatic complexity per function, lizard">Complexity mean / p95 / max</th>
            <th scope="col" className={`${TH} text-right`}>Functions over 10 / 20</th>
            <th scope="col" className={`${TH} text-right`} title="Radon maintainability index, Python only">Maintainability</th>
            <th scope="col" className={`${TH} text-right`} title="jscpd, at least 50 tokens and 5 lines">Duplicated</th>
            <th scope="col" className={`${TH} text-right`}>Line coverage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.name} className="border-b border-hairline last:border-0">
              <th scope="row" className="px-3 py-2 text-left font-semibold text-brand-black">
                {c.name}
                <span className="ml-2 text-xs font-normal text-ink-muted">
                  {LANGUAGE_LABEL[c.language] ?? c.language}
                </span>
              </th>
              {c.supported ? (
                <>
                  <td className={TD}>{fmtInt(c.sourceNloc)}</td>
                  <td className={TD}>{fmtInt(c.testNloc)}</td>
                  <td className={TD}>{fmtRatio(c.testToSource)}</td>
                  <td className={TD}>
                    {fmtOne(c.ccnMean)} / {fmtInt(c.ccnP95)} / {fmtInt(c.ccnMax)}
                  </td>
                  <td className={TD}>
                    {fmtInt(c.functionsOver10)} / {fmtInt(c.functionsOver20)}
                  </td>
                  <td className={TD}>
                    {c.miMean === null ? (
                      <span className="text-ink-subtle">{DASH}</span>
                    ) : (
                      <>
                        {fmtOne(c.miMean)}
                        {c.filesMiBelow20 ? (
                          <span className="ml-1 text-xs text-ink-muted">
                            ({fmtInt(c.filesMiBelow20)} below 20)
                          </span>
                        ) : null}
                      </>
                    )}
                  </td>
                  <td className={TD}>
                    {fmtPercent(c.duplicatedPercent)}
                    {c.clones !== null && (
                      <span className="ml-1 text-xs text-ink-muted">({fmtInt(c.clones)} clones)</span>
                    )}
                  </td>
                  <td className={TD}>{coverageCell(c)}</td>
                </>
              ) : (
                <td colSpan={8} className="px-3 py-2 text-ink-muted">
                  The collector does not measure this language yet.
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {anyOtherCommit && (
        <p className="border-t border-hairline px-3 py-2 text-xs text-ink-muted">
          * Coverage from a CI run on a different commit than the one measured,
          such as a pull-request merge commit.
        </p>
      )}
    </div>
  );
}

// ── Definition-list blocks ───────────────────────────────────────────

function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-muted">{k}</dt>
          <dd className="whitespace-nowrap text-right tabular-nums text-ui-charcoal">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const DEPENDENCY_STATUS_TEXT: Record<string, string> = {
  "no lock file":
    "No lock file, so dependencies were not measured: resolving version ranges on the capture date would measure versions the project may never have run.",
  "scan failed": "The dependency scan failed on the capture date.",
  "not collected": "Dependencies were not collected.",
};

function DependencyFacts({ project, asOf }: { project: CodeHealthProject; asOf: string }) {
  const d = project.dependencies;
  if (d.status !== "measured") {
    return (
      <p className="mt-3 text-sm text-ink-muted">
        {DEPENDENCY_STATUS_TEXT[d.status] ?? "Dependencies were not measured."}
      </p>
    );
  }
  const rows: [string, React.ReactNode][] = [
    ["Direct dependencies a major version behind", fmtInt(d.directBehindMajor)],
    ["Direct dependencies", fmtInt(d.direct)],
    ["Locked packages", fmtInt(d.packages)],
    ["Lock files", fmtInt(d.lockfiles)],
  ];
  if (d.directLatestUnknown) rows.push(["Latest release unknown", fmtInt(d.directLatestUnknown)]);
  if (d.directUnmeasuredLockfiles) {
    rows.push(["Lock files that don't mark direct dependencies", fmtInt(d.directUnmeasuredLockfiles)]);
  }
  if (d.manifestsWithoutLock) rows.push(["Manifests with no lock file", fmtInt(d.manifestsWithoutLock)]);
  return (
    <>
      <Facts rows={rows} />
      <p className="mt-2 text-xs text-ink-subtle">
        Compared with each registry&apos;s latest release on {formatAsOf(asOf)}, not on the
        commit date.
      </p>
    </>
  );
}

function DeliveryFacts({ project, windowDays }: { project: CodeHealthProject; windowDays: number }) {
  const d = project.delivery;
  if (d.status !== "measured") {
    return <p className="mt-3 text-sm text-ink-muted">Delivery measures were not collected.</p>;
  }
  return (
    <>
      <Facts
        rows={[
          ["Pull requests merged", fmtInt(d.mergedPrs)],
          ["Merged by bots, not counted above", fmtInt(d.botMergedPrs)],
          ["Lead time, median / p90", `${fmtHours(d.leadTimeMedianHours)} / ${fmtHours(d.leadTimeP90Hours)}`],
          ["Change-failure share", fmtShare(d.changeFailureShare)],
          ["Commits", fmtInt(project.commitsInWindow)],
          ["Open issues at window end", fmtInt(d.openIssuesAtEnd)],
          ["Open issues, median age", d.openIssueMedianAgeDays === null ? DASH : `${fmtOne(d.openIssueMedianAgeDays)} days`],
          ["Open issues older than 90 days", fmtInt(d.openIssuesOver90Days)],
          ["Closed issues labeled bug", d.bugRatio === null ? "Label not used" : fmtShare(d.bugRatio)],
        ]}
      />
      <p className="mt-2 text-xs text-ink-subtle">
        The {windowDays} days before the measured commit. Lead time runs from a pull request
        opening to its merge, so for agent-written changes it mostly measures review. Change
        failures are reverts and changes titled or labeled hotfix or regression, a rough proxy.
        {(d.truncated || d.incomplete) && " Some searches hit GitHub's limits, so counts may be low."}
      </p>
    </>
  );
}

export function GateList({ gates }: { gates: Record<string, boolean> }) {
  const keys = [...GATE_ORDER, ...Object.keys(gates).filter((k) => !GATE_ORDER.includes(k))];
  return (
    <ul className="mt-3 space-y-1.5 text-sm">
      {keys
        .filter((k) => k in gates)
        .map((k) => (
          <li key={k} className="flex items-center gap-2">
            <span
              aria-hidden
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                gates[k] ? "bg-brand-clearwater text-white" : "border border-hairline text-ink-subtle"
              }`}
            >
              {gates[k] ? "✓" : ""}
            </span>
            <span className={gates[k] ? "text-ui-charcoal" : "text-ink-muted"}>
              {GATE_LABEL[k] ?? k.replaceAll("_", " ")}
              <span className="sr-only">{gates[k] ? ": configured" : ": not configured"}</span>
            </span>
          </li>
        ))}
    </ul>
  );
}

// ── Project-page section ─────────────────────────────────────────────

export function CodeHealthSection({
  health,
  windowDays,
  measuredAsName,
}: {
  health: ProjectCodeHealth;
  windowDays: number;
  /** Display name of the project whose shared repository was measured. */
  measuredAsName?: string;
}) {
  if (health.state === "not measured") {
    return (
      <section className="border-t border-hairline pt-6">
        <Eyebrow>Code health</Eyebrow>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Not measured. {health.reason}
        </p>
        <p className="mt-2 text-xs">
          <Link href="/portfolio/code-health">How code health is measured &rarr;</Link>
        </p>
      </section>
    );
  }

  const { project, history, asOf, measuredAs } = health;
  const basis = project.basis as "manifest" | "heuristic";
  const components = measuredComponents(project);
  const coverage = projectCoveragePercent(project);

  return (
    <section className="border-t border-hairline pt-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Eyebrow>Code health</Eyebrow>
        <BasisChip basis={basis} />
      </div>
      <p className="mt-2 max-w-3xl text-sm text-ink-muted">
        Measured independently by IIDS on {formatAsOf(asOf)}
        {project.commit && (
          <>
            {" "}at commit <code className="text-xs">{project.commit.slice(0, 7)}</code>
          </>
        )}
        {project.commitDate && <> ({formatAsOf(project.commitDate)})</>}.{" "}
        {measuredAs && measuredAsName && (
          <>
            This project shares its repository with{" "}
            <Link href={`/portfolio/${measuredAs}`}>{measuredAsName}</Link>, so the numbers
            cover both.{" "}
          </>
        )}
        {BASIS_NOTE[basis]}
      </p>

      {components.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            label="Source lines"
            value={fmtInt(totalSourceNloc(project))}
            points={series(history, totalSourceNloc)}
            format={fmtInt}
          />
          <StatTile
            label="Test lines per source line"
            value={fmtRatio(projectTestToSource(project))}
            points={series(history, projectTestToSource)}
            format={fmtRatio}
          />
          <StatTile
            label="Line coverage"
            value={coverage === null ? DASH : fmtPercent(coverage)}
            hint={coverage === null ? "Only counted when CI publishes it for the measured commit." : undefined}
            points={series(history, projectCoveragePercent)}
            format={fmtPercent}
          />
          <StatTile
            label="Functions with complexity over 20"
            hint="Collector's measure (lizard), not the project's own lint score."
            value={fmtInt(totalFunctionsOver20(project))}
            points={series(history, totalFunctionsOver20)}
            format={fmtInt}
          />
          <StatTile
            label="Duplicated source"
            value={fmtPercent(projectDuplicatedPercent(project))}
            points={series(history, projectDuplicatedPercent)}
            format={fmtPercent}
          />
          <StatTile
            label="Direct dependencies a major version behind"
            hint={`As of ${formatAsOf(asOf)}.`}
            value={fmtInt(project.dependencies.directBehindMajor)}
            points={series(history, (p) => p.dependencies.directBehindMajor)}
            format={fmtInt}
          />
        </div>
      )}

      {history.length < 2 && components.length > 0 && (
        <p className="mt-2 text-xs text-ink-subtle">
          First measurement. Trend lines appear from the next monthly snapshot.
        </p>
      )}

      {project.components.length > 0 && <ComponentTable project={project} />}

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-brand-black">Delivery</p>
          <DeliveryFacts project={project} windowDays={windowDays} />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-black">Dependencies</p>
          <DependencyFacts project={project} asOf={asOf} />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-black">Gates configured</p>
          <GateList gates={project.gates} />
          <p className="mt-2 text-xs text-ink-subtle">
            Read from the project&apos;s configuration files. A configured gate is not proof that
            CI enforces it.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-subtle">
        Complexity is lizard&apos;s cyclomatic count, which differs from Ruff and ESLint.{" "}
        <Link href="/portfolio/code-health">How code health is measured &rarr;</Link>{" "}
        Projects adopt manifests and gates with{" "}
        <a href={COLLECTOR_REPO_URL} target="_blank" rel="noopener noreferrer">
          code-health-kit
        </a>
        .
      </p>
    </section>
  );
}
