"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const STATUS_OPTIONS = ["idea", "approved", "in-development", "staging", "production", "retired"];

const statusColors: Record<string, string> = {
  production: "bg-green-100 text-green-700",
  staging: "bg-blue-100 text-blue-700",
  "in-development": "bg-yellow-100 text-yellow-700",
  approved: "bg-purple-100 text-purple-700",
  idea: "bg-gray-100 text-gray-600",
  retired: "bg-red-100 text-red-500",
};

interface Application {
  id: string;
  name: string;
  description: string;
  owner_name: string | null;
  owner_email: string | null;
  department: string | null;
  github_repo: string | null;
  url: string | null;
  tier: number;
  status: string;
  sensitivity: string[];
  complexity: string | null;
  userbase: string | null;
  auth_level: string | null;
  integrations: string[];
  data_sources: string[];
  university_systems: string[];
  output_types: string[];
  submission_id: string | null;
  created_at: string;
  updated_at: string;
}

function TagList({ items, color = "bg-gray-100 text-gray-600" }: { items: string[]; color?: string }) {
  if (!items || items.length === 0) return <span className="text-sm text-gray-400">None</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={`rounded px-2 py-0.5 text-xs ${color}`}>{item}</span>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function RegistryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Editable fields
  const [form, setForm] = useState({
    name: "",
    description: "",
    owner_name: "",
    owner_email: "",
    department: "",
    github_repo: "",
    url: "",
    status: "idea",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/registry/${id}`);
        if (!res.ok) { setError("Application not found"); return; }
        const data = await res.json();
        setApp(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          owner_name: data.owner_name || "",
          owner_email: data.owner_email || "",
          department: data.department || "",
          github_repo: data.github_repo || "",
          url: data.url || "",
          status: data.status || "idea",
        });
      } catch {
        setError("Failed to load application");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/registry/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccessMsg("Saved!");
        setTimeout(() => setSuccessMsg(""), 2000);
        // Refresh
        const updated = await fetch(`/api/registry/${id}`);
        if (updated.ok) setApp(await updated.json());
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/registry/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/registry");
      } else {
        setError("Failed to delete application");
        setShowDeleteConfirm(false);
      }
    } catch {
      setError("Failed to delete application");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-gray-400">Loading...</p></div>;
  }

  if (error || !app) {
    return (
      <div className="space-y-4">
        <Link href="/admin/registry" className="text-sm text-gray-500 hover:text-ui-charcoal">&larr; Back to registry</Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Not found"}</div>
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/registry" className="text-sm text-gray-500 hover:text-ui-charcoal">&larr; Back to registry</Link>
          <h1 className="mt-2 text-2xl font-bold text-ui-charcoal">{app.name}</h1>
          <p className="mt-1 text-xs text-gray-400 font-mono">{app.id}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusColors[app.status] || statusColors.idea}`}>
          {app.status}
        </span>
      </div>

      {/* Edit Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Application Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className={inputCls}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Owner Name">
            <input type="text" value={form.owner_name} onChange={(e) => setForm({...form, owner_name: e.target.value})} className={inputCls} />
          </Field>
          <Field label="Owner Email">
            <input type="email" value={form.owner_email} onChange={(e) => setForm({...form, owner_email: e.target.value})} className={inputCls} />
          </Field>
          <Field label="Department">
            <input type="text" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className={inputCls} />
          </Field>
          <Field label="GitHub Repo">
            <input type="text" value={form.github_repo} onChange={(e) => setForm({...form, github_repo: e.target.value})} placeholder="org/repo-name" className={inputCls} />
          </Field>
          <Field label="Production URL">
            <input type="url" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} placeholder="https://..." className={inputCls} />
          </Field>
        </div>

        <Field label="Description">
          <textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className={inputCls + " resize-none"} />
        </Field>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-ui-gold px-5 py-2 text-sm font-medium text-ui-black hover:bg-ui-gold-light disabled:bg-gray-200 transition-colors">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {successMsg && <span className="text-sm text-green-600">{successMsg}</span>}
          </div>
          <button onClick={() => setShowDeleteConfirm(true)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            Delete Application
          </button>
        </div>
      </div>

      {/* Classification (read-only from wizard) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Classification</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Tier</p>
            <p className="text-sm font-semibold text-ui-charcoal">Tier {app.tier}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Complexity</p>
            <p className="text-sm text-ui-charcoal">{app.complexity || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">User Base</p>
            <p className="text-sm text-ui-charcoal">{app.userbase || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Auth Level</p>
            <p className="text-sm text-ui-charcoal">{app.auth_level || "—"}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Sensitivity</p>
            <TagList items={app.sensitivity} color="bg-red-50 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Integrations</p>
            <TagList items={app.integrations} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Data Sources</p>
            <TagList items={app.data_sources} color="bg-blue-50 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">University Systems</p>
            <TagList items={app.university_systems} color="bg-purple-50 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Output Types</p>
            <TagList items={app.output_types} color="bg-green-50 text-green-600" />
          </div>
        </div>
      </div>

      {/* Provenance */}
      {app.submission_id && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Created from Submission</p>
          <Link href={`/admin/submissions/${app.submission_id}`} className="mt-1 text-sm text-ui-gold-dark hover:underline font-mono">
            {app.submission_id}
          </Link>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex gap-6 text-xs text-gray-400">
        <span>Created: {new Date(app.created_at).toLocaleString()}</span>
        <span>Updated: {new Date(app.updated_at).toLocaleString()}</span>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Delete Application</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{app.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300 transition-colors">
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
