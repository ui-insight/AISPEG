import Link from "next/link";
import { listTechRequests, requestCounts } from "@/lib/requests";
import {
  INTAKE_TRACK_SHORT,
  INTAKE_TRACK_TITLE,
  REQUEST_DISPOSITION_LABEL,
  REQUEST_ORIGIN_LABEL,
  isIntakeTrack,
} from "@/lib/utr";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unified Request Queue — Internal",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function InternalRequestsPage() {
  const [requests, counts] = await Promise.all([
    listTechRequests(),
    requestCounts(),
  ]);

  const openFirst = [...requests].sort((a, b) => {
    const aOpen = a.disposition === "open" ? 0 : 1;
    const bOpen = b.disposition === "open" ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    return b.receivedAt.localeCompare(a.receivedAt);
  });

  return (
    <div className="space-y-10">
      <nav className="text-sm text-gray-500">
        <Link href="/internal" className="hover:text-brand-black">
          Internal
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">Unified request queue</span>
      </nav>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-ui-gold-dark">
          IIDS Internal
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ui-charcoal">
          Unified request queue
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-700">
          Every technology request the registry knows about, from every
          origin — the ClickUp intake backlog, Submit-a-Project
          assessments, and (once wired) TDX — in one queue per the
          Unified Technology Request process (ADR 0005). Track and stage
          stay empty until UTR triage assigns them; the queue existing
          before the process starts is the point.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Requests registered
          </p>
          <p className="mt-1 text-3xl font-black text-ui-charcoal">
            {counts.total}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {Object.entries(counts.byOrigin)
              .filter(([, n]) => n > 0)
              .map(
                ([origin, n]) =>
                  `${n} ${REQUEST_ORIGIN_LABEL[origin as keyof typeof REQUEST_ORIGIN_LABEL].toLowerCase()}`
              )
              .join(" · ") || "No sources synced yet"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Open
          </p>
          <p className="mt-1 text-3xl font-black text-ui-charcoal">
            {counts.open}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Awaiting review or a decision
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            UTR-triaged
          </p>
          <p className="mt-1 text-3xl font-black text-ui-charcoal">
            {requests.filter((r) => r.track !== null).length}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Assigned a track by the joint triage process
          </p>
        </div>
      </section>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-600">
            The registry is empty. Run Migration 018, then a ClickUp sync
            — existing backlog requests and site submissions backfill
            automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Request
                </th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Origin
                </th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Requestor
                </th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Received
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Track
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Signal
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Disposition
                </th>
              </tr>
            </thead>
            <tbody>
              {openFirst.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="max-w-md px-4 py-2.5">
                    <p className="truncate text-sm font-medium text-ui-charcoal">
                      {r.title}
                    </p>
                    {r.submissionId && (
                      <Link
                        href={`/intake/${r.submissionId}`}
                        className="text-xs text-gray-400 hover:text-brand-black"
                      >
                        View submission →
                      </Link>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {REQUEST_ORIGIN_LABEL[r.origin]}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {r.requestorName ?? "—"}
                    {r.requestorUnit && (
                      <span className="text-gray-400"> · {r.requestorUnit}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600">
                    {formatDate(r.receivedAt)}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs text-gray-600">
                    {r.track && isIntakeTrack(r.track) ? (
                      <span title={INTAKE_TRACK_TITLE[r.track]}>
                        {INTAKE_TRACK_SHORT[r.track]}
                      </span>
                    ) : (
                      <span
                        className="text-gray-300"
                        title="Not yet triaged under the UTR process"
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs tabular-nums text-gray-600">
                    {r.weightedScore !== null ? (
                      <span title="ClickUp rubric weighted score (0–100)">
                        {Math.round(r.weightedScore * 10) / 10}
                      </span>
                    ) : r.submissionTier !== null ? (
                      <span title="Site assessment tier (1–4)">
                        Tier {r.submissionTier}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        r.disposition === "open"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {REQUEST_DISPOSITION_LABEL[r.disposition]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Registry rows are durable memory: a request deleted upstream keeps
        its row and last-known disposition here. Requestor names and
        submission content have no public-visibility decision yet, so this
        queue is internal-only (ADR 0005).
      </p>
    </div>
  );
}
