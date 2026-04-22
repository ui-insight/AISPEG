import Link from "next/link";
import { interventions } from "@/lib/portfolio";

// AI4RA reference projects — open-source assets produced by the AI4RA
// partnership. These are NOT UI interventions; they are reference material
// that UI's portfolio interventions may reference or consume.

interface AI4RAReference {
  name: string;
  description: string;
  repoUrl: string;
  isPrivate: boolean;
  role: string;
  docsUrl?: string;
}

const referenceProjects: AI4RAReference[] = [
  {
    name: "AI4RA Unified Data Model (UDM)",
    description:
      "Universal data model specification for research administration. 40 tables across 11 domains, 8 pre-built views, complete ontology, and interactive dashboard. The institutional data-modeling standard that UI research-administration apps adopt.",
    repoUrl: "https://github.com/ui-insight/AI4RA-UDM",
    docsUrl: "https://ui-insight.github.io/AI4RA-UDM",
    isPrivate: false,
    role: "Data specification",
  },
  {
    name: "prompt-library",
    description:
      "Versioned storage for prompts, skills, and agents used across AI4RA applications. The canonical home for LLM-component assets; feeds the evaluation infrastructure.",
    repoUrl: "https://github.com/AI4RA/prompt-library",
    isPrivate: false,
    role: "LLM asset library",
  },
  {
    name: "evaluation-harness",
    description:
      "Triad-aware evaluation harness (prompt × data × model) for AI4RA LLM components. Runs the prompt-library against evaluation-data-sets fixtures and produces quality signal.",
    repoUrl: "https://github.com/AI4RA/evaluation-harness",
    isPrivate: true,
    role: "Evaluation infrastructure",
  },
  {
    name: "evaluation-data-sets",
    description:
      "Curated synthetic and real evaluation fixtures supporting the AI4RA skill library. Powers reproducible quality measurement for prompts, skills, and agents.",
    repoUrl: "https://github.com/AI4RA/evaluation-data-sets",
    isPrivate: true,
    role: "Evaluation infrastructure",
  },
  {
    name: "eCFR MCP Server",
    description:
      "Model Context Protocol server exposing the Electronic Code of Federal Regulations to Claude and other MCP-compatible agents. Brings authoritative federal regulation text into AI-assisted research administration workflows.",
    repoUrl: "https://github.com/AI4RA/mcp-ecfr",
    isPrivate: false,
    role: "MCP server",
  },
  {
    name: "herd-survey",
    description:
      "Internal tooling for herd-survey result access and report preparation across participating institutions.",
    repoUrl: "https://github.com/AI4RA/herd-survey",
    isPrivate: true,
    role: "Research tool",
  },
  {
    name: "AI4RA Discussions",
    description:
      "Shared space for technical discussions, contribution workflows, and developer support across AI4RA repositories. Open to external research administration contributors.",
    repoUrl: "https://github.com/AI4RA/discussions",
    isPrivate: false,
    role: "Community",
  },
];

const ai4raCoreInterventions = interventions.filter(
  (i) => i.ai4raRelationship === "Core" && i.visibility !== "Internal-only"
);

export default function AI4RAEcosystemPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">
          AI4RA Ecosystem
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          AI4RA is a{" "}
          <strong className="text-ui-charcoal">
            University of Idaho + Southern Utah University NSF GRANTED
            partnership
          </strong>{" "}
          producing open-source reference tools and data specifications for
          research administration. The projects below are <em>reference
          material</em> — they are not UI operational interventions; they are
          community assets that UI&apos;s own interventions may adopt, extend,
          or contribute back to.
        </p>
        <div className="mt-4">
          <a
            href="https://ai4ra.uidaho.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-black px-4 py-2 text-sm font-semibold text-white hover:bg-brand-black/85 unstyled"
          >
            Visit ai4ra.uidaho.edu &rarr;
          </a>
        </div>
      </div>

      {/* Context card */}
      <div className="rounded-xl border-l-4 border-ui-gold bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">About the partnership</p>
        <div className="mt-2 space-y-3 text-sm leading-relaxed text-gray-700">
          <p>
            <strong className="text-ui-charcoal">Funding:</strong> NSF GRANTED
            program, Award{" "}
            <a
              href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2427549"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ui-gold-dark hover:underline"
            >
              #2427549
            </a>
            .
          </p>
          <p>
            <strong className="text-ui-charcoal">Partners:</strong> University
            of Idaho (prime), Southern Utah University (subaward). AI4RA is
            currently a two-institution consortium; additional peer
            institutions adopt open-source outputs (Vandalizer, MindRouter,
            DGX Stack) without being consortium members.
          </p>
          <p>
            <strong className="text-ui-charcoal">Dual-destiny pattern:</strong>{" "}
            AI4RA produces <em>open-source reference implementations</em>{" "}
            (released to the community) while UI separately maintains{" "}
            <em>UI-specific deployments</em> of the same tools, configured
            and operated for UI&apos;s institutional context. The two paths
            are tracked separately.
          </p>
        </div>
      </div>

      {/* Reference projects */}
      <section className="space-y-4">
        <div className="border-l-4 border-ui-gold pl-4">
          <h2 className="text-xl font-bold text-ui-charcoal">
            Reference projects
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Open-source assets published by the AI4RA partnership. Most are
            consumable by any institution.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {referenceProjects.map((p) => (
            <a
              key={p.name}
              href={p.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
                  {p.name}
                </h3>
                {p.isPrivate && (
                  <span className="shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                    Private
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">{p.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {p.description}
              </p>
              <p className="mt-auto pt-4 text-xs font-medium text-ui-gold-dark group-hover:underline">
                View on GitHub &rarr;
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* UI interventions that touch AI4RA */}
      <section className="space-y-4">
        <div className="border-l-4 border-ui-gold pl-4">
          <h2 className="text-xl font-bold text-ui-charcoal">
            UI interventions in the AI4RA Core
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            UI operational interventions that are also AI4RA dual-destiny
            projects — an open-source reference implementation maintained for
            the community alongside a UI-specific deployment.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ai4raCoreInterventions.map((i) => (
            <Link
              key={i.slug}
              href={`/portfolio/${i.slug}`}
              className="group rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-ui-gold/40"
            >
              <p className="text-sm font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
                {i.name}
              </p>
              <p className="mt-1 text-xs text-gray-500">{i.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Pointer to portfolio */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          Looking for what UI is running?
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          This page is reference material for the broader community. For the
          list of AI interventions actually running in UI operations, with
          home units, operational owners, and status:
        </p>
        <p className="mt-3">
          <Link
            href="/portfolio"
            className="font-medium text-ui-gold-dark hover:underline"
          >
            See the UI portfolio &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
