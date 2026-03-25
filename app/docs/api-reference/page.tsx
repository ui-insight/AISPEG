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
      subtitle="REST API endpoints for submissions, the application registry, notes, similarity detection, and AI features."
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
      </div>
    </DocPage>
  );
}
