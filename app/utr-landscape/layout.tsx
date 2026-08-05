// The UTR Landscape surface (ADR 0008) — the destination-harmonized
// activity view. Eyebrow matches the sidebar label verbatim (heading
// rule Form B, .impeccable.md). Sub-nav arrives with the per-target
// detail pages (delivery PR 5); until then the header carries the
// eyebrow alone.
export default function UtrLandscapeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="mb-10 border-b border-gray-200 pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          UTR Landscape
        </p>
      </header>
      {children}
    </div>
  );
}
