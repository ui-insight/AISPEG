import { DocPage, InfoBox } from "@/components/DocPage";

export default function AdminGuideDocsPage() {
  return (
    <DocPage
      title="Admin Guide"
      subtitle="Managing submissions, the application registry, notes, and the review workflow."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Admin Guide" },
      ]}
    >
      <h2>Submissions Dashboard</h2>
      <p>
        The <strong>Submissions</strong> page (<code>/admin/submissions</code>) shows every idea
        that has come through the App Builder Guide. The dashboard displays:
      </p>
      <ul>
        <li>Summary stats: total, new, in-progress, and archived counts</li>
        <li>Sortable table with date, idea preview, submitter, department, tier, score, and status</li>
      </ul>
      <p>Click any row to open the submission detail page.</p>

      <h3>Submission Statuses</h3>
      <ul>
        <li><strong>new</strong> — Just submitted, not yet reviewed</li>
        <li><strong>reviewed</strong> — Someone has looked at it</li>
        <li><strong>in-progress</strong> — Being actively worked on (auto-set when promoted to registry)</li>
        <li><strong>archived</strong> — Closed, no further action</li>
      </ul>

      <h3>Submission Detail Page</h3>
      <p>
        Each submission detail page (<code>/admin/submissions/[id]</code>) shows the full
        picture:
      </p>
      <ul>
        <li><strong>Status management</strong> — Change the status via dropdown</li>
        <li><strong>Project idea</strong> — The user&apos;s original description</li>
        <li><strong>Quiz answers</strong> — All classification data (sensitivity, data sources, systems, etc.)</li>
        <li><strong>Raw JSON</strong> — Collapsible view of the complete answer payload</li>
        <li><strong>Similar Applications</strong> — Overlap detection against the registry (see below)</li>
        <li><strong>Notes</strong> — Add review notes with author name</li>
        <li><strong>Promote to Registry</strong> — One-click promotion button</li>
      </ul>

      <h2>Similar Applications</h2>
      <p>
        The similarity panel on each submission compares it against all non-retired applications
        in the registry. The engine scores overlap across 8 dimensions:
      </p>
      <ul>
        <li><strong>Data Sources</strong> (25% weight) — Highest signal for duplication</li>
        <li><strong>University Systems</strong> (25%) — Same systems = likely overlap</li>
        <li><strong>Sensitivity</strong> (15%) — Same compliance profile</li>
        <li><strong>Integrations</strong> (10%)</li>
        <li><strong>Output Types</strong> (10%)</li>
        <li><strong>Complexity, User Base, Auth</strong> (5% each)</li>
      </ul>
      <p>
        Matches show as cards with percentage scores and color-coded badges: red (60%+), orange
        (40%+), yellow (30%+). Click <strong>&ldquo;Check Now&rdquo;</strong> to recompute against
        the latest registry data.
      </p>

      <InfoBox type="warning" title="Similarity is advisory, not automatic">
        A high similarity score doesn&apos;t mean the submission is a duplicate — it means there&apos;s
        significant overlap in the data and systems involved. Two applications might access
        Banner Student data for completely different purposes. Use similarity scores to start
        conversations, not to block submissions.
      </InfoBox>

      <h2>Promote to Registry</h2>
      <p>
        When a submission is approved, click <strong>&ldquo;Promote to Registry&rdquo;</strong>
        to create a new entry in the Application Registry. This:
      </p>
      <ul>
        <li>Creates an application record pre-populated with all wizard data</li>
        <li>Sets the application status to &ldquo;approved&rdquo;</li>
        <li>Sets the submission status to &ldquo;in-progress&rdquo;</li>
        <li>Links the application back to the original submission</li>
        <li>Redirects you to the new registry entry for editing</li>
      </ul>

      <h2>Application Registry</h2>
      <p>
        The <strong>App Registry</strong> page (<code>/admin/registry</code>) is the portfolio
        view of all applications. It shows:
      </p>
      <ul>
        <li>Status distribution across all lifecycle states</li>
        <li>Table with name, owner, department, status, tier, sensitivity, systems, and last update</li>
        <li>Links to detail pages for each application</li>
      </ul>

      <h3>Application Lifecycle</h3>
      <p>Applications progress through these states:</p>
      <ul>
        <li><strong>idea</strong> — Concept stage, not yet approved</li>
        <li><strong>approved</strong> — Approved to proceed (auto-set when promoted)</li>
        <li><strong>in-development</strong> — Actively being built</li>
        <li><strong>staging</strong> — Deployed to a test environment</li>
        <li><strong>production</strong> — Live and serving users</li>
        <li><strong>retired</strong> — Decommissioned (excluded from similarity checks)</li>
      </ul>

      <h3>Registry Detail Page</h3>
      <p>
        Each registry entry (<code>/admin/registry/[id]</code>) has an editable form for:
      </p>
      <ul>
        <li>Name, description, status</li>
        <li>Owner name and email</li>
        <li>Department</li>
        <li>GitHub repository (e.g., <code>ui-insight/my-app</code>)</li>
        <li>Production URL</li>
      </ul>
      <p>
        Classification data (tier, sensitivity, data sources, etc.) is read-only — it comes
        from the original wizard assessment or was set at registration time.
      </p>

      <h3>Manual Registration</h3>
      <p>
        To register an application that didn&apos;t come through the Builder Guide, click
        <strong> &ldquo;Register App&rdquo;</strong> on the registry page. This is useful for
        existing applications that predate AISPEG.
      </p>

      <h2>Notes System</h2>
      <p>
        Notes are simple text entries attached to submissions. Each note has an author name and
        timestamp. Use notes to:
      </p>
      <ul>
        <li>Record review decisions and rationale</li>
        <li>Document conversations with the submitter</li>
        <li>Flag concerns or next steps</li>
        <li>Coordinate between multiple reviewers</li>
      </ul>
    </DocPage>
  );
}
