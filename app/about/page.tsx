import Link from "next/link";
import { Callout } from "@/components/Callout";

export const metadata = {
  title: "About · Institutional AI Initiative",
  description:
    "What this site is, who runs it, and how the University of Idaho's institutional AI work is organized.",
};

export default function AboutPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          About
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ui-charcoal">
          The Institutional AI Initiative
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700">
          A coordination nexus for the University of Idaho&rsquo;s
          institutional AI work, operated by the{" "}
          <strong>Institute for Interdisciplinary Data Sciences</strong>{" "}
          (IIDS). The site shows what&rsquo;s being built, what&rsquo;s
          stalled, and where to engage.
        </p>
      </header>

      {/* What this site is */}
      <Callout title="What this site is">
        <p>
          The Institutional AI Initiative site is a single surface for
          institutional AI activity at UI. It maintains a growing inventory
          of AI projects across UI units &mdash; some built by IIDS,
          some led by partner units, some from the AI4RA partnership UI
          deploys institutionally &mdash; and surfaces operational
          ownership, project status, and the institutional standards
          governing AI work.
        </p>
        <p className="mt-3">
          The site is operated by IIDS, which runs MindRouter and the DGX
          Stack and is the University&rsquo;s primary builder for
          institutional AI software.
        </p>
      </Callout>

      {/* The four surfaces */}
      <section>
        <h2 className="text-lg font-semibold text-ui-charcoal">
          How the site is organized
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Four primary surfaces, each with one job.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Link
            href="/portfolio"
            className="group block rounded-xl border border-hairline bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              Projects
            </p>
            <h3 className="mt-2 text-base font-semibold text-ui-charcoal">
              Portfolio of AI projects
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Each entry names a UI home unit, an operational owner, and
              current status. Active blockers are first-class &mdash; named
              and dated, not buried in a status field.
            </p>
          </Link>
          <Link
            href="/builder-guide"
            className="group block rounded-xl border border-hairline bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              Submit a Project
            </p>
            <h3 className="mt-2 text-base font-semibold text-ui-charcoal">
              9-step assessment
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Scopes the idea, classifies it into one of four tiers,
              surfaces similar projects already in the registry, and
              connects the submitter to a named IIDS owner with a 2
              business-day SLA.
            </p>
          </Link>
          <Link
            href="/standards"
            className="group block rounded-xl border border-hairline bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              Standards
            </p>
            <h3 className="mt-2 text-base font-semibold text-ui-charcoal">
              Outstanding institutional standards
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              A public ledger of the software-development and
              user-experience standards IIDS has formally requested from
              OIT. Each entry shows the date requested and elapsed time;
              the page updates when OIT publishes a standard.
            </p>
          </Link>
          <Link
            href="/reports"
            className="group block rounded-xl border border-hairline bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
              Reports
            </p>
            <h3 className="mt-2 text-base font-semibold text-ui-charcoal">
              Activity reports and briefs
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Time-stamped artifacts produced by IIDS and partner
              leadership. Reverse-chronological timeline; featured-hero
              treatment for the most recent activity report.
            </p>
          </Link>
        </div>
      </section>

      {/* Audiences */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ui-charcoal">
          Who this is for
        </h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-ui-charcoal">
              Institutional stakeholders
            </h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              Deans, the Provost&rsquo;s office, ORED leadership,
              partner-unit leadership. The Projects and Reports surfaces are
              designed for scanning &mdash; owner names and home-unit
              groupings let a stakeholder find their unit&rsquo;s slice
              without reading everything.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ui-charcoal">
              Faculty and staff with an AI idea
            </h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              Start with{" "}
              <Link
                href="/builder-guide"
                className="text-brand-black hover:underline"
              >
                Submit a Project
              </Link>
              . The assessment scopes the idea, recommends a tech path,
              and routes it to a named IIDS owner. You&rsquo;ll get a
              bookmarkable status URL.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ui-charcoal">
              Builders and technical staff
            </h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              The{" "}
              <Link
                href="/docs"
                className="text-brand-black hover:underline"
              >
                Documentation
              </Link>{" "}
              section covers architecture, API, deployment, and the
              MindRouter integration. Use{" "}
              <Link
                href="/portfolio"
                className="text-brand-black hover:underline"
              >
                Projects
              </Link>{" "}
              to find related ongoing efforts before starting something
              new.
            </p>
          </div>
        </div>
      </section>

      {/* AI4RA partnership */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Partnership
        </p>
        <h2 className="mt-2 text-lg font-semibold text-ui-charcoal">
          AI4RA &mdash; UI &amp; Southern Utah University
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          <strong>AI4RA</strong> is a UI + Southern Utah University NSF
          GRANTED partnership producing open-source reference tools for
          research administration. Several AI4RA projects have a{" "}
          <em>dual destiny</em>: an open-source release that any
          institution can adopt, plus a UI deployment that lives in the
          institutional portfolio (OpenERA, Vandalizer, MindRouter,
          ProcessMapping among them).
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          AI4RA also produces reference assets &mdash; the Unified Data
          Model spec, prompt library, evaluation harness, and the eCFR
          MCP server &mdash; that aren&rsquo;t themselves UI deployments
          but inform how the UI portfolio is built.
        </p>
        <p className="mt-4 text-sm">
          <Link
            href="/ai4ra-ecosystem"
            className="font-medium text-brand-black hover:underline"
          >
            See the AI4RA ecosystem in detail &rarr;
          </Link>
        </p>
      </section>

      {/* Repo / charter history */}
      <section className="rounded-xl bg-ui-charcoal p-6 text-white">
        <h2 className="text-base font-semibold text-white">
          A note on the repository name
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          The repository (<code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">AISPEG</code>)
          and deployment URLs (<code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">aispeg.insight.uidaho.edu</code>)
          carry the legacy <em>AISPEG</em> identifier from the
          project&rsquo;s origin as a collaboration site for the AI
          Strategic Plan Execution Group, a Presidentially-chartered
          cross-cutting initiative. That group is dormant; user-facing
          surfaces present the site as IIDS-coordinated. The infrastructure
          identifiers were kept rather than renamed because the cost of
          coordinated rename across CI, deployment, and database is
          higher than the value of the cosmetic alignment.
        </p>
      </section>

      {/* Tech stack quick reference */}
      <section>
        <h2 className="text-lg font-semibold text-ui-charcoal">
          Built with
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          The site itself uses the same stack the assessment recommends
          for Tier 2 applications.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Next.js 16", note: "App Router, TypeScript" },
            { label: "Tailwind CSS v4", note: "UI brand tokens" },
            { label: "PostgreSQL 16", note: "Registry + blockers" },
            { label: "MindRouter", note: "On-prem LLM cluster" },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-ui-charcoal">
                {row.label}
              </p>
              <p className="mt-1 text-xs text-gray-500">{row.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-6">
        <h2 className="text-base font-semibold text-ui-charcoal">Contact</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          For questions about the platform or to request a consultation,
          reach out to the IIDS team through the usual University of Idaho
          channels. To submit a project idea, use{" "}
          <Link
            href="/builder-guide"
            className="text-brand-black hover:underline"
          >
            Submit a Project
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
