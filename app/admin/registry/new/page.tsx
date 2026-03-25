"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewRegistryEntryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    owner_name: "",
    owner_email: "",
    department: "",
    github_repo: "",
    url: "",
    tier: 1,
    status: "idea",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/registry/${data.id}`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to create application");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/registry" className="text-sm text-gray-500 hover:text-ui-charcoal">&larr; Back to registry</Link>
        <h1 className="mt-2 text-2xl font-bold text-ui-charcoal">Register New Application</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manually register an application in the portfolio. For submissions that came through the Builder Guide,
          use the &ldquo;Promote to Registry&rdquo; button on the submission detail page instead.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={inputCls} placeholder="My Application" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className={inputCls}>
              {["idea","approved","in-development","staging","production","retired"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Owner Name</label>
            <input type="text" value={form.owner_name} onChange={(e) => setForm({...form, owner_name: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Owner Email</label>
            <input type="email" value={form.owner_email} onChange={(e) => setForm({...form, owner_email: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Department</label>
            <input type="text" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Tier</label>
            <select value={form.tier} onChange={(e) => setForm({...form, tier: Number(e.target.value)})} className={inputCls}>
              <option value={1}>Tier 1 — Simple Static</option>
              <option value={2}>Tier 2 — Standard Web</option>
              <option value={3}>Tier 3 — Managed Service</option>
              <option value={4}>Tier 4 — Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">GitHub Repo</label>
            <input type="text" value={form.github_repo} onChange={(e) => setForm({...form, github_repo: e.target.value})} className={inputCls} placeholder="org/repo-name" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Production URL</label>
            <input type="url" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} className={inputCls} placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className={inputCls + " resize-none"} placeholder="What does this application do?" />
        </div>

        <button type="submit" disabled={saving} className="rounded-lg bg-ui-gold px-6 py-2.5 text-sm font-medium text-ui-black hover:bg-ui-gold-light disabled:bg-gray-200 transition-colors shadow-sm">
          {saving ? "Creating..." : "Register Application"}
        </button>
      </form>
    </div>
  );
}
