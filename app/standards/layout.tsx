import StandardsSubNav from "@/components/StandardsSubNav";

export default function StandardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="mb-10 border-b border-gray-200">
        <p className="text-xs font-semibold uppercase tracking-wider text-ui-gold-dark">
          Institutional Standards
        </p>
        <div className="mt-4">
          <StandardsSubNav />
        </div>
      </header>
      {children}
    </div>
  );
}
