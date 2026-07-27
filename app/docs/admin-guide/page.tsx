import { DocPage, InfoBox } from "@/components/DocPage";

export default function AdminGuideDocsPage() {
  return (
    <DocPage
      title="Admin Guide"
      subtitle="Managing submissions, the application registry, notes, and the review workflow during the ClickUp transition."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Admin Guide" },
      ]}
    >
      <h2>Submissions Dashboard</h2>
      <p>
        The <strong>Submissions</strong> page (<code>/admin/submissions</code>) shows every idea
        that has come through the Submit-a-Project assessment. The dashboard displays:
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
      <p>
        The canonical lifecycle is the two-layer taxonomy in{" "}
        <a href="https://github.com/ui-insight/AISPEG/blob/main/docs/adr/0001-product-lifecycle-taxonomy.md">
          ADR 0001
        </a>
        : an operational ladder of eleven states plus the <code>tracked</code>{" "}
        meta-state, rolling up into six public stages. Each state has a
        measurable verification rule enforced by{" "}
        <code>npm run verify:portfolio</code> in CI.
      </p>
      <ul>
        <li><strong>idea</strong> — named, no owner or sponsor engaged yet</li>
        <li><strong>scoping</strong> — named humans engaged, feasibility underway, no formal go decision</li>
        <li><strong>approved</strong> — committed to build with named owner and sponsor</li>
        <li><strong>building</strong> — under active development</li>
        <li><strong>prototype</strong> — demo-able but quiet; feature-complete or dormant</li>
        <li><strong>piloting</strong> — in use by a bounded, named cohort</li>
        <li><strong>production</strong> — in real institutional use beyond the pilot</li>
        <li><strong>maintained</strong> — production, maintenance-only mode</li>
        <li><strong>paused</strong> — deliberately on hold; not abandoned</li>
        <li><strong>sunsetting</strong> — winding down with a planned successor</li>
        <li><strong>archived</strong> — stopped; record kept for institutional memory</li>
        <li><strong>tracked</strong> — externally owned; IIDS observes but did not build</li>
      </ul>

      <InfoBox type="info" title="How the status field is constrained">
        <p>
          The status control is a <strong>select</strong> built from{" "}
          <code>PROJECT_STATUSES</code> in <code>lib/portfolio.ts</code>, and{" "}
          <code>POST /api/registry</code> and{" "}
          <code>PATCH /api/registry/[id]</code> both reject a status outside
          the union with a <strong>400</strong>. You cannot save a value the
          taxonomy doesn&apos;t know.
        </p>
        <p className="mt-2">
          This used to be a free-text input with a suggestion list, and the
          suggestions were the legacy submission states plus the pre-ADR-0001
          capitalised union. Because <code>applications.status</code> is plain{" "}
          <code>TEXT</code> with no CHECK constraint, those saved successfully,
          and <code>publicStageFromStatus()</code> buckets anything
          unrecognised as <em>Exploring</em> — so a project could be quietly
          misfiled on <code>/portfolio</code>. A July 2026 audit found four
          divergent copies of the list; there is now one.
        </p>
        <p className="mt-2">
          If you open a record whose stored status predates the taxonomy, the
          select shows it as a marked option so the record isn&apos;t silently
          rewritten on load — pick a replacement and save.
        </p>
      </InfoBox>

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
        To register an application that didn&apos;t come through the Submit-a-Project
        assessment, click <strong> &ldquo;Register App&rdquo;</strong> on the registry page.
        This is useful for existing applications that predate the platform.
      </p>

      <h2>Where the admin surfaces sit now</h2>
      <p>
        <code>/admin/*</code> is <strong>transitional</strong>. The source-of-truth
        boundary has moved since these pages were built:
      </p>
      <ul>
        <li>
          <strong>Project identity and lifecycle</strong> — authored in{" "}
          <code>lib/portfolio.ts</code> and seeded into <code>applications</code>{" "}
          by <code>npm run seed:portfolio</code>. The seed{" "}
          <code>TRUNCATE</code>s, so registry edits made here are{" "}
          <strong>overwritten by the next re-seed</strong>.
        </li>
        <li>
          <strong>Project status narrative and ROI</strong> — ClickUp, pulled
          read-only into <code>clickup_*</code> tables (ADR 0004). Trigger a
          pull with the &ldquo;Sync now&rdquo; button on <code>/internal</code>.
        </li>
        <li>
          <strong>Requests</strong> — the <code>tech_requests</code> registry
          (ADR 0005), surfaced publicly at <code>/portfolio/pipeline</code>.
          That is the one all-origin queue; there is no internal copy.
        </li>
      </ul>
      <p>
        Submissions review — the dashboard, notes, similarity, and promote —
        remains the live workflow here, and is what this page is for. ClickUp
        write-side (new submissions creating ClickUp tasks) is still future
        work; when it lands, <code>/admin/submissions</code> retires.
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
