import { notFound } from "next/navigation";
import Link from "next/link";
import {
  portfolioProjects,
  getProjectBySlug,
  getRelatedProjects,
} from "@/lib/portfolio";

export function generateStaticParams() {
  return portfolioProjects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return params.then(({ slug }) => {
    const project = getProjectBySlug(slug);
    if (!project) return { title: "Not found" };
    return {
      title: `${project.name} · AISPEG Portfolio`,
      description: project.tagline,
    };
  });
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const related = getRelatedProjects(project);

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/portfolio" className="hover:text-ui-gold-dark">
          Portfolio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-400">{project.org}</span>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">{project.name}</span>
      </nav>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ui-gold/15 px-2.5 py-0.5 text-xs font-medium text-ui-gold-dark">
            {project.org}
          </span>
          <span className="rounded-full bg-ui-charcoal/5 px-2.5 py-0.5 text-xs font-medium text-ui-charcoal">
            {project.role}
          </span>
          <StatusBadge status={project.status} />
          {project.isPrivate ? (
            <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600">
              Private
            </span>
          ) : (
            <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600">
              Open source
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold text-ui-charcoal">
          {project.name}
        </h1>
        <p className="mt-2 text-lg text-gray-600">{project.tagline}</p>
        {project.funding && (
          <p className="mt-2 text-sm font-medium text-ui-gold-dark">
            {project.funding}
          </p>
        )}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-ui-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-ui-charcoal/90"
        >
          <GitHubIcon />
          Repository
        </a>
        {project.docsUrl && (
          <a
            href={project.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-ui-charcoal hover:border-ui-gold/40"
          >
            Documentation &rarr;
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-ui-charcoal hover:border-ui-gold/40"
          >
            Live site &rarr;
          </a>
        )}
      </div>

      {/* Overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ui-charcoal">Overview</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          {project.description}
        </p>
      </div>

      {/* Features */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-ui-charcoal">
          Key features
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {project.features.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
            >
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-ui-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tech stack */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-ui-charcoal">
          Tech stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Related projects */}
      {related.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ui-charcoal">
            Related projects
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/portfolio/${r.slug}`}
                className="group rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-ui-gold/40"
              >
                <p className="text-sm font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
                  {r.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">{r.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Production: "bg-green-100 text-green-800",
    "Active development": "bg-blue-100 text-blue-800",
    Beta: "bg-amber-100 text-amber-800",
    Research: "bg-purple-100 text-purple-800",
    Archived: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

function GitHubIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.86 10.92c.58.1.78-.25.78-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.12-3.04 0 0 .97-.31 3.18 1.17a11 11 0 015.78 0C17.27 4.62 18.24 4.93 18.24 4.93c.63 1.58.24 2.75.12 3.04.73.8 1.18 1.82 1.18 3.08 0 4.43-2.7 5.41-5.27 5.69.41.36.77 1.06.77 2.15v3.19c0 .31.2.67.79.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"
      />
    </svg>
  );
}
