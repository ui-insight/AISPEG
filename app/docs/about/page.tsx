import { DocPage, InfoBox } from "@/components/DocPage";

export default function AboutPage() {
  return (
    <DocPage
      title="About this site"
      subtitle="Coordination nexus for the University of Idaho's institutional AI initiative."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "About" },
      ]}
    >
      <h2>What this site is</h2>
      <p>
        The Institutional AI Initiative site is the coordination nexus for
        the University of Idaho&apos;s institutional AI work. It maintains
        a growing inventory of AI interventions across UI units — some
        built by IIDS, others led by partner units, plus tools from the
        AI4RA partnership that UI deploys institutionally — and surfaces
        operational ownership, project status, and the institutional
        standards governing AI work.
      </p>
      <p>
        The site is operated by <strong>IIDS</strong> (Institute for
        Interdisciplinary Data Sciences), which runs MindRouter and the
        DGX Stack and is the University&apos;s primary builder for
        institutional AI software.
      </p>

      <InfoBox type="info" title="Repository note">
        The repo name (<code>AISPEG</code>) and deployment URLs
        (<code>aispeg.insight.uidaho.edu</code>) are historical — the
        project began in early 2026 as a collaboration site for the AI
        Strategic Plan Execution Group. That group is dormant.
        User-facing surfaces present the site as IIDS-coordinated. See
        the <code>REFACTOR.md</code> at the project root for the May 2026
        refactor history.
      </InfoBox>

      <h2>What it does</h2>
      <p>The site has four primary surfaces:</p>
      <ul>
        <li>
          <strong>The Work</strong> — a portfolio of AI interventions
          across UI units. Each entry names a home unit and operational
          owner, and shows current status. Grouped by home unit so a
          stakeholder can scan their unit&apos;s slice quickly.
        </li>
        <li>
          <strong>Submit a Project</strong> — a 9-step assessment that
          scopes an AI idea, classifies it into one of four tiers, runs
          similarity matching against the registry to surface related work,
          and connects the submitter to a named owner at IIDS.
        </li>
        <li>
          <strong>Reports</strong> — written briefs, presentation decks,
          and time-stamped public artifacts. Reverse-chronological.
        </li>
        <li>
          <strong>Standards</strong> — public ledger of the institutional
          software-development and user-experience standards IIDS has
          formally requested from the Office of Information Technology.
          Each entry shows the date requested and elapsed time since;
          entries move to <em>Published</em> as OIT releases them.
        </li>
      </ul>
      <p>
        Plus an admin surface for the registry and submissions queue, an
        AI4RA partnership reference page, and this documentation surface.
      </p>

      <h2>Who it&apos;s for</h2>

      <h3>Institutional stakeholders</h3>
      <p>
        Deans, ORED leadership, the Provost&apos;s office, partner-unit
        leadership. The Work and Reports surfaces are designed for scanning
        — owner names and home-unit groupings let a stakeholder find their
        unit&apos;s slice without reading everything.
      </p>

      <h3>Faculty and staff with an AI project idea</h3>
      <p>
        Start with the <strong>Submit a Project</strong> assessment.
        Describe the idea in plain language and answer the questions about
        data, users, and integrations. The assessment will tier the
        request, recommend a tech path, and route it to a named IIDS owner
        for follow-up.
      </p>

      <h3>Builders and technical staff</h3>
      <p>
        Use the <strong>Architecture</strong> and <strong>API
        Reference</strong> docs to understand the platform itself. Use
        <strong> Standards</strong> to see which institutional standards
        have been requested and where they stand. Use <strong>The
        Work</strong> to find related ongoing efforts before starting
        something new.
      </p>

      <h3>IIDS team and partner-unit co-builders</h3>
      <p>
        The admin surface (<code>/admin</code>) holds the registry and
        submissions queue. During the post-Sprint-1 transition the
        ClickUp wiring is in progress; once it lands, project status and
        blockers flow from ClickUp into the public portfolio.
      </p>

      <h2>The tier system</h2>
      <p>
        Every application assessed through the Submit-a-Project flow is
        classified into one of four tiers based on its complexity, data
        sensitivity, user base, and integration needs:
      </p>

      <InfoBox type="tip" title="Tier overview">
        <ul className="mt-1 space-y-1 text-sm">
          <li><strong>Tier 1 — Simple Static:</strong> No sensitive data, few users, minimal integrations. Deploy to GitHub Pages or Vercel.</li>
          <li><strong>Tier 2 — Standard Web App:</strong> University SSO, moderate data, Docker deployment on Insight servers.</li>
          <li><strong>Tier 3 — Managed Service:</strong> FERPA/PII data, Banner integrations, dedicated infrastructure with monitoring.</li>
          <li><strong>Tier 4 — Enterprise:</strong> HIPAA/CUI, multi-tenant, requires full compliance review and dedicated ops support.</li>
        </ul>
      </InfoBox>

      <h2>Technology</h2>
      <p>
        The site is itself built with the same stack recommended for Tier 2
        applications:
      </p>
      <ul>
        <li><strong>Next.js 16</strong> with App Router and TypeScript</li>
        <li><strong>Tailwind CSS v4</strong> with University of Idaho brand tokens</li>
        <li><strong>PostgreSQL 16</strong> for submissions, registry, and similarity data</li>
        <li><strong>MindRouter</strong> — UI&apos;s on-prem LLM inference cluster for AI features</li>
        <li><strong>Docker</strong> deployment on Insight infrastructure</li>
      </ul>

      <h2>Refactor in progress</h2>
      <p>
        This codebase is mid-refactor. The May 2026 refactor pivots the
        site from its original AISPEG-collaboration framing to an
        IIDS-coordinated institutional AI initiative site. See
        <code> REFACTOR.md</code> at the project root for the strategic
        decisions, sprint sequencing, and current status. Sprint 1
        (information architecture, standards page, AISPEG branding
        removal) shipped in May 2026. Sprints 2–4 will land the
        friction-ledger schema, ClickUp wiring, and final cleanup.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about the platform or to request a consultation,
        reach out to the IIDS team through the usual University of Idaho
        channels.
      </p>
    </DocPage>
  );
}
