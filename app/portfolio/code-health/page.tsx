import Link from "next/link";
import { projects } from "@/lib/portfolio";
import {
  COLLECTOR_REPO_URL,
  COVERAGE_STATUS_LABEL,
  GATE_ORDER,
  SHARES_REPOSITORY_WITH,
  codeHealthForProject,
  listCodeHealthSnapshots,
  measuredComponents,
  type CodeHealthProject,
  type CodeHealthSnapshot,
} from "@/lib/code-health";
import { BasisChip, Sparkline, formatAsOf } from "@/components/CodeHealth";

export const metadata = {
  title: "Code Health · UI AI Portfolio",
  description:
    "Independent monthly measurements of size, tests, complexity, duplication, coverage, delivery, and dependency age for each IIDS portfolio project's code.",
};

// Only projects shown on the public site, and each repository once.
const listed = projects
  .filter((p) => p.visibility !== "Internal-only")
  .filter((p) => !(p.slug in SHARES_REPOSITORY_WITH))
  .sort((a, b) => a.name.localeCompare(b.name));

const portfolioSlugs = new Set(listed.map((p) => p.slug));

const hasNumbers = (p: CodeHealthProject) => p.basis === "manifest" || p.basis === "heuristic";

function inPortfolio(s: CodeHealthSnapshot) {
  return s.projects.filter((p) => portfolioSlugs.has(p.slug) && hasNumbers(p));
}

function coverageMeasured(p: CodeHealthProject) {
  const c = measuredComponents(p);
  return c.length > 0 && c.every((x) => x.coverageStatus === "measured");
}

const anyComplexityGate = (p: CodeHealthProject) =>
  p.gates.python_complexity_limit === true || p.gates.eslint_complexity_limit === true;

// Portfolio-wide counts per snapshot. These are adoption counts across the
// whole portfolio, so no chart on this page compares one project to another.
const ROLLUPS: { label: string; count: (s: CodeHealthSnapshot) => number }[] = [
  { label: "Projects measured", count: (s) => inPortfolio(s).length },
  { label: "Declared by a manifest", count: (s) => inPortfolio(s).filter((p) => p.basis === "manifest").length },
  { label: "Coverage on the measured commit", count: (s) => inPortfolio(s).filter(coverageMeasured).length },
  { label: "Complexity limit configured", count: (s) => inPortfolio(s).filter(anyComplexityGate).length },
  { label: "Secret scanning configured", count: (s) => inPortfolio(s).filter((p) => p.gates.secret_scan).length },
];

function coverageSummary(p: CodeHealthProject): string {
  const statuses = new Set(measuredComponents(p).map((c) => c.coverageStatus));
  if (statuses.size === 0) return "—";
  if (statuses.size === 1) return COVERAGE_STATUS_LABEL[[...statuses][0]] ?? "Not available";
  return statuses.has("measured") ? "Partly measured" : "Not available";
}

const TH = "px-3 py-2 text-left text-xs font-semibold text-brand-black";
const TD = "px-3 py-2 text-sm text-ui-charcoal";

export default function CodeHealthPage() {
  const snapshots = listCodeHealthSnapshots();
  const latest = snapshots.at(-1) ?? null;
  const rows = listed.map((p) => ({ project: p, health: codeHealthForProject(p.slug, p.repoUrl, p.status) }));
  const measured = rows.filter((r) => r.health.state === "measured");
  const notMeasured = rows.filter((r) => r.health.state === "not measured");
  const byReason = new Map<string, (typeof listed)[number][]>();
  for (const { project, health } of notMeasured) {
    if (health.state !== "not measured") continue;
    byReason.set(health.reason, [...(byReason.get(health.reason) ?? []), project]);
  }
  const notMeasuredByReason = [...byReason.entries()];

  return (
    <div className="space-y-10">
      <nav className="text-sm text-gray-500">
        <Link href="/portfolio" className="hover:text-brand-black">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">Code health</span>
      </nav>

      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">Projects</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">
          How well-kept is the code behind each project?
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Once a month, IIDS measures the repositories behind portfolio projects the same
          way, with the same pinned tools, so a number means the same thing from one month
          to the next. {latest ? (
            <>
              The latest measurement is from {formatAsOf(latest.asOf)}:{" "}
              <strong className="font-semibold text-brand-black">
                {measured.length} of {listed.length} projects
              </strong>{" "}
              measured.
            </>
          ) : (
            "No measurement has been published yet."
          )}{" "}
          Each project&apos;s page carries its own numbers and trend. Projects are listed
          here alphabetically, not ranked: they differ in language, size, and age, so a
          number means most next to the same project&apos;s earlier numbers.
        </p>
      </header>

      {latest && (
        <section>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Across the portfolio
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {ROLLUPS.map((r) => {
              const points = snapshots.map((s) => ({ asOf: s.asOf, value: r.count(s) }));
              const fmt = (v: number | null) => (v === null ? "—" : `${v} of ${listed.length}`);
              return (
                <div key={r.label} className="rounded-lg border border-hairline bg-white px-4 py-3">
                  <p className="text-xs font-medium text-ink-muted">{r.label}</p>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <p className="whitespace-nowrap text-2xl font-black tabular-nums text-brand-black">
                      {r.count(latest)}
                      <span className="ml-1 text-sm font-medium text-ink-muted">of {listed.length}</span>
                    </p>
                    <Sparkline label={r.label} points={points} format={fmt} />
                  </div>
                </div>
              );
            })}
          </div>
          {snapshots.length === 1 && (
            <p className="mt-2 text-xs text-ink-subtle">
              One snapshot so far; the trend lines fill in monthly.
            </p>
          )}
        </section>
      )}

      {measured.length > 0 && (
        <section>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Measured projects
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-hairline bg-white">
            <table className="w-full min-w-[720px] border-collapse">
              <caption className="sr-only">Measured projects, alphabetical</caption>
              <thead className="bg-surface-alt">
                <tr className="border-b border-hairline">
                  <th scope="col" className={TH}>Project</th>
                  <th scope="col" className={TH}>Basis</th>
                  <th scope="col" className={TH}>Coverage</th>
                  <th scope="col" className={TH}>Gates configured</th>
                  <th scope="col" className={TH}>Commit measured</th>
                </tr>
              </thead>
              <tbody>
                {measured.map(({ project, health }) => {
                  if (health.state !== "measured") return null;
                  const p = health.project;
                  const gates = GATE_ORDER.filter((g) => p.gates[g]).length;
                  return (
                    <tr key={project.slug} className="border-b border-hairline last:border-0">
                      <th scope="row" className="px-3 py-2 text-left text-sm font-semibold">
                        <Link href={`/portfolio/${project.slug}`}>{project.name}</Link>
                      </th>
                      <td className={TD}>
                        <BasisChip basis={p.basis} />
                      </td>
                      <td className={TD}>{coverageSummary(p)}</td>
                      <td className={`${TD} tabular-nums`}>
                        {gates} of {GATE_ORDER.length}
                      </td>
                      <td className={`${TD} tabular-nums`}>
                        {p.commitDate ? formatAsOf(p.commitDate) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {notMeasured.length > 0 && (
        <section>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Not measured
          </p>
          <div className="mt-3 space-y-5">
            {notMeasuredByReason.map(([reason, items]) => (
              <div key={reason}>
                <p className="text-sm text-ink-muted">{reason}</p>
                <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                  {items.map((project) => (
                    <li key={project.slug}>
                      <Link href={`/portfolio/${project.slug}`} className="font-semibold">
                        {project.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-3xl border-t border-hairline pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          How it&apos;s measured
        </p>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted">
          <p>
            <strong className="font-semibold text-brand-black">Independent.</strong> Projects
            can measure themselves, but each tool counts differently and each project
            configures its own. These numbers come from one collector run by IIDS against
            one recorded commit per repository. Anything that needs a project&apos;s code to
            run, such as test coverage, is read from what the project&apos;s own CI
            publishes, and only counts when it ran on the measured commit.
          </p>
          <p>
            <strong className="font-semibold text-brand-black">Declared or estimated.</strong>{" "}
            A project that adds a <code className="text-xs">.code-health.toml</code> manifest
            with{" "}
            <a href={COLLECTOR_REPO_URL} target="_blank" rel="noopener noreferrer">
              code-health-kit
            </a>{" "}
            declares which files are its source, tests, generated, and vendored code.
            Without one, the collector estimates, and the project is marked{" "}
            <em>estimated</em>.
          </p>
          <p>
            <strong className="font-semibold text-brand-black">Complexity</strong> is
            lizard&apos;s cyclomatic count per function, which differs from Ruff&apos;s and
            ESLint&apos;s; it is the collector&apos;s measure, not a project&apos;s lint
            score. <strong className="font-semibold text-brand-black">Maintainability</strong>{" "}
            is radon&apos;s index, Python only.{" "}
            <strong className="font-semibold text-brand-black">Duplication</strong> is jscpd
            over authored source, at least 50 tokens and 5 lines.
          </p>
          <p>
            <strong className="font-semibold text-brand-black">Dependencies</strong> are read
            from lock files and compared with each registry&apos;s latest release on the
            capture date, so the same commit can score differently a month later. Known
            vulnerability counts are measured but not published here: on a public page they
            would point at a deployed system before it is fixed.
          </p>
          <p>
            <strong className="font-semibold text-brand-black">Delivery</strong> covers the{" "}
            {latest?.thresholds.churn_days ?? 90} days before the measured commit, from GitHub: pull requests merged, lead time
            from opening to merge, a rough change-failure share, and the age of open issues.
          </p>
          {latest && (
            <p className="text-xs text-ink-subtle">
              Tools on {formatAsOf(latest.asOf)}:{" "}
              {Object.entries(latest.tools)
                .map(([k, v]) => `${k} ${v}`)
                .join(" · ")}
              . No file paths, function names, or repository names are published.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
