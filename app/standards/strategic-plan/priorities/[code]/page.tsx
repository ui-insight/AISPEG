import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPillar,
  getPriority,
  priorities,
} from "@/lib/strategic-plan/catalog";
import { getProjectsForPriority } from "@/lib/strategic-plan/project-alignment";
import { OPERATIONAL_LABEL } from "@/lib/lifecycle-display";

export function generateStaticParams() {
  return priorities.map((p) => ({ code: p.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const priority = getPriority(code);
  if (!priority) return { title: "Priority not found — Strategic Plan" };
  return {
    title: `Priority ${priority.code} — Strategic Plan`,
    description: priority.text,
  };
}

export default async function PriorityDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const priority = getPriority(code);
  if (!priority) notFound();

  const pillar = getPillar(priority.pillar);

  return (
    <div className="space-y-10">
      <nav className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <Link
          href="/standards/strategic-plan"
          className="font-semibold text-ink-muted hover:text-brand-black"
        >
          ← All pillars
        </Link>
        {pillar && (
          <>
            <span className="text-ink-subtle">/</span>
            <Link
              href={`/standards/strategic-plan/pillars/${pillar.code}`}
              className="font-semibold text-ink-muted hover:text-brand-black"
            >
              Pillar {pillar.code}: {pillar.name}
            </Link>
          </>
        )}
      </nav>

      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-clearwater">
          Priority {priority.code}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">
          {priority.text}
        </h1>
        {pillar && (
          <p className="mt-3 text-sm text-ink-muted">
            Under{" "}
            <Link
              href={`/standards/strategic-plan/pillars/${pillar.code}`}
              className="font-semibold text-brand-black hover:text-brand-clearwater"
            >
              Pillar {pillar.code}: {pillar.name}
            </Link>
          </p>
        )}
      </header>

      <ProjectsAdvancingPriority code={priority.code} />
    </div>
  );
}

function ProjectsAdvancingPriority({ code }: { code: string }) {
  const projects = getProjectsForPriority(code);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-black tracking-tight text-brand-black">
          Projects advancing this priority
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {projects.length === 0
            ? "No IIDS projects have declared alignment with this priority yet."
            : `${projects.length} ${projects.length === 1 ? "IIDS project has" : "IIDS projects have"} declared alignment.`}
        </p>
      </header>

      {projects.length > 0 && (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li
              key={p.slug}
              className="rounded-lg border border-hairline bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-brand-black">
                    <Link
                      href={`/portfolio/${p.slug}`}
                      className="unstyled hover:text-brand-clearwater"
                    >
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {p.tagline}
                  </p>
                  {(p.ownerNames.length > 0 || p.homeUnits.length > 0) && (
                    <p className="mt-2 text-xs text-gray-500">
                      {p.homeUnits[0] && <span>{p.homeUnits[0]}</span>}
                      {p.homeUnits[0] && p.ownerNames.length > 0 && " · "}
                      {p.ownerNames.slice(0, 2).join(", ")}
                      {p.ownerNames.length > 2 && ` +${p.ownerNames.length - 2}`}
                    </p>
                  )}
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full border border-hairline bg-surface-alt px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                  {OPERATIONAL_LABEL[p.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
