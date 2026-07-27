// Status pill colours for the admin registry surfaces.
//
// Colours key on the PUBLIC STAGE, not the operational status. There are
// twelve operational statuses and only six stages, so this is both fewer
// entries and — more importantly — self-maintaining: adding a status to
// the ADR 0001 ladder gives it a colour automatically via the rollup,
// instead of falling through to a default.
//
// `Record<PublicStage, string>` is exhaustive, so tsc fails the build if
// a new stage ever lands without a colour here.
//
// Deliberately not the public palette in lib/portfolio.ts
// (PUBLIC_STAGE_CHIP): these are solid admin pills, not the bordered
// chips the public surfaces use, and .impeccable.md's restraint rules
// govern the public site rather than internal tooling.

import { publicStageFromStatus, type PublicStage } from "@/lib/portfolio";

const stageColors: Record<PublicStage, string> = {
  exploring: "bg-gray-100 text-gray-600",
  building: "bg-yellow-100 text-yellow-700",
  live: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-800",
  retired: "bg-red-100 text-red-500",
  tracked: "bg-violet-100 text-violet-700",
};

/**
 * Tailwind classes for a status pill. Accepts a raw DB string — anything
 * outside the union rolls up to `exploring` via publicStageFromStatus,
 * matching what the public site would show for the same row.
 */
export function statusColor(status: string): string {
  return stageColors[publicStageFromStatus(status)];
}
