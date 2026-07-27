// The ArrayInput / LinesInput / OwnersInput helpers in this file
// intentionally sync local draft state from props inside useEffect when
// the prop value changes. That's how the form fields pick up data after
// the initial fetch — local draft preserves trailing commas and partial
// edits while the user types; structured value flows upward via
// onChange. The rule below flags this pattern but the sync is correct
// here, so it's disabled file-wide.
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  DEPLOYMENT_ENVIRONMENTS,
  ENTERPRISE_REPLACEMENT_STATUSES,
  type DeploymentEnvironment,
  type EnterpriseReplacementStatus,
} from "@/lib/project-governance";
import { PROJECT_STATUSES } from "@/lib/portfolio";
import { statusColor } from "../status-style";

// The ADR 0001 operational ladder, imported rather than retyped — see
// PROJECT_STATUSES in lib/portfolio.ts. This list previously carried the
// legacy submission states and the superseded capitalised union; because
// applications.status is plain TEXT with no CHECK, those saved fine and
// then rendered as "Exploring" on /portfolio.
const STATUS_OPTIONS = PROJECT_STATUSES;

const VISIBILITY_OPTIONS = ["public", "embargoed", "internal"] as const;
const AI4RA_OPTIONS = ["None", "Core", "Adjacent", "Reference", "UI-parallel"];
const REVIEW_STATUS_OPTIONS = ["", "OIT-endorsed", "Under OIT review", "N/A"];


const visibilityColors: Record<string, string> = {
  public: "bg-green-100 text-green-700",
  embargoed: "bg-amber-100 text-amber-800",
  internal: "bg-gray-200 text-gray-700",
};

interface Owner {
  name: string;
  title?: string;
}

interface Application {
  id: string;
  slug: string | null;
  name: string;
  tagline: string | null;
  description: string;
  owner_name: string | null;
  owner_email: string | null;
  department: string | null;
  home_units: string[];
  operational_owners: Owner[];
  build_participants: string[];
  tags: string[];
  github_repo: string | null;
  url: string | null;
  tier: number;
  status: string;
  visibility_tier: "public" | "embargoed" | "internal";
  sensitivity: string[];
  complexity: string | null;
  userbase: string | null;
  auth_level: string | null;
  integrations: string[];
  data_sources: string[];
  university_systems: string[];
  output_types: string[];
  ai4ra_relationship: string;
  dual_destiny_planned: boolean;
  external_deployments: string[];
  institutional_review_status: string | null;
  proposed_deployment_environment: DeploymentEnvironment;
  enterprise_replacement_status: EnterpriseReplacementStatus;
  existing_enterprise_system_name: string | null;
  existing_enterprise_system_annual_cost_usd: string | number | null;
  existing_enterprise_system_renewal_date: string | null;
  repo_url: string | null;
  docs_url: string | null;
  live_url: string | null;
  is_private_repo: boolean;
  funding: string | null;
  operational_function: string | null;
  operational_excellence_outcome: string | null;
  features: string[];
  tech: string[];
  tracking_only: boolean;
  related_slugs: string[];
  clickup_task_id: string | null;
  submission_id: string | null;
  created_at: string;
  updated_at: string;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ArrayInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value.join(", "));
  // Sync draft from prop when external value changes (e.g. after refetch).
  useEffect(() => {
    setDraft(value.join(", "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.join("\0")]);

  return (
    <input
      type="text"
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        const parsed = e.target.value
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        onChange(parsed);
      }}
      placeholder={placeholder ?? "comma-separated"}
      className={inputCls}
    />
  );
}

function LinesInput({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value.join("\n"));
  useEffect(() => {
    setDraft(value.join("\n"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.join("\0")]);

  return (
    <textarea
      rows={rows}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        const parsed = e.target.value
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        onChange(parsed);
      }}
      placeholder={placeholder ?? "one per line"}
      className={inputCls + " resize-none"}
    />
  );
}

function OwnersInput({
  value,
  onChange,
}: {
  value: Owner[];
  onChange: (v: Owner[]) => void;
}) {
  const [draft, setDraft] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(JSON.stringify(value, null, 2));
    setError(null);
  }, [value]);

  return (
    <>
      <textarea
        rows={4}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            if (
              !Array.isArray(parsed) ||
              !parsed.every(
                (o) =>
                  o && typeof o === "object" && typeof o.name === "string"
              )
            ) {
              setError("Must be an array of {name, title?} objects.");
              return;
            }
            setError(null);
            onChange(parsed);
          } catch {
            setError("Invalid JSON.");
          }
        }}
        className={inputCls + " resize-none font-mono text-xs"}
        placeholder='[{"name": "Pat Owner", "title": "Director of X"}]'
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </>
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

  // Editable form state — every column the API will accept on PATCH.
  const [form, setForm] = useState({
    // Identity
    name: "",
    slug: "",
    tagline: "",
    description: "",
    // Ownership
    owner_name: "",
    owner_email: "",
    department: "",
    home_units: [] as string[],
    operational_owners: [] as Owner[],
    build_participants: [] as string[],
    // Status / classification
    status: "idea",
    tier: 1,
    visibility_tier: "internal" as "public" | "embargoed" | "internal",
    tags: [] as string[],
    institutional_review_status: "",
    tracking_only: false,
    // Governance
    proposed_deployment_environment: "to-be-determined" as DeploymentEnvironment,
    enterprise_replacement_status:
      "to-be-determined" as EnterpriseReplacementStatus,
    existing_enterprise_system_name: "",
    existing_enterprise_system_annual_cost_usd: "",
    existing_enterprise_system_renewal_date: "",
    // Links
    github_repo: "",
    url: "",
    repo_url: "",
    docs_url: "",
    live_url: "",
    is_private_repo: false,
    // AI4RA
    ai4ra_relationship: "None",
    dual_destiny_planned: false,
    external_deployments: [] as string[],
    // Content
    funding: "",
    operational_function: "",
    operational_excellence_outcome: "",
    features: [] as string[],
    tech: [] as string[],
    // Wizard-shape (populated from submissions or seed)
    sensitivity: [] as string[],
    complexity: "",
    userbase: "",
    auth_level: "",
    integrations: [] as string[],
    data_sources: [] as string[],
    university_systems: [] as string[],
    output_types: [] as string[],
    // Misc
    related_slugs: [] as string[],
    clickup_task_id: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/registry/${id}`);
        if (!res.ok) {
          setError("Application not found");
          return;
        }
        const data: Application = await res.json();
        setApp(data);
        setForm({
          name: data.name || "",
          slug: data.slug || "",
          tagline: data.tagline || "",
          description: data.description || "",
          owner_name: data.owner_name || "",
          owner_email: data.owner_email || "",
          department: data.department || "",
          home_units: data.home_units || [],
          operational_owners: data.operational_owners || [],
          build_participants: data.build_participants || [],
          status: data.status || "idea",
          tier: data.tier ?? 1,
          visibility_tier: data.visibility_tier || "internal",
          tags: data.tags || [],
          institutional_review_status: data.institutional_review_status || "",
          tracking_only: !!data.tracking_only,
          proposed_deployment_environment:
            data.proposed_deployment_environment || "to-be-determined",
          enterprise_replacement_status:
            data.enterprise_replacement_status || "to-be-determined",
          existing_enterprise_system_name:
            data.existing_enterprise_system_name || "",
          existing_enterprise_system_annual_cost_usd:
            data.existing_enterprise_system_annual_cost_usd == null
              ? ""
              : String(data.existing_enterprise_system_annual_cost_usd),
          existing_enterprise_system_renewal_date:
            data.existing_enterprise_system_renewal_date
              ? data.existing_enterprise_system_renewal_date.slice(0, 10)
              : "",
          github_repo: data.github_repo || "",
          url: data.url || "",
          repo_url: data.repo_url || "",
          docs_url: data.docs_url || "",
          live_url: data.live_url || "",
          is_private_repo: !!data.is_private_repo,
          ai4ra_relationship: data.ai4ra_relationship || "None",
          dual_destiny_planned: !!data.dual_destiny_planned,
          external_deployments: data.external_deployments || [],
          funding: data.funding || "",
          operational_function: data.operational_function || "",
          operational_excellence_outcome:
            data.operational_excellence_outcome || "",
          features: data.features || [],
          tech: data.tech || [],
          sensitivity: data.sensitivity || [],
          complexity: data.complexity || "",
          userbase: data.userbase || "",
          auth_level: data.auth_level || "",
          integrations: data.integrations || [],
          data_sources: data.data_sources || [],
          university_systems: data.university_systems || [],
          output_types: data.output_types || [],
          related_slugs: data.related_slugs || [],
          clickup_task_id: data.clickup_task_id || "",
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
      // Coerce empty strings to null for fields where empty != value
      const payload: Record<string, unknown> = {
        ...form,
        slug: form.slug.trim() || null,
        tagline: form.tagline.trim() || null,
        institutional_review_status:
          form.institutional_review_status || null,
        existing_enterprise_system_name:
          form.enterprise_replacement_status === "yes"
            ? form.existing_enterprise_system_name.trim()
            : null,
        existing_enterprise_system_annual_cost_usd:
          form.enterprise_replacement_status === "yes" &&
          form.existing_enterprise_system_annual_cost_usd !== ""
            ? Number(form.existing_enterprise_system_annual_cost_usd)
            : null,
        existing_enterprise_system_renewal_date:
          form.enterprise_replacement_status === "yes"
            ? form.existing_enterprise_system_renewal_date || null
            : null,
        owner_email: form.owner_email.trim() || null,
        github_repo: form.github_repo.trim() || null,
        url: form.url.trim() || null,
        repo_url: form.repo_url.trim() || null,
        docs_url: form.docs_url.trim() || null,
        live_url: form.live_url.trim() || null,
        funding: form.funding.trim() || null,
        operational_function: form.operational_function.trim() || null,
        operational_excellence_outcome:
          form.operational_excellence_outcome.trim() || null,
        complexity: form.complexity.trim() || null,
        userbase: form.userbase.trim() || null,
        auth_level: form.auth_level.trim() || null,
        clickup_task_id: form.clickup_task_id.trim() || null,
      };

      const res = await fetch(`/api/registry/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccessMsg("Saved!");
        setTimeout(() => setSuccessMsg(""), 2000);
        const updated = await fetch(`/api/registry/${id}`);
        if (updated.ok) setApp(await updated.json());
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Save failed");
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
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error && !app) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/registry"
          className="text-sm text-gray-500 hover:text-ui-charcoal"
        >
          &larr; Back to registry
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Not found"}
        </div>
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/registry"
            className="text-sm text-gray-500 hover:text-ui-charcoal"
          >
            &larr; Back to registry
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-ui-charcoal">{app.name}</h1>
          <p className="mt-1 text-xs text-gray-400 font-mono">{app.id}</p>
          {app.slug && (
            <p className="mt-1 text-xs text-gray-500">
              Public URL:{" "}
              <Link
                href={`/portfolio/${app.slug}`}
                className="text-ui-gold-dark hover:underline"
              >
                /portfolio/{app.slug}
              </Link>
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              statusColor(app.status)
            }`}
          >
            {app.status}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              visibilityColors[app.visibility_tier] || visibilityColors.internal
            }`}
          >
            {app.visibility_tier}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Identity */}
      <Section title="Identity">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field
            label="Slug"
            hint="URL slug for /portfolio/[slug]. Lowercase, dash-separated."
          >
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputCls}
              placeholder="my-app-slug"
            />
          </Field>
        </div>
        <Field label="Tagline" hint="One-line elevator pitch shown on cards.">
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputCls + " resize-none"}
          />
        </Field>
      </Section>

      {/* Status & visibility */}
      <Section title="Status & visibility">
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Status"
            hint="ADR 0001 operational ladder. The API rejects anything else."
          >
            {/* Was a free-text input with a datalist of suggestions, which
                is how legacy values kept getting saved. The API now
                validates, so the control is constrained to match — an
                unconstrained field that 400s on submit is worse than a
                select. Values that predate the taxonomy stay selectable
                only if already on the row (see below), so opening an old
                record doesn't silently rewrite its status. */}
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputCls}
            >
              {!STATUS_OPTIONS.includes(form.status as (typeof STATUS_OPTIONS)[number]) && (
                <option value={form.status}>
                  {form.status} — not in the taxonomy, pick a replacement
                </option>
              )}
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Visibility tier"
            hint="public renders fully; embargoed shows the entry but holds detail; internal hides from /portfolio."
          >
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
          </Field>
          <Field label="Tier" hint="1–4. Tier 4 = enterprise/regulated.">
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
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Institutional review">
            <select
              value={form.institutional_review_status}
              onChange={(e) =>
                setForm({
                  ...form,
                  institutional_review_status: e.target.value,
                })
              }
              className={inputCls}
            >
              {REVIEW_STATUS_OPTIONS.map((s) => (
                <option key={s || "none"} value={s}>
                  {s || "—"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tags" hint="Comma-separated. e.g. diffusion, ai4ra-core.">
            <ArrayInput
              value={form.tags}
              onChange={(v) => setForm({ ...form, tags: v })}
            />
          </Field>
        </div>
        <div className="flex items-center gap-6">
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
        </div>
      </Section>

      {/* Governance & deployment */}
      <Section title="Governance & deployment">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Proposed deployment environment"
            hint="OIT-hosted can remain platform-TBD until Azure, OCI OKE, or on-prem Kubernetes is selected."
          >
            <select
              value={form.proposed_deployment_environment}
              onChange={(e) =>
                setForm({
                  ...form,
                  proposed_deployment_environment: e.target
                    .value as DeploymentEnvironment,
                })
              }
              className={inputCls}
            >
              {DEPLOYMENT_ENVIRONMENTS.map((environment) => (
                <option key={environment.value} value={environment.value}>
                  {environment.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Replaces enterprise software?">
            <select
              value={form.enterprise_replacement_status}
              onChange={(e) =>
                setForm({
                  ...form,
                  enterprise_replacement_status: e.target
                    .value as EnterpriseReplacementStatus,
                })
              }
              className={inputCls}
            >
              {ENTERPRISE_REPLACEMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "yes"
                    ? "Yes"
                    : status === "no"
                      ? "No"
                      : "To be determined"}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {form.enterprise_replacement_status === "yes" && (
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Existing system name">
              <input
                type="text"
                value={form.existing_enterprise_system_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    existing_enterprise_system_name: e.target.value,
                  })
                }
                className={inputCls}
                placeholder="VERAS"
              />
            </Field>
            <Field label="Current annual cost (USD)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.existing_enterprise_system_annual_cost_usd}
                onChange={(e) =>
                  setForm({
                    ...form,
                    existing_enterprise_system_annual_cost_usd: e.target.value,
                  })
                }
                className={inputCls}
                placeholder="150000"
              />
            </Field>
            <Field label="Renewal date">
              <input
                type="date"
                value={form.existing_enterprise_system_renewal_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    existing_enterprise_system_renewal_date: e.target.value,
                  })
                }
                className={inputCls}
              />
            </Field>
          </div>
        )}
      </Section>

      {/* Ownership */}
      <Section title="Ownership">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Owner name (legacy)">
            <input
              type="text"
              value={form.owner_name}
              onChange={(e) =>
                setForm({ ...form, owner_name: e.target.value })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Owner email">
            <input
              type="email"
              value={form.owner_email}
              onChange={(e) =>
                setForm({ ...form, owner_email: e.target.value })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Department (legacy)">
            <input
              type="text"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Home units" hint="Comma-separated. Used to group on /portfolio.">
            <ArrayInput
              value={form.home_units}
              onChange={(v) => setForm({ ...form, home_units: v })}
              placeholder="Office of Research and Economic Development"
            />
          </Field>
        </div>
        <Field
          label="Operational owners"
          hint="JSON array of {name, title?}. The first entry shows on the card."
        >
          <OwnersInput
            value={form.operational_owners}
            onChange={(v) => setForm({ ...form, operational_owners: v })}
          />
        </Field>
        <Field label="Build participants" hint="Comma-separated. e.g. IIDS, SEM.">
          <ArrayInput
            value={form.build_participants}
            onChange={(v) => setForm({ ...form, build_participants: v })}
          />
        </Field>
      </Section>

      {/* AI4RA */}
      <Section title="AI4RA partnership">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Relationship">
            <select
              value={form.ai4ra_relationship}
              onChange={(e) =>
                setForm({ ...form, ai4ra_relationship: e.target.value })
              }
              className={inputCls}
            >
              {AI4RA_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.dual_destiny_planned}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dual_destiny_planned: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-ui-gold focus:ring-ui-gold"
              />
              Dual destiny planned (OSS + UI)
            </label>
          </div>
        </div>
        <Field label="External deployments" hint="Comma-separated.">
          <ArrayInput
            value={form.external_deployments}
            onChange={(v) => setForm({ ...form, external_deployments: v })}
          />
        </Field>
      </Section>

      {/* Links */}
      <Section title="Links">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="GitHub repo (legacy field)">
            <input
              type="text"
              value={form.github_repo}
              onChange={(e) =>
                setForm({ ...form, github_repo: e.target.value })
              }
              placeholder="org/repo-name"
              className={inputCls}
            />
          </Field>
          <Field label="Repo URL (canonical)">
            <input
              type="url"
              value={form.repo_url}
              onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
              placeholder="https://github.com/org/repo"
              className={inputCls}
            />
          </Field>
          <Field label="Docs URL">
            <input
              type="url"
              value={form.docs_url}
              onChange={(e) => setForm({ ...form, docs_url: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Live URL (canonical)">
            <input
              type="url"
              value={form.live_url}
              onChange={(e) => setForm({ ...form, live_url: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Production URL (legacy)">
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className={inputCls}
            />
          </Field>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_private_repo}
                onChange={(e) =>
                  setForm({ ...form, is_private_repo: e.target.checked })
                }
                className="rounded border-gray-300 text-ui-gold focus:ring-ui-gold"
              />
              Private repository
            </label>
          </div>
        </div>
      </Section>

      {/* Content */}
      <Section title="Content (public)">
        <Field label="Funding">
          <input
            type="text"
            value={form.funding}
            onChange={(e) => setForm({ ...form, funding: e.target.value })}
            placeholder="NSF GRANTED award #..."
            className={inputCls}
          />
        </Field>
        <Field label="Operational function at UI">
          <textarea
            rows={3}
            value={form.operational_function}
            onChange={(e) =>
              setForm({ ...form, operational_function: e.target.value })
            }
            className={inputCls + " resize-none"}
          />
        </Field>
        <Field label="Operational excellence outcome">
          <textarea
            rows={3}
            value={form.operational_excellence_outcome}
            onChange={(e) =>
              setForm({
                ...form,
                operational_excellence_outcome: e.target.value,
              })
            }
            className={inputCls + " resize-none"}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Key features" hint="One per line.">
            <LinesInput
              value={form.features}
              onChange={(v) => setForm({ ...form, features: v })}
            />
          </Field>
          <Field label="Tech stack" hint="Comma-separated.">
            <ArrayInput
              value={form.tech}
              onChange={(v) => setForm({ ...form, tech: v })}
              placeholder="Next.js, PostgreSQL, MindRouter"
            />
          </Field>
        </div>
      </Section>

      {/* Wizard classification */}
      <Section title="Wizard classification">
        <p className="-mt-3 text-xs text-gray-500">
          Used by the similarity engine on Submit-a-Project. Edit if the
          assessment values don&apos;t match the actual deployment, or to
          correct seed heuristics.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Complexity">
            <input
              type="text"
              value={form.complexity}
              onChange={(e) =>
                setForm({ ...form, complexity: e.target.value })
              }
              className={inputCls}
            />
          </Field>
          <Field label="User base">
            <input
              type="text"
              value={form.userbase}
              onChange={(e) => setForm({ ...form, userbase: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Auth level">
            <input
              type="text"
              value={form.auth_level}
              onChange={(e) =>
                setForm({ ...form, auth_level: e.target.value })
              }
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Sensitivity" hint="Comma-separated.">
            <ArrayInput
              value={form.sensitivity}
              onChange={(v) => setForm({ ...form, sensitivity: v })}
              placeholder="FERPA, PII"
            />
          </Field>
          <Field label="Integrations" hint="Comma-separated.">
            <ArrayInput
              value={form.integrations}
              onChange={(v) => setForm({ ...form, integrations: v })}
            />
          </Field>
          <Field label="Data sources" hint="Comma-separated.">
            <ArrayInput
              value={form.data_sources}
              onChange={(v) => setForm({ ...form, data_sources: v })}
            />
          </Field>
          <Field label="University systems" hint="Comma-separated.">
            <ArrayInput
              value={form.university_systems}
              onChange={(v) => setForm({ ...form, university_systems: v })}
            />
          </Field>
          <Field label="Output types" hint="Comma-separated.">
            <ArrayInput
              value={form.output_types}
              onChange={(v) => setForm({ ...form, output_types: v })}
            />
          </Field>
        </div>
      </Section>

      {/* Misc / integrations */}
      <Section title="Workflow integrations">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="ClickUp task ID"
            hint="Sprint 3b will sync status & blockers from this task."
          >
            <input
              type="text"
              value={form.clickup_task_id}
              onChange={(e) =>
                setForm({ ...form, clickup_task_id: e.target.value })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Related slugs" hint="Comma-separated. Surfaces in /portfolio/[slug]." >
            <ArrayInput
              value={form.related_slugs}
              onChange={(v) => setForm({ ...form, related_slugs: v })}
            />
          </Field>
        </div>
      </Section>

      {/* Save bar */}
      <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-ui-gold px-5 py-2 text-sm font-medium text-ui-black hover:bg-ui-gold-light disabled:bg-gray-200 transition-colors"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {successMsg && (
            <span className="text-sm text-green-600">{successMsg}</span>
          )}
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Delete application
        </button>
      </div>

      {/* Provenance */}
      {app.submission_id && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Created from submission
          </p>
          <Link
            href={`/admin/submissions/${app.submission_id}`}
            className="mt-1 text-sm text-ui-gold-dark hover:underline font-mono"
          >
            {app.submission_id}
          </Link>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex gap-6 text-xs text-gray-400">
        <span>Created: {new Date(app.created_at).toLocaleString()}</span>
        <span>Updated: {new Date(app.updated_at).toLocaleString()}</span>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Application
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{app.name}</strong>?
              This will cascade-delete its blockers and similarity matches.
              Cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300 transition-colors"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
