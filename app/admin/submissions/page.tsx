import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const tierLabels: Record<number, { label: string; color: string }> = {
  1: { label: "Simple Static", color: "bg-green-100 text-green-700" },
  2: { label: "Standard Web", color: "bg-yellow-100 text-yellow-700" },
  3: { label: "Managed Service", color: "bg-orange-100 text-orange-700" },
  4: { label: "Enterprise", color: "bg-red-100 text-red-700" },
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-purple-100 text-purple-700",
  "in-progress": "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};

interface SubmissionRow {
  id: string;
  idea_text: string;
  score: number;
  tier: number;
  submitter_name: string | null;
  submitter_email: string | null;
  department: string | null;
  status: string;
  created_at: string;
}

export default async function AdminSubmissionsPage() {
  let rows: SubmissionRow[] = [];
  let dbError = false;

  try {
    rows = await query<SubmissionRow>(
      `SELECT id, idea_text, score, tier, submitter_name, submitter_email, department, status, created_at
       FROM submissions
       ORDER BY created_at DESC
       LIMIT 200`
    );
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Submissions</h1>
        <p className="mt-2 text-gray-600">
          All App Builder Guide submissions. Click a row to view details.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: rows.length, color: "text-ui-charcoal" },
          { label: "New", value: rows.filter((r) => r.status === "new").length, color: "text-blue-600" },
          { label: "In Progress", value: rows.filter((r) => r.status === "in-progress").length, color: "text-green-600" },
          { label: "Archived", value: rows.filter((r) => r.status === "archived").length, color: "text-gray-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {dbError && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
          Could not connect to database. Submissions will appear here once PostgreSQL is available.
        </div>
      )}

      {/* Table */}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Idea</th>
                <th className="px-4 py-3">Submitter</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const t = tierLabels[row.tier] || tierLabels[1];
                const sc = statusColors[row.status] || statusColors.new;
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <Link
                        href={`/admin/submissions/${row.id}`}
                        className="font-medium text-ui-charcoal hover:text-ui-gold-dark line-clamp-1"
                      >
                        {row.idea_text || "(no description)"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {row.submitter_name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {row.department || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.color}`}>
                        {t.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-600">
                      {row.score}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sc}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!dbError && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-gray-500">
            No submissions yet. Submissions will appear here as users complete the{" "}
            <Link href="/builder-guide" className="text-ui-gold-dark hover:underline">
              App Builder Guide
            </Link>.
          </p>
        </div>
      )}
    </div>
  );
}
