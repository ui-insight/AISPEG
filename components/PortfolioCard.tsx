import Link from "next/link";
import type { PortfolioProject, PortfolioStatus } from "@/lib/portfolio";

const statusStyles: Record<PortfolioStatus, string> = {
  Production: "bg-green-100 text-green-800",
  "Active development": "bg-blue-100 text-blue-800",
  Beta: "bg-amber-100 text-amber-800",
  Research: "bg-purple-100 text-purple-800",
  Archived: "bg-gray-100 text-gray-600",
};

export default function PortfolioCard({
  project,
}: {
  project: PortfolioProject;
}) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ui-charcoal group-hover:text-ui-gold-dark transition-colors">
            {project.name}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">{project.role}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
        >
          {project.status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {project.tagline}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
          >
            {t}
          </span>
        ))}
        {project.tech.length > 4 && (
          <span className="text-xs text-gray-400">
            +{project.tech.length - 4}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-gray-400">
        {project.isPrivate ? (
          <span className="inline-flex items-center gap-1 rounded border border-gray-200 px-1.5 py-0.5">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Private
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded border border-gray-200 px-1.5 py-0.5">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
            Open source
          </span>
        )}
        {project.funding && (
          <span className="truncate text-ui-gold-dark">{project.funding}</span>
        )}
      </div>
    </Link>
  );
}
