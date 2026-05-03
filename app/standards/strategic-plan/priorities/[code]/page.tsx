import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPillar,
  getPriority,
  priorities,
} from "@/lib/strategic-plan/catalog";

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
    </div>
  );
}
