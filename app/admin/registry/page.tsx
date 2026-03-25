import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; color: string; order: number }> = {
  production: { label: "Production", color: "bg-green-100 text-green-700", order: 1 },
  staging: { label: "Staging", color: "bg-blue-100 text-blue-700", order: 2 },
  "in-development": { label: "In Development", color: "bg-yellow-100 text-yellow-700", order: 3 },
  approved: { label: "Approved", color: "bg-purple-100 text-purple-700", order: 4 },
  idea: { label: "Idea", color: "bg-gray-100 text-gray-600", order: 5 },
  retired: { label: "Retired", color: "bg-red-100 text-red-500", order: 6 },
};

const tierLabels: Record<number, { label: string; color: string }> = {
  1: { label: "T1", color: "bg-green-100 text-green-700" },
  2: { label: "T2", color: "bg-yellow-100 text-yellow-700" },
  3: { label: "T3", color: "bg-orange-100 text-orange-700" },
  4: { label: "T4", color: "bg-red-100 text-red-700" },
};

interface AppRow {
  id: string;
  name: string;
  description: string;
  owner_name: string | null;
  department: string | null;
  github_repo: string | null;
  url: string | null;
  tier: number;
  status: string;
  sensitivity: string[];
  data_sources: string[];
  university_systems: string[];
  updated_at: string;
}

export default async function AdminRegistryPage() {
  let apps: AppRow[] = [];
  let dbError = false;

  try {
    apps = await query<AppRow>(
      `SELECT id, name, description, owner_name, department, github_repo, url,
              tier, status, sensitivity, data_sources, university_systems, updated_at
       FROM applications
       ORDER BY
         CASE status
           WHEN 'production' THEN 1 WHEN 'staging' THEN 2
           WHEN 'in-development' THEN 3 WHEN 'approved' THEN 4
           WHEN 'idea' THEN 5 WHEN 'retired' THEN 6
         END,
         updated_at DESC
       LIMIT 500`
    );
  } catch {
    dbError = true;
  }

  // Stats
  const byStatus = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ui-charcoal">Application Registry</h1>
          <p className="mt-2 text-gray-600">
            All applications in the university portfolio.
          </p>
        </div>
        <Link
          href="/admin/registry/new"
          className="inline-flex items-center gap-2 rounded-lg bg-ui-gold px-4 py-2.5 text-sm font-medium text-ui-black hover:bg-ui-gold-light transition-colors shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register App
        </Link>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{cfg.label}</p>
            <p className="mt-1 text-2xl font-bold text-ui-charcoal">{byStatus[key] || 0}</p>
          </div>
        ))}
      </div>

      {dbError && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
          Could not connect to database. The registry will appear here once PostgreSQL is available.
        </div>
      )}

      {/* Table */}
      {apps.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Sensitivity</th>
                <th className="px-4 py-3">Systems</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map((app) => {
                const sc = statusConfig[app.status] || statusConfig.idea;
                const tc = tierLabels[app.tier] || tierLabels[1];
                return (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/registry/${app.id}`}
                        className="font-medium text-ui-charcoal hover:text-ui-gold-dark"
                      >
                        {app.name}
                      </Link>
                      {app.github_repo && (
                        <p className="mt-0.5 text-xs text-gray-400 font-mono">{app.github_repo}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {app.owner_name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {app.department || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tc.color}`}>
                        {tc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {app.sensitivity.length > 0
                          ? app.sensitivity.map((s) => (
                              <span key={s} className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600">
                                {s}
                              </span>
                            ))
                          : <span className="text-xs text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {app.university_systems.length > 0
                          ? app.university_systems.slice(0, 3).map((s) => (
                              <span key={s} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                                {s}
                              </span>
                            ))
                          : <span className="text-xs text-gray-400">—</span>}
                        {app.university_systems.length > 3 && (
                          <span className="text-xs text-gray-400">+{app.university_systems.length - 3}</span>
                        )}
                      </div>
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
            No applications registered yet. Use the &ldquo;Register App&rdquo; button to add your first application,
            or promote a submission from the{" "}
            <Link href="/admin/submissions" className="text-ui-gold-dark hover:underline">
              Submissions
            </Link>{" "}
            dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
