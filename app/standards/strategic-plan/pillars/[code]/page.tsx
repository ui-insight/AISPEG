import Link from "next/link";
import { notFound } from "next/navigation";
import { getPillar, pillars } from "@/lib/strategic-plan/catalog";

export function generateStaticParams() {
  return pillars.map((p) => ({ code: p.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const pillar = getPillar(code);
  if (!pillar) return { title: "Pillar not found — Strategic Plan" };
  return {
    title: `Pillar ${pillar.code}: ${pillar.name} — Strategic Plan`,
    description: `Priorities under Pillar ${pillar.code}: ${pillar.name}.`,
  };
}

export default async function PillarDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const pillar = getPillar(code);
  if (!pillar) notFound();

  return (
    <div className="space-y-10">
      <nav className="text-xs">
        <Link
          href="/standards/strategic-plan"
          className="font-semibold text-ink-muted hover:text-brand-black"
        >
          ← All pillars
        </Link>
      </nav>

      <header>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-clearwater">
          Pillar {pillar.code}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">
          {pillar.name}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          {pillar.priorities.length}{" "}
          {pillar.priorities.length === 1 ? "priority" : "priorities"}
        </p>
      </header>

      <section className="space-y-3">
        {pillar.priorities.map((pr) => (
          <Link
            key={pr.code}
            href={`/standards/strategic-plan/priorities/${pr.code}`}
            className="unstyled group block rounded-lg border border-hairline bg-white p-5 transition-colors hover:border-brand-black"
          >
            <article>
              <div className="flex items-start gap-4">
                <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-brand-black">
                  {pr.code}
                </span>
                <p className="text-sm leading-relaxed text-brand-black group-hover:text-brand-clearwater">
                  {pr.text}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}
