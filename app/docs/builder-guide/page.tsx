import { DocPage, InfoBox } from "@/components/DocPage";
import Link from "next/link";

export default function BuilderGuideDocsPage() {
  return (
    <DocPage
      title="Submit-a-Project assessment"
      subtitle="How the 9-step assessment scopes a project, surfaces similar work in the registry, and routes the submission to a named IIDS owner."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Submit a Project" },
      ]}
    >
      <h2>Overview</h2>
      <p>
        <Link href="/builder-guide">Submit a project</Link> is an interactive questionnaire
        that walks you through scoping an application idea. By answering questions about your
        data, users, and integration needs, the wizard determines what tier your application
        falls into and recommends the right standards, tech stack, deployment path, and GitHub
        template.
      </p>

      <h2>How It Works</h2>

      <h3>Step 1: Describe Your Idea</h3>
      <p>
        Start by writing a plain-language description of what you want to build. Be as specific
        as you can — mention the data you need, who will use it, and what problem it solves.
        This text is stored with your submission so reviewers understand your goal.
      </p>

      <InfoBox type="tip" title="AI-Powered Analysis">
        After writing your idea, click the <strong>&ldquo;Analyze&rdquo;</strong> button to have our
        on-campus LLM (MindRouter) analyze your description. The AI will identify likely
        compliance requirements, suggest data sources and university systems, flag similar
        existing tools, and generate clarifying questions. Click <strong>&ldquo;Apply AI
        Suggestions&rdquo;</strong> to pre-fill subsequent quiz steps — you can still review and
        change every answer.
      </InfoBox>

      <h3>Step 2: Data Sensitivity</h3>
      <p>
        Select all data sensitivity categories that apply to your application. This is critical
        for determining compliance requirements:
      </p>
      <ul>
        <li><strong>FERPA</strong> — Student education records (grades, transcripts, enrollment)</li>
        <li><strong>HIPAA</strong> — Protected health information</li>
        <li><strong>PII</strong> — Personally identifiable information (SSN, financial data)</li>
        <li><strong>CUI</strong> — Controlled Unclassified Information (research/government data)</li>
        <li><strong>Internal Only</strong> — Non-public but not regulated</li>
        <li><strong>No sensitive data</strong> — Fully public information</li>
      </ul>

      <h3>Step 3: Data Complexity</h3>
      <p>How complex is the data your application needs to handle?</p>
      <ul>
        <li><strong>Static content</strong> — Pages, documents, no database needed</li>
        <li><strong>Simple CRUD</strong> — Basic create/read/update/delete operations</li>
        <li><strong>Multi-source integration</strong> — Combining data from multiple systems</li>
        <li><strong>Real-time / streaming</strong> — Live data feeds or event-driven architecture</li>
      </ul>

      <h3>Steps 4-9: Classification</h3>
      <p>The remaining steps assess:</p>
      <ul>
        <li><strong>User Base</strong> — From personal use to university-wide to external/public</li>
        <li><strong>Authentication</strong> — No login through multi-tenant/delegated admin</li>
        <li><strong>Integration Needs</strong> — University APIs, SaaS, AI/LLM, file storage, email</li>
        <li><strong>Data Sources</strong> — Banner, Canvas, LDAP, Slate, research DBs, Google Workspace</li>
        <li><strong>University Systems</strong> — VandalWeb, Banner modules, Canvas, Slate, DUO, CAS</li>
        <li><strong>Output &amp; Actions</strong> — Reporting, record modification, notifications, workflows</li>
      </ul>

      <h3>Review &amp; Results</h3>
      <p>
        After answering all questions, review your answers (click any to edit), then see your
        results. The results page shows:
      </p>
      <ul>
        <li>Your <strong>tier classification</strong> (1-4) with score breakdown</li>
        <li><strong>Recommended tech stack</strong> for your tier</li>
        <li><strong>Deployment path</strong> (where and how to host)</li>
        <li><strong>GitHub template</strong> to start from</li>
        <li><strong>Required standards</strong> (linked to the Standards Roadmap)</li>
        <li><strong>Key considerations</strong> specific to your tier</li>
      </ul>

      <h2>AI Assistant</h2>
      <p>
        A floating <strong>AI Assistant</strong> chat button (purple, bottom-right) is available
        throughout the wizard. Use it to ask questions about:
      </p>
      <ul>
        <li>Data sensitivity categories and what counts as FERPA/HIPAA/PII</li>
        <li>University systems and what they do (Banner, Canvas, Slate, etc.)</li>
        <li>Tech stack recommendations and trade-offs</li>
        <li>Compliance requirements and who to talk to</li>
        <li>Anything else about your application idea</li>
      </ul>
      <p>
        The AI assistant is powered by MindRouter, the university&apos;s on-prem LLM cluster. All
        conversations stay on university infrastructure — no data leaves campus.
      </p>

      <h2>What Happens After Submission</h2>
      <p>
        Your submission is stored in the platform database and appears on the admin dashboard.
        An IIDS reviewer can:
      </p>
      <ul>
        <li>Add notes and change the status of your submission</li>
        <li>Check for similar applications already in the registry</li>
        <li>Promote your submission to the Application Registry when approved</li>
        <li>Connect you with the right resources to get started building</li>
      </ul>

      <InfoBox type="info" title="Your submission is not a commitment">
        Submitting an idea through the assessment doesn&apos;t commit you to anything. It&apos;s a
        way to get guidance and start a conversation with the IIDS team about your needs.
      </InfoBox>
    </DocPage>
  );
}
