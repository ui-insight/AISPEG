import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const tierLabels: Record<number, { label: string; color: string }> = {
  1: { label: "T1", color: "bg-green-100 text-green-700" },
  2: { label: "T2", color: "bg-yellow-100 text-yellow-700" },
  3: { label: "T3", color: "bg-orange-100 text-orange-700" },
  4: { label: "T4", color: "bg-red-100 text-red-700" },
};

const visibilityColors: Record<string, string> = {
  public: "bg-green-100 text-green-700",
  embargoed: "bg-amber-100 text-amber-800",
  internal: "bg-gray-200 text-gray-700",
};

const statusColors: Record<string, string> = {
  production: "bg-green-100 text-green-700",
  Production: "bg-green-100 text-green-700",
  Piloting: "bg-blue-100 text-blue-700",
  staging: "bg-blue-100 text-blue-700",
  "in-development": "bg-yellow-100 text-yellow-700",
  Prototype: "bg-yellow-100 text-yellow-700",
  approved: "bg-purple-100 text-purple-700",
  idea: "bg-gray-100 text-gray-600",
  Planned: "bg-gray-100 text-gray-600",
  retired: "bg-red-100 text-red-500",
  Archived: "bg-red-100 text-red-500",
  Tracked: "bg-violet-100 text-violet-700",
};

interface AppRow {
  id: string;
  slug: string | null;
  name: string;
  owner_name: string | null;
  department: string | null;
  home_units: string[];
  github_repo: string | null;
  tier: number;
  status: string;
  visibility_tier: "public" | "embargoed" | "internal";
  active_blocker_count: string; // bigint comes back as a string from pg
  updated_at: string;
}

export default async function AdminRegistryPage() {
  let apps: AppRow[] = [];
  let dbError = false;

  try {
    apps = await query<AppRow>(
      `SELECT a.id, a.slug, a.name, a.owner_name, a.department, a.home_units,
              a.github_repo, a.tier, a.status, a.visibility_tier, a.updated_at,
              COUNT(b.id) FILTER (WHERE b.resolved_at IS NULL) AS active_blocker_count
       FROM applications a
       LEFT JOIN blockers b ON b.application_id = a.id
       GROUP BY a.id
       ORDER BY a.updated_at DESC
       LIMIT 500`
    );
  } catch {
    dbError = true;
  }

  // Visibility-tier counts for the summary band
  const byVisibility = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.visibility_tier] = (acc[a.visibility_tier] || 0) + 1;
    return acc;
  }, {});
  const totalBlockers = apps.reduce(
    (sum, a) => sum + Number(a.active_blocker_count || 0),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-black">
            Application Registry
          </h1>
          <p className="mt-2 text-gray-600">
            Every application in the institutional inventory. Edit a row to
            update the data the public portfolio renders.
          </p>
        </div>
        <Link
          href="/admin/registry/new"
          className="inline-flex items-center gap-2 rounded-lg bg-ui-gold px-4 py-2.5 text-sm font-medium text-ui-black hover:bg-ui-gold-light transition-colors shadow-sm"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Register App
        </Link>
      </div>

      {/* Summary band */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Total
          </p>
          <p className="mt-1 text-2xl font-bold text-ui-charcoal">
            {apps.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Public
          </p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {byVisibility.public || 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Embargoed / internal
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {(byVisibility.embargoed || 0) + (byVisibility.internal || 0)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Active blockers
          </p>
          <p className="mt-1 text-2xl font-bold text-red-700">
            {totalBlockers}
          </p>
        </div>
      </div>

      {dbError && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
          Could not connect to database. The registry will appear here once
          PostgreSQL is available.
        </div>
      )}

      {apps.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Home unit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Blockers</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map((app) => {
                const sc = statusColors[app.status] || statusColors.idea;
                const tc = tierLabels[app.tier] || tierLabels[1];
                const vc =
                  visibilityColors[app.visibility_tier] ||
                  visibilityColors.internal;
                const blockerCount = Number(app.active_blocker_count || 0);
                const homeUnit = app.home_units?.[0] || app.department;
                return (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/registry/${app.id}`}
                        className="font-medium text-ui-charcoal hover:text-ui-gold-dark"
                      >
                        {app.name}
                      </Link>
                      {app.slug && (
                        <p className="mt-0.5 text-xs text-gray-400 font-mono">
                          {app.slug}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {app.owner_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {homeUnit || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sc}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${vc}`}
                      >
                        {app.visibility_tier}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tc.color}`}
                      >
                        {tc.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {blockerCount > 0 ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          {blockerCount}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                      {new Date(app.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!dbError && apps.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-gray-500">
            No applications registered yet. Use the &ldquo;Register App&rdquo;
            button to add your first application, or promote a submission
            from the{" "}
            <Link
              href="/admin/submissions"
              className="text-ui-gold-dark hover:underline"
            >
              Submissions
            </Link>{" "}
            dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
