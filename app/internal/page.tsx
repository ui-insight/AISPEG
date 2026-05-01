import Link from "next/link";
import { listApplications } from "@/lib/work";

export const dynamic = "force-dynamic";

export default async function InternalHome() {
  const apps = await listApplications({ audience: "internal" });
  const blockerCount = apps.reduce((sum, a) => sum + a.activeBlockers.length, 0);
  const internalOnly = apps.filter((a) => a.visibilityTier === "internal").length;
  const embargoed = apps.filter((a) => a.visibilityTier === "embargoed").length;

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-ui-gold-dark">
          IIDS Internal
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ui-charcoal">
          Internal coordination view
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-700">
          The auth-gated IIDS-only view of the institutional AI inventory.
          Same data as the public portfolio with sharper blocker detail
          (named individuals, contact history) and the embargoed and
          internal-only records visible.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total interventions
          </p>
          <p className="mt-1 text-3xl font-black text-ui-charcoal">{apps.length}</p>
          <p className="mt-2 text-xs text-gray-500">
            {embargoed} embargoed · {internalOnly} internal-only
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Active blockers
          </p>
          <p className="mt-1 text-3xl font-black text-amber-700">{blockerCount}</p>
          <p className="mt-2 text-xs text-gray-500">
            Across {apps.filter((a) => a.activeBlockers.length > 0).length}{" "}
            interventions
          </p>
        </div>
        <Link
          href="/internal/portfolio"
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-ui-gold-dark">
            Drill in
          </p>
          <p className="mt-1 text-base font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
            Internal portfolio &rarr;
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Full inventory with internal-text blocker detail
          </p>
        </Link>
      </section>

      <section className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-6">
        <h2 className="text-base font-semibold text-ui-charcoal">
          Coming in Sprint 3
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          <li>&bull; ClickUp wiring — status and blocker data sync from ClickUp tasks</li>
          <li>&bull; Submitter status pages (<code>/intake/[token]</code>)</li>
          <li>&bull; Submission similarity surfaced live during the assessment</li>
          <li>&bull; Named-SLA acknowledgment email on intake</li>
        </ul>
      </section>
    </div>
  );
}
