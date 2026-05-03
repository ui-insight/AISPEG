"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Lifecycle taxonomy from ADR 0001 — see lib/portfolio.ts ProjectStatus.
const STATUS_OPTIONS = [
  "idea", "approved", "building", "prototype", "piloting",
  "production", "maintained", "sunsetting", "archived", "tracked",
];

const VISIBILITY_OPTIONS = ["public", "embargoed", "internal"] as const;
const AI4RA_OPTIONS = ["None", "Core", "Adjacent", "Reference", "UI-parallel"];

export default function NewRegistryEntryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Identity
    name: "",
    slug: "",
    tagline: "",
    description: "",
    // Ownership
    owner_name: "",
    owner_email: "",
    home_units: "",       // comma-separated; converted on submit
    operational_owner_name: "",
    operational_owner_title: "",
    build_participants: "",
    // Status / visibility
    tier: 1,
    status: "idea",
    visibility_tier: "internal" as "public" | "embargoed" | "internal",
    tracking_only: false,
    ai4ra_relationship: "None",
    // Links
    github_repo: "",
    repo_url: "",
    live_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const operationalOwners = form.operational_owner_name.trim()
        ? [
            {
              name: form.operational_owner_name.trim(),
              ...(form.operational_owner_title.trim()
                ? { title: form.operational_owner_title.trim() }
                : {}),
            },
          ]
        : [];

      const toArray = (s: string) =>
        s.split(",").map((x) => x.trim()).filter((x) => x.length > 0);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || null,
        tagline: form.tagline.trim() || null,
        description: form.description.trim(),
        owner_name: form.owner_name.trim() || null,
        owner_email: form.owner_email.trim() || null,
        home_units: toArray(form.home_units),
        operational_owners: operationalOwners,
        build_participants: toArray(form.build_participants),
        tier: form.tier,
        status: form.status,
        visibility_tier: form.visibility_tier,
        tracking_only: form.tracking_only,
        ai4ra_relationship: form.ai4ra_relationship,
        github_repo: form.github_repo.trim() || null,
        repo_url: form.repo_url.trim() || null,
        live_url: form.live_url.trim() || null,
      };

      const res = await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const inputCls =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold";
  const labelCls =
    "block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/registry"
          className="text-sm text-gray-500 hover:text-ui-charcoal"
        >
          &larr; Back to registry
        </Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-brand-black">
          Register new application
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manually register an intervention. The detail page will let you fill
          in the rest (full description, blockers, classification, etc.). For
          submissions that came through Submit-a-Project, use the
          &ldquo;Promote to registry&rdquo; button on the submission detail
          page instead.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Identity */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="My Application"
            />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputCls}
              placeholder="my-application"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className={inputCls}
            placeholder="One-line elevator pitch."
          />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className={inputCls + " resize-none"}
          />
        </div>

        {/* Status & visibility */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className={labelCls}>Status</label>
            <input
              type="text"
              list="status-options-new"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputCls}
            />
            <datalist id="status-options-new">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={labelCls}>Visibility</label>
            <select
              value={form.visibility_tier}
              onChange={(e) =>
                setForm({
                  ...form,
                  visibility_tier: e.target.value as
                    | "public"
                    | "embargoed"
                    | "internal",
                })
              }
              className={inputCls}
            >
              {VISIBILITY_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tier</label>
            <select
              value={form.tier}
              onChange={(e) =>
                setForm({ ...form, tier: Number(e.target.value) })
              }
              className={inputCls}
            >
              <option value={1}>Tier 1 — Simple Static</option>
              <option value={2}>Tier 2 — Standard Web</option>
              <option value={3}>Tier 3 — Managed Service</option>
              <option value={4}>Tier 4 — Enterprise</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.tracking_only}
              onChange={(e) =>
                setForm({ ...form, tracking_only: e.target.checked })
              }
              className="rounded border-gray-300 text-ui-gold focus:ring-ui-gold"
            />
            Tracking only (not built by IIDS)
          </label>
          <div>
            <label className={labelCls + " inline-block mr-2"}>AI4RA</label>
            <select
              value={form.ai4ra_relationship}
              onChange={(e) =>
                setForm({ ...form, ai4ra_relationship: e.target.value })
              }
              className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
            >
              {AI4RA_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ownership */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Operational owner — name</label>
            <input
              type="text"
              value={form.operational_owner_name}
              onChange={(e) =>
                setForm({ ...form, operational_owner_name: e.target.value })
              }
              className={inputCls}
              placeholder="Pat Owner"
            />
          </div>
          <div>
            <label className={labelCls}>Operational owner — title</label>
            <input
              type="text"
              value={form.operational_owner_title}
              onChange={(e) =>
                setForm({ ...form, operational_owner_title: e.target.value })
              }
              className={inputCls}
              placeholder="Director of X (optional)"
            />
          </div>
          <div>
            <label className={labelCls}>Owner email</label>
            <input
              type="email"
              value={form.owner_email}
              onChange={(e) =>
                setForm({ ...form, owner_email: e.target.value })
              }
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Home units (comma-separated)</label>
            <input
              type="text"
              value={form.home_units}
              onChange={(e) =>
                setForm({ ...form, home_units: e.target.value })
              }
              className={inputCls}
              placeholder="Office of Research and Economic Development"
            />
          </div>
          <div>
            <label className={labelCls}>
              Build participants (comma-separated)
            </label>
            <input
              type="text"
              value={form.build_participants}
              onChange={(e) =>
                setForm({ ...form, build_participants: e.target.value })
              }
              className={inputCls}
              placeholder="IIDS, SEM"
            />
          </div>
        </div>

        {/* Links */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>GitHub repo (legacy)</label>
            <input
              type="text"
              value={form.github_repo}
              onChange={(e) =>
                setForm({ ...form, github_repo: e.target.value })
              }
              className={inputCls}
              placeholder="org/repo-name"
            />
          </div>
          <div>
            <label className={labelCls}>Repo URL</label>
            <input
              type="url"
              value={form.repo_url}
              onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
              className={inputCls}
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label className={labelCls}>Live URL</label>
            <input
              type="url"
              value={form.live_url}
              onChange={(e) => setForm({ ...form, live_url: e.target.value })}
              className={inputCls}
              placeholder="https://..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ui-gold px-6 py-2.5 text-sm font-medium text-ui-black hover:bg-ui-gold-light disabled:bg-gray-200 transition-colors shadow-sm"
        >
          {saving ? "Creating..." : "Register application"}
        </button>
      </form>
    </div>
  );
}
