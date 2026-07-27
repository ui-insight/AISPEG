import { DocPage, InfoBox } from "@/components/DocPage";

function Endpoint({
  method,
  path,
  description,
  children,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  children?: React.ReactNode;
}) {
  const methodColors = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PATCH: "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700",
  };

  return (
    <div className="not-prose rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <span className={`rounded px-2.5 py-1 text-xs font-bold font-mono ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-sm font-semibold text-ui-charcoal">{path}</code>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      {children}
    </div>
  );
}

function ParamTable({ params }: { params: { name: string; type: string; desc: string }[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
          <th className="pb-2 pr-4">Parameter</th>
          <th className="pb-2 pr-4">Type</th>
          <th className="pb-2">Description</th>
        </tr>
      </thead>
      <tbody>
        {params.map((p) => (
          <tr key={p.name} className="border-b border-gray-100">
            <td className="py-2 pr-4 font-mono text-xs text-ui-charcoal">{p.name}</td>
            <td className="py-2 pr-4 text-xs text-gray-500">{p.type}</td>
            <td className="py-2 text-xs text-gray-600">{p.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ApiReferenceDocsPage() {
  return (
    <DocPage
      title="API Reference"
      subtitle="REST API endpoints for submissions, the application registry, notes, similarity detection, AI features, the site assistant, and the ClickUp sync trigger."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "API Reference" },
      ]}
    >
      <InfoBox type="info" title="Base URL">
        All endpoints are relative to the application root. In production:
        <code className="ml-1">https://aispeg.insight.uidaho.edu</code>
      </InfoBox>

      <h2>Submissions</h2>

      <div className="not-prose space-y-4">
        <Endpoint method="GET" path="/api/submissions" description="List all submissions with details. Returns the 200 most recent, ordered by creation date descending." />

        <Endpoint method="POST" path="/api/submissions" description="Create a new submission from the Builder Guide wizard.">
          <ParamTable params={[
            { name: "idea_text", type: "string", desc: "Free-text idea description" },
            { name: "answers", type: "object", desc: "Complete quiz answers keyed by step ID" },
            { name: "score", type: "number", desc: "Computed complexity score" },
            { name: "tier", type: "number", desc: "Tier classification (1-4)" },
            { name: "submitter_name", type: "string?", desc: "Optional submitter name" },
            { name: "submitter_email", type: "string?", desc: "Optional email" },
            { name: "department", type: "string?", desc: "Optional department" },
          ]} />
        </Endpoint>

        <Endpoint method="GET" path="/api/submissions/[id]" description="Get a single submission with all details." />

        <Endpoint method="PATCH" path="/api/submissions/[id]" description="Update submission fields (primarily status).">
          <ParamTable params={[
            { name: "status", type: "string", desc: "new | reviewed | in-progress | archived" },
          ]} />
        </Endpoint>
      </div>

      <h2>Submission Notes</h2>
      <div className="not-prose space-y-4">
        <Endpoint method="GET" path="/api/submissions/[id]/notes" description="List all notes for a submission, newest first." />

        <Endpoint method="POST" path="/api/submissions/[id]/notes" description="Add a note to a submission.">
          <ParamTable params={[
            { name: "author", type: "string", desc: "Name of the note author" },
            { name: "content", type: "string", desc: "Note text content" },
          ]} />
        </Endpoint>
      </div>

      <h2>Similarity Detection</h2>
      <div className="not-prose space-y-4">
        <Endpoint method="GET" path="/api/submissions/[id]/similarity" description="Get cached similarity matches for a submission. Returns application matches with scores and overlap details." />

        <Endpoint method="POST" path="/api/submissions/[id]/similarity" description="Recompute similarity matches against the current registry. Clears old matches and stores new results." />
      </div>

      <h2>Promote to Registry</h2>
      <div className="not-prose space-y-4">
        <Endpoint method="POST" path="/api/submissions/[id]/promote" description="Promote a submission to the Application Registry. Creates a new application entry pre-populated with all wizard data. Returns 409 if already promoted." />
      </div>

      <h2>Application Registry</h2>
      <div className="not-prose space-y-4">
        <Endpoint method="GET" path="/api/registry" description="List all applications in the registry, ordered by status priority then update date." />

        <Endpoint method="POST" path="/api/registry" description="Create a new application manually (not from a submission).">
          <ParamTable params={[
            { name: "name", type: "string", desc: "Application name (required)" },
            { name: "description", type: "string?", desc: "What the application does" },
            { name: "owner_name", type: "string?", desc: "Owner name" },
            { name: "owner_email", type: "string?", desc: "Owner email" },
            { name: "department", type: "string?", desc: "Department" },
            { name: "github_repo", type: "string?", desc: "GitHub repo (org/repo format)" },
            { name: "url", type: "string?", desc: "Production URL" },
            { name: "tier", type: "number?", desc: "1-4, defaults to 1" },
            { name: "status", type: "string?", desc: "Lifecycle status, defaults to 'idea'" },
            { name: "proposed_deployment_environment", type: "string?", desc: "Proposed hosting target; defaults to 'to-be-determined'" },
            { name: "enterprise_replacement_status", type: "string?", desc: "yes | no | to-be-determined" },
            { name: "existing_enterprise_system_name", type: "string?", desc: "Required when replacement status is yes" },
            { name: "existing_enterprise_system_annual_cost_usd", type: "number?", desc: "Current annual license/support cost; required when replacement status is yes" },
            { name: "existing_enterprise_system_renewal_date", type: "date?", desc: "Current agreement renewal date (YYYY-MM-DD)" },
            { name: "sensitivity", type: "string[]?", desc: "Data sensitivity categories" },
            { name: "data_sources", type: "string[]?", desc: "Data sources" },
            { name: "university_systems", type: "string[]?", desc: "University systems" },
          ]} />
        </Endpoint>

        <Endpoint method="GET" path="/api/registry/[id]" description="Get a single application with all fields." />

        <Endpoint method="PATCH" path="/api/registry/[id]" description="Update any application fields. Only provided fields are modified.">
          <ParamTable params={[
            { name: "name", type: "string?", desc: "Application name" },
            { name: "status", type: "string?", desc: "idea | approved | in-development | staging | production | retired" },
            { name: "github_repo", type: "string?", desc: "GitHub repository" },
            { name: "url", type: "string?", desc: "Production URL" },
            { name: "...", type: "...", desc: "Any other application field" },
          ]} />
        </Endpoint>

        <Endpoint method="DELETE" path="/api/registry/[id]" description="Delete an application from the registry." />
      </div>

      <h2>AI Endpoints</h2>
      <div className="not-prose space-y-4">
        <Endpoint method="POST" path="/api/ai/analyze-idea" description="Analyze a free-text application idea via MindRouter. Returns structured suggestions for all quiz dimensions plus clarifying questions, similar tools, and risk considerations.">
          <ParamTable params={[
            { name: "idea", type: "string", desc: "Application idea description (min 10 chars)" },
          ]} />
          <p className="text-xs text-gray-500 mt-2">Returns 503 if MINDROUTER_API_KEY is not configured.</p>
        </Endpoint>

        <Endpoint method="POST" path="/api/ai/refine" description="Multi-turn conversational refinement via MindRouter. System prompt acts as a U of I IT consultant.">
          <ParamTable params={[
            { name: "messages", type: "array", desc: "Array of {role: 'user'|'assistant', content: string}" },
          ]} />
          <p className="text-xs text-gray-500 mt-2">Returns 503 if MINDROUTER_API_KEY is not configured.</p>
        </Endpoint>

        <Endpoint method="POST" path="/api/ask" description="The site assistant. Runs the tool-using agent loop over read-only site data and returns a cited answer. Backs the floating chat widget on every page. See ADR 0007.">
          <ParamTable params={[
            { name: "message", type: "string", desc: "User question. Required; 2000 chars max." },
            { name: "history", type: "array", desc: "Optional prior turns as {role: 'user'|'assistant', content}. Last 20 kept; other roles are dropped." },
          ]} />
          <p className="text-xs text-gray-500 mt-2">
            Returns <code>{`{ response, citations[], toolCalls[], iterations, truncated, salvagedToolCalls }`}</code>.
            Citations are assembled from the tools&apos; own canonical URLs, never authored by the model.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Rate limited per IP hash: 60/hour public, 600/hour internal. Over the
            limit returns <strong>429</strong> with <code>Retry-After</code>,
            <code>X-RateLimit-Limit</code>, and <code>X-RateLimit-Remaining</code>.
            Returns 503 with <code>unconfigured: true</code> when
            MINDROUTER_API_KEY is unset.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            A MindRouter outage returns <strong>200</strong>, not 500 — the body
            carries a friendly fallback message and <code>fallback: true</code> so
            the chat widget degrades instead of erroring. Every call is logged to{" "}
            <code>agent_queries</code>.
          </p>
        </Endpoint>
      </div>

      <h2>Similarity</h2>
      <div className="not-prose space-y-4">
        <Endpoint method="POST" path="/api/similarity/preview" description="Stateless similarity check against the registry. Takes a partial assessment profile and returns matches without persisting anything — used mid-assessment so a submitter can coordinate before duplicating effort.">
          <ParamTable params={[
            { name: "sensitivity", type: "string[]", desc: "Partial wizard answers — all fields optional" },
            { name: "complexity", type: "string", desc: "Static | CRUD | Multi-source | Real-time" },
            { name: "userbase", type: "string", desc: "Team | Department | College | University | External" },
            { name: "auth", type: "string", desc: "None | Password | SSO | RBAC | Multi-tenant" },
            { name: "integrations", type: "string[]", desc: "" },
            { name: "dataSources", type: "string[]", desc: "" },
            { name: "universitySystems", type: "string[]", desc: "" },
            { name: "outputTypes", type: "string[]", desc: "" },
          ]} />
          <p className="text-xs text-gray-500 mt-2">
            Distinct from <code>/api/submissions/[id]/similarity</code>, which
            persists matches after a real submission. This runs at threshold
            <strong> 0.2</strong> rather than 0.3 — deliberately over-notifying and
            letting the submitter judge.
          </p>
        </Endpoint>
      </div>

      <h2>Operations</h2>
      <div className="not-prose space-y-4">
        <Endpoint method="POST" path="/internal/sync" description="Trigger a ClickUp ingestion run (ADR 0004). Pulls project status updates, ROI fields, and the scored request backlog into the clickup_* tables.">
          <p className="text-xs text-gray-500 mt-2">
            Lives under <code>/internal</code> so the Basic-auth proxy covers it.
            Used by the &ldquo;Sync now&rdquo; button and by the host cron:
          </p>
          <pre className="mt-2 rounded-lg bg-gray-900 p-3 text-xs text-green-400 overflow-x-auto">{`curl -s -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASS" -X POST \\
  https://aispeg.insight.uidaho.edu/internal/sync`}</pre>
          <p className="text-xs text-gray-500 mt-2">
            Returns the run summary on success. <strong>503</strong> if
            CLICKUP_API_TOKEN is unset; <strong>409</strong> if a sync is already
            in flight — a run takes 30–60s of sequential ClickUp calls and
            overlapping runs would double-write.
          </p>
        </Endpoint>
      </div>

      <InfoBox type="tip" title="Keeping this page honest">
        This page drifted badly once already (issue #94): it documented the
        registry and submissions endpoints while missing the site assistant, the
        similarity preview, and the sync trigger entirely. If you add a route
        under <code>app/api/</code>, add it here in the same PR.
      </InfoBox>
    </DocPage>
  );
}
