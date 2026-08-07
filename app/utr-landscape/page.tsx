import Link from "next/link";
import { listApplications } from "@/lib/work";
import { listTechRequests } from "@/lib/requests";
import {
  buildUtrLandscape,
  type LandscapeActivity,
  type LandscapeFinding,
  type LandscapeFindingKind,
  type TargetBand,
} from "@/lib/utr-landscape";
import {
  TARGET_MATURITY_CHIP,
  TARGET_MATURITY_LABEL,
} from "@/lib/deployment-targets";
import { DEPLOYMENT_ENVIRONMENT_LABELS } from "@/lib/project-governance";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "UTR Landscape — Institutional AI Initiative",
  description:
    "Every project and open technology request at the University of Idaho, harmonized against the five deployment targets institutional work can land on — and the mismatches between demand and supply.",
};

const linkCls =
  "font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2";

const FINDING_LABEL: Record<LandscapeFindingKind, string> = {
  "transitional-load": "Transitional load",
  "gate-concentration": "Gate concentration",
  "demand-on-aspirational-supply": "Demand on aspirational supply",
  "unproven-supply": "Unproven supply",
  "vendor-demand": "Vendor-hosted demand",
  "unclassified-pool": "Unclassified",
};

// How many rows a band list renders before deferring to its canonical
// surface. Never a silent cap — the overflow line names the remainder.
const BAND_LIST_LIMIT = 8;

function ProvenanceChip({ activity }: { activity: LandscapeActivity }) {
  if (activity.kind !== "request" || !activity.provenance) return null;
  const label = activity.provenance === "inferred" ? "Inferred" : "Confirmed";
  return (
    <span
      title={activity.inferenceRationale ?? undefined}
      className="inline-flex shrink-0 items-center rounded-full border border-hairline bg-surface-alt px-2 py-0.5 text-[10px] font-medium text-ink-muted"
    >
      {label}
    </span>
  );
}

function ActivityRow({ activity }: { activity: LandscapeActivity }) {
  return (
    <li className="flex items-baseline gap-2 py-1.5">
      <Link href={activity.href} className={`${linkCls} text-sm`}>
        {activity.name}
      </Link>
      <span className="min-w-0 flex-1 truncate text-xs text-ink-subtle">
        {[activity.unit, activity.position].filter(Boolean).join(" · ")}
      </span>
      <ProvenanceChip activity={activity} />
    </li>
  );
}

function BandList({
  heading,
  activities,
  overflowHref,
  overflowLabel,
}: {
  heading: string;
  activities: LandscapeActivity[];
  overflowHref: string;
  overflowLabel: string;
}) {
  if (activities.length === 0) return null;
  const shown = activities.slice(0, BAND_LIST_LIMIT);
  const remainder = activities.length - shown.length;
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
        {heading} · {activities.length}
      </h4>
      <ul className="mt-1 divide-y divide-gray-100">
        {shown.map((a) => (
          <ActivityRow key={`${a.kind}:${a.ref}`} activity={a} />
        ))}
      </ul>
      {remainder > 0 && (
        <p className="mt-1 text-xs text-ink-muted">
          <Link href={overflowHref} className={linkCls}>
            + {remainder} more {overflowLabel} →
          </Link>
        </p>
      )}
    </div>
  );
}

function FindingRow({ finding }: { finding: LandscapeFinding }) {
  return (
    <li className="border-t border-gray-200 py-5 first:border-t-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-silver">
        {FINDING_LABEL[finding.kind]}
      </p>
      <p className="mt-1.5 max-w-3xl text-base font-semibold leading-snug text-brand-black">
        {finding.headline}
      </p>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">
        {finding.detail}
      </p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {finding.evidence.map((e) => (
          <Link key={e.href} href={e.href} className={linkCls}>
            {e.label}
          </Link>
        ))}
      </p>
    </li>
  );
}

function BandSection({ band }: { band: TargetBand }) {
  const { profile } = band;
  const empty =
    band.running.length + band.headed.length + band.queued.length === 0;
  return (
    <section
      id={`target-${profile.value}`}
      className="scroll-mt-8 rounded-lg border border-hairline bg-white p-5"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-lg font-black tracking-tight text-brand-black">
          {profile.name}
        </h3>
        <span
          title={profile.maturityNote}
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TARGET_MATURITY_CHIP[profile.maturity]}`}
        >
          {TARGET_MATURITY_LABEL[profile.maturity]}
        </span>
      </div>
      {profile.definition.status === "defined" ? (
        <p className="mt-1 text-xs text-ink-subtle">
          Defined with {profile.definition.definedBy.name} (
          {profile.definition.definedBy.role}) ·{" "}
          {profile.definition.definedBy.date}
        </p>
      ) : (
        <p className="mt-1 text-xs italic text-ink-subtle">
          Not yet defined — characteristics inferred from documents;
          definition session pending.
        </p>
      )}
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">
        {profile.shipUnit}
      </p>
      {empty ? (
        <p className="mt-3 text-sm text-ink-subtle">
          Nothing runs here, is headed here, or is queued for here yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          <BandList
            heading="Running here"
            activities={band.running}
            overflowHref="/portfolio"
            overflowLabel="in Projects"
          />
          <BandList
            heading="Headed here"
            activities={band.headed}
            overflowHref="/portfolio"
            overflowLabel="in Projects"
          />
          <BandList
            heading="Queued for here"
            activities={band.queued}
            overflowHref="/portfolio/pipeline"
            overflowLabel="in the request queue"
          />
        </div>
      )}
    </section>
  );
}

export default async function UtrLandscapePage() {
  const [applications, requests] = await Promise.all([
    listApplications({ audience: "public" }),
    listTechRequests(),
  ]);
  const landscape = buildUtrLandscape(applications, requests);
  const { totals, pools } = landscape;

  const unclassifiedProjects = pools.unclassified.filter(
    (a) => a.kind === "project"
  );
  const unclassifiedRequests = pools.unclassified.filter(
    (a) => a.kind === "request"
  );

  return (
    <div className="space-y-14">
      {/* ── Heading ─────────────────────────────────────── */}
      <section>
        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-brand-black">
          Where institutional AI work lands
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Every technology effort the university tracks —{" "}
          <span className="font-semibold text-brand-black">
            {totals.projects} projects
          </span>{" "}
          and{" "}
          <span className="font-semibold text-brand-black">
            {totals.openRequests} open requests
          </span>{" "}
          — mapped against the five deployment targets institutional work
          can land on. The targets are not equal: one is proven, two are
          approved but untried, one is an aspiration, and one is a staging
          ground. The mismatches between demand and that supply are the
          coordination agenda.
        </p>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-ink-subtle">
          Request classifications marked <em>Inferred</em> are machine
          proposals awaiting triage confirmation. This page is a
          projection — every activity links to its full story in{" "}
          <Link href="/portfolio" className={linkCls}>
            Projects
          </Link>{" "}
          or the{" "}
          <Link href="/portfolio/pipeline" className={linkCls}>
            request queue
          </Link>
          .
        </p>
      </section>

      {/* ── The mismatch ledger ─────────────────────────── */}
      <section>
        <h2 className="text-2xl font-black tracking-tight text-brand-black">
          The mismatch ledger
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          Computed from the inventory and the request registry on every
          load — when a target matures or a workload lands, the ledger
          reflows.
        </p>
        <ul className="mt-4">
          {landscape.findings.map((f) => (
            <FindingRow key={f.kind} finding={f} />
          ))}
        </ul>
      </section>

      {/* ── The five targets ────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-black tracking-tight text-brand-black">
          The five targets
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          Form factor first — a report lands on the lakehouse, a
          transactional module lands on Nexus — then hosting by operator
          and risk for everything standalone.
        </p>
        <div className="mt-5 space-y-5">
          {landscape.bands.map((band) => (
            <BandSection key={band.profile.value} band={band} />
          ))}
        </div>
      </section>

      {/* ── Outside the five targets ────────────────────── */}
      <section id="unclassified" className="scroll-mt-8">
        <h2 className="text-2xl font-black tracking-tight text-brand-black">
          Outside the five targets
        </h2>
        <dl className="mt-5 space-y-6">
          {pools.externalHosted.length > 0 && (
            <div>
              <dt className="text-sm font-bold text-brand-black">
                Vendor-hosted demand ·{" "}
                {
                  pools.externalHosted.filter((a) => a.kind === "request")
                    .length
                }{" "}
                requests
              </dt>
              <dd className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
                Purchase and subscription requests that would land on a
                vendor&apos;s infrastructure, not a university target — a
                procurement and governance question rather than a deployment
                one.{" "}
                <Link href="/portfolio/pipeline" className={linkCls}>
                  See them in the request queue
                </Link>
                .
              </dd>
            </div>
          )}
          {pools.oitManagedTbd.length > 0 && (
            <div>
              <dt className="text-sm font-bold text-brand-black">
                {DEPLOYMENT_ENVIRONMENT_LABELS["oit-managed-tbd"]} ·{" "}
                {pools.oitManagedTbd.length}
              </dt>
              <dd className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
                The OIT-managed decision is made; which target has not been
                picked.
              </dd>
              <ul className="mt-1 max-w-3xl">
                {pools.oitManagedTbd.map((a) => (
                  <ActivityRow key={`${a.kind}:${a.ref}`} activity={a} />
                ))}
              </ul>
            </div>
          )}
          {pools.noDeployment.length > 0 && (
            <div>
              <dt className="text-sm font-bold text-brand-black">
                Nothing deploys · {pools.noDeployment.length} requests
              </dt>
              <dd className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
                Requests whose substance is access, policy, or an existing
                system — resolved without landing anywhere.{" "}
                <Link href="/portfolio/pipeline" className={linkCls}>
                  See them in the request queue
                </Link>
                .
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-bold text-brand-black">
              No destination yet · {unclassifiedProjects.length} projects
              {unclassifiedRequests.length > 0 &&
                ` and ${unclassifiedRequests.length} requests`}
            </dt>
            <dd className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
              The working queue for target triage — unclassified is a
              state, not an omission.
              {unclassifiedRequests.length > 0 && (
                <>
                  {" "}
                  <Link href="/portfolio/pipeline" className={linkCls}>
                    The unclassified requests live in the queue
                  </Link>
                  .
                </>
              )}
            </dd>
            <ul className="mt-1 max-w-3xl">
              {unclassifiedProjects.map((a) => (
                <ActivityRow key={`${a.kind}:${a.ref}`} activity={a} />
              ))}
            </ul>
          </div>
          {pools.platforms.length > 0 && (
            <div>
              <dt className="text-sm font-bold text-brand-black">
                Platforms · {pools.platforms.length}
              </dt>
              <dd className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
                Entries that are themselves supply — the infrastructure
                other work lands on.
              </dd>
              <ul className="mt-1 max-w-3xl">
                {pools.platforms.map((a) => (
                  <ActivityRow key={`${a.kind}:${a.ref}`} activity={a} />
                ))}
              </ul>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
