import { DocCard } from "@/components/DocPage";

export default function DocsIndexPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Documentation</h1>
        <p className="mt-2 text-gray-600 max-w-3xl">
          User and technical documentation for the Institutional AI
          Initiative site — from the Submit-a-Project assessment to the
          platform architecture and APIs.
        </p>
      </div>

      {/* User Guides */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
          User Guides
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <DocCard
            title="About this site"
            description="What this site does, who it serves, and how it fits into the University of Idaho's institutional AI work."
            href="/docs/about"
            icon="🏛️"
          />
          <DocCard
            title="Submit-a-Project Assessment"
            description="How to use the interactive assessment to scope an AI project idea."
            href="/docs/builder-guide"
            icon="🧭"
          />
          <DocCard
            title="Admin Guide"
            description="Managing submissions, the application registry, and review workflows."
            href="/docs/admin-guide"
            icon="👤"
            badge="Admin"
          />
        </div>
      </div>

      {/* Technical Docs */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
          Technical Documentation
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <DocCard
            title="Architecture & Data Model"
            description="System architecture, database schema, data flow, and similarity engine."
            href="/docs/architecture"
            icon="🏗️"
          />
          <DocCard
            title="API Reference"
            description="REST API endpoints for submissions, registry, notes, and similarity."
            href="/docs/api-reference"
            icon="🔌"
          />
          <DocCard
            title="MindRouter Integration"
            description="On-prem LLM integration for AI-powered idea analysis and chat."
            href="/docs/mindrouter"
            icon="🧠"
          />
          <DocCard
            title="Deployment & Operations"
            description="Docker, database migrations, environment variables, and server setup."
            href="/docs/deployment"
            icon="🚀"
          />
        </div>
      </div>
    </div>
  );
}
