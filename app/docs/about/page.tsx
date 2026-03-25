import { DocPage, InfoBox } from "@/components/DocPage";

export default function AboutPage() {
  return (
    <DocPage
      title="About AISPEG"
      subtitle="The AI Strategic Planning & Evaluation Group at the University of Idaho."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "About AISPEG" },
      ]}
    >
      <h2>What is AISPEG?</h2>
      <p>
        AISPEG (AI Strategic Planning & Evaluation Group) is a cross-functional initiative at the
        University of Idaho focused on guiding the responsible adoption of AI-powered and
        agent-coded applications across campus. We provide standards, tools, and governance
        frameworks to help anyone at the university build software the right way.
      </p>

      <h2>Mission</h2>
      <p>
        Our mission is to <strong>lower the barrier to building useful applications</strong> while
        <strong> maintaining institutional standards</strong> for data security, compliance, and
        quality. We believe that the best way to govern a growing ecosystem of AI-assisted
        applications is not to restrict who can build them, but to provide clear guardrails and
        on-ramps.
      </p>

      <h2>What This Platform Does</h2>
      <p>This site serves as the central hub for AISPEG&apos;s work. It includes:</p>
      <ul>
        <li>
          <strong>App Builder Guide</strong> — An interactive wizard that helps you scope an
          application idea, understand compliance requirements, and get pointed to the right
          template and deployment path.
        </li>
        <li>
          <strong>Application Registry</strong> — A portfolio of every application being built
          or running across the university, with classification data and similarity detection
          to prevent duplication.
        </li>
        <li>
          <strong>Standards Roadmap</strong> — Living documentation of the coding, security,
          documentation, and QA standards that apply at each tier of application complexity.
        </li>
        <li>
          <strong>Strategic Resources</strong> — Principles, lessons learned, an agent playbook,
          and a knowledge base capturing institutional knowledge about AI adoption.
        </li>
        <li>
          <strong>AI-Powered Assistance</strong> — On-prem LLM integration via MindRouter
          that helps users articulate their ideas and pre-fills technical assessments.
        </li>
      </ul>

      <h2>Who Should Use This</h2>

      <h3>Faculty & Staff with an App Idea</h3>
      <p>
        Start with the <strong>App Builder Guide</strong>. Describe your idea in plain language
        and answer a few questions about data, users, and systems. The wizard will tell you what
        tier your application falls into, what compliance standards apply, and which GitHub
        template to start from.
      </p>

      <h3>Developers & Technical Staff</h3>
      <p>
        Use the <strong>Standards Roadmap</strong> to understand what&apos;s expected at each tier.
        Check the <strong>API Reference</strong> and <strong>Architecture</strong> docs if
        you&apos;re building on or integrating with the AISPEG platform itself.
      </p>

      <h3>IT Leadership & Governance</h3>
      <p>
        The <strong>Application Registry</strong> provides portfolio-level visibility into what&apos;s
        being built, which systems are being accessed, and where compliance risks exist. The
        <strong> Submissions</strong> dashboard shows incoming demand.
      </p>

      <h2>The Tier System</h2>
      <p>
        Every application assessed through the Builder Guide is classified into one of four tiers
        based on its complexity, data sensitivity, user base, and integration needs:
      </p>

      <InfoBox type="tip" title="Tier Overview">
        <ul className="mt-1 space-y-1 text-sm">
          <li><strong>Tier 1 — Simple Static:</strong> No sensitive data, few users, minimal integrations. Deploy to GitHub Pages or Vercel.</li>
          <li><strong>Tier 2 — Standard Web App:</strong> University SSO, moderate data, Docker deployment on Insight servers.</li>
          <li><strong>Tier 3 — Managed Service:</strong> FERPA/PII data, Banner integrations, dedicated infrastructure with monitoring.</li>
          <li><strong>Tier 4 — Enterprise:</strong> HIPAA/CUI, multi-tenant, requires full compliance review and dedicated ops support.</li>
        </ul>
      </InfoBox>

      <h2>Technology</h2>
      <p>
        This platform is itself built with the same stack we recommend for Tier 2 applications:
      </p>
      <ul>
        <li><strong>Next.js 16</strong> with App Router and TypeScript</li>
        <li><strong>Tailwind CSS v4</strong> with University of Idaho brand colors</li>
        <li><strong>PostgreSQL 16</strong> for submissions, registry, and similarity data</li>
        <li><strong>MindRouter</strong> — U of I&apos;s on-prem LLM inference cluster for AI features</li>
        <li><strong>Docker</strong> deployment on Insight infrastructure</li>
      </ul>

      <h2>Contact</h2>
      <p>
        AISPEG operates out of the Office of Information Technology at the University of Idaho.
        For questions about the platform, application standards, or to request a consultation,
        reach out to the AISPEG team through existing university channels.
      </p>
    </DocPage>
  );
}
