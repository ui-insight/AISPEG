import Link from "next/link";
import { pillars } from "@/lib/strategic-plan/catalog";
import { getPillarFraming } from "@/lib/strategic-plan/pillar-framing";

export const metadata = {
  title: "Strategic Plan — Standards",
  description:
    "Browse the University of Idaho strategic plan pillars and priorities, and how IIDS portfolio work aligns to them.",
};

export default function StrategicPlanIndexPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-brand-black">
          Strategic Plan Alignment
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-muted">
          The University of Idaho strategic plan is organized into{" "}
          <span className="font-semibold text-brand-black">{pillars.length} pillars</span>{" "}
          containing{" "}
          <span className="font-semibold text-brand-black">
            {pillars.reduce((n, p) => n + p.priorities.length, 0)} priorities
          </span>
          . Browse the pillars below to see what each priority asks of the
          institution.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {pillars.map((p) => {
          const framing = getPillarFraming(p.code);
          return (
            <Link
              key={p.code}
              href={`/standards/strategic-plan/pillars/${p.code}`}
              className="unstyled group block rounded-lg border border-hairline bg-white p-5 transition-colors hover:border-brand-black"
            >
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-clearwater">
                Pillar {p.code}
              </p>
              <h3 className="mt-1 text-lg font-bold tracking-tight text-brand-black group-hover:text-brand-clearwater">
                {p.name}
              </h3>
              {framing && (
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {framing}
                </p>
              )}
              <p className="mt-3 text-sm text-ink-muted">
                <span className="font-semibold text-brand-black">
                  {p.priorities.length} {p.priorities.length === 1 ? "priority" : "priorities"}
                </span>
              </p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
