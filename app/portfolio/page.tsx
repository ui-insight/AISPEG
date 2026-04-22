import PortfolioCard from "@/components/PortfolioCard";
import { getProjectsByOrg, portfolioProjects } from "@/lib/portfolio";

export default function PortfolioPage() {
  const aiRaProjects = getProjectsByOrg("AI4RA");
  const uiInsightProjects = getProjectsByOrg("ui-insight");

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Portfolio</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          The active AI portfolio for the University of Idaho and the AI4RA
          community of practice. Organized into two collaborating orgs:{" "}
          <span className="font-medium text-ui-charcoal">AI4RA</span> is the
          cross-institution, research-administration community;{" "}
          <span className="font-medium text-ui-charcoal">ui-insight</span> is
          the institutional product and infrastructure portfolio.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          {portfolioProjects.length} projects tracked &middot; built for
          stakeholders, not an internal changelog
        </p>
      </div>

      {/* Portfolio storyline — key insight */}
      <div className="rounded-xl border-l-4 border-ui-gold bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          How the portfolio fits together
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          <span className="font-semibold text-ui-charcoal">AI4RA UDM</span>{" "}
          defines the data standard.{" "}
          <span className="font-semibold text-ui-charcoal">
            data-governance
          </span>{" "}
          adopts it as the institutional standard. Flagship platforms (
          <span className="font-semibold text-ui-charcoal">OpenERA</span>,{" "}
          <span className="font-semibold text-ui-charcoal">Vandalizer</span>,{" "}
          <span className="font-semibold text-ui-charcoal">MindRouter</span>,{" "}
          <span className="font-semibold text-ui-charcoal">
            Strategic Plan Dashboard
          </span>
          ) implement it. The{" "}
          <span className="font-semibold text-ui-charcoal">TEMPLATE-app</span>{" "}
          propagates the standard to new apps.{" "}
          <span className="font-semibold text-ui-charcoal">
            MindRouter + DGX Stack
          </span>{" "}
          are the LLM substrate. The{" "}
          <span className="font-semibold text-ui-charcoal">
            AI4RA evaluation triad
          </span>{" "}
          is the quality layer.
        </p>
      </div>

      {/* ui-insight section */}
      <section className="space-y-6">
        <div className="border-l-4 border-ui-gold pl-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-ui-charcoal">ui-insight</h2>
            <span className="text-sm text-gray-500">
              University of Idaho &middot; {uiInsightProjects.length} projects
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Institutional products and infrastructure for the University of
            Idaho.
          </p>
        </div>

        {/* Grouped by role */}
        {groupByRole(uiInsightProjects).map(({ role, items }) => (
          <div key={role}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              {role}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <PortfolioCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* AI4RA section */}
      <section className="space-y-6">
        <div className="border-l-4 border-ui-gold pl-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-ui-charcoal">AI4RA</h2>
            <span className="text-sm text-gray-500">
              Community of practice &middot; {aiRaProjects.length} projects
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Shared infrastructure for AI in research administration across
            institutions. Funded in part by NSF GRANTED.
          </p>
        </div>

        {groupByRole(aiRaProjects).map(({ role, items }) => (
          <div key={role}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              {role}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <PortfolioCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// Role ordering for presentation
const ROLE_ORDER = [
  "Platform",
  "Institutional app",
  "Infrastructure",
  "Governance",
  "Evaluation infrastructure",
  "Research tool",
  "Outreach",
  "Community",
] as const;

function groupByRole<T extends { role: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const existing = groups.get(item.role) || [];
    existing.push(item);
    groups.set(item.role, existing);
  }
  return ROLE_ORDER.filter((r) => groups.has(r)).map((role) => ({
    role,
    items: groups.get(role) || [],
  }));
}
