import Link from "next/link";
import { listApplications } from "@/lib/work";
import { getLastSync } from "@/lib/clickup-data";
import SyncNowButton from "@/components/SyncNowButton";

export const dynamic = "force-dynamic";

export default async function InternalHome() {
  const [apps, lastSync] = await Promise.all([
    listApplications({ audience: "internal" }),
    getLastSync(),
  ]);
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
          Operations surfaces only — sync control and agent traffic. The
          inventory itself is public at{" "}
          <Link href="/portfolio" className="underline decoration-brand-clearwater underline-offset-2">
            /portfolio
          </Link>{" "}
          and the request queue at{" "}
          <Link href="/portfolio/pipeline" className="underline decoration-brand-clearwater underline-offset-2">
            /portfolio/pipeline
          </Link>
          . The site tells one story; there is no internal copy of either.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total projects
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
            projects
          </p>
        </div>
        <Link
          href="/portfolio"
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-ui-gold-dark">
            Inventory
          </p>
          <p className="mt-1 text-base font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
            Projects &rarr;
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Public at /portfolio — the same records these counts describe
          </p>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/portfolio/pipeline"
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-ui-gold-dark">
            UTR registry
          </p>
          <p className="mt-1 text-base font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
            Unified request queue &rarr;
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Now public at /portfolio/pipeline — every origin, one story
          </p>
        </Link>
        <Link
          href="/internal/agent-log"
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md md:col-span-2"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-ui-gold-dark">
            Conversational agent
          </p>
          <p className="mt-1 text-base font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
            Agent traffic &amp; failures &rarr;
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Recent /api/ask queries, tool calls, latency, and errors
          </p>
        </Link>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ui-charcoal">
          ClickUp sync
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Pulls project status updates, ROI, and the scored request backlog
          from the IIDS-AI4UI space (ADR 0004). Runs on a host cron;
          trigger manually after editing in ClickUp.
        </p>
        <div className="mt-4">
          <SyncNowButton lastSyncedAt={lastSync?.finishedAt ?? null} />
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-6">
        <h2 className="text-base font-semibold text-ui-charcoal">
          Still outstanding
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          <li>
            &bull; ClickUp write-side — new submissions create ClickUp tasks.
            Read-side shipped (ADR 0004); writes remain future work.
          </li>
          <li>
            &bull; Named-SLA acknowledgment <em>email</em> on intake. The named
            human and SLA render on the results page and on{" "}
            <code>/intake/[token]</code>, but nothing is actually sent — there
            is no mailer in the stack.
          </li>
          <li>
            &bull; TDX request sync (<code>scripts/sync-tdx.ts</code>) — blocked
            on API access. ADR 0005 Phase 4.
          </li>
        </ul>
      </section>
    </div>
  );
}
