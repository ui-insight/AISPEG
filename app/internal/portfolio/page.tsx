import Link from "next/link";
import PortfolioCard from "@/components/PortfolioCard";
import { listApplications, groupByHomeUnit } from "@/lib/work";

export const dynamic = "force-dynamic";

export default async function InternalPortfolioPage() {
  const apps = await listApplications({ audience: "internal" });
  const groups = groupByHomeUnit(apps);

  const total = apps.length;
  const blockerCount = apps.reduce((sum, a) => sum + a.activeBlockers.length, 0);
  const internalOnly = apps.filter((a) => a.visibilityTier === "internal").length;
  const embargoed = apps.filter((a) => a.visibilityTier === "embargoed").length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ui-gold-dark">
          IIDS Internal
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ui-charcoal">
          Internal portfolio view
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-700">
          The full IIDS-coordinated AI inventory, including embargoed and
          internal-only entries, with sharper blocker detail (named
          individuals, contact history) than the public portfolio shows.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {total} projects · {embargoed} embargoed · {internalOnly}{" "}
          internal-only · {blockerCount} active blocker
          {blockerCount === 1 ? "" : "s"}
        </p>
        <p className="mt-3 text-xs text-gray-500">
          <Link
            href="/portfolio"
            className="text-ui-gold-dark hover:underline"
          >
            View the public portfolio &rarr;
          </Link>
        </p>
      </div>

      {/* Groups by home unit */}
      {groups.map(({ unit, items }) => (
        <section key={unit} className="space-y-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-black tracking-tight text-brand-black">{unit}</h2>
            <span className="text-sm text-ink-subtle">
              {items.length}{" "}
              {items.length === 1 ? "project" : "projects"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((app) => (
              <PortfolioCard
                key={app.id}
                app={app}
                audience="internal"
                basePath="/internal/portfolio"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
