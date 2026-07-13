// Muted provenance line for ClickUp-synced content (ADR 0004). Every
// surface rendering synced data shows when it was last pulled, so a
// stalled sync reads as stale instead of current.

export function formatSyncDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SyncFreshness({ syncedAt }: { syncedAt: string }) {
  return (
    <p className="text-xs text-brand-silver">
      Status data from ClickUp, synced {formatSyncDate(syncedAt)}.
    </p>
  );
}
