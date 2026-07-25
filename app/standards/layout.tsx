import SectionSubNav, { type SubNavItem } from "@/components/SectionSubNav";

// Reference surfaces only — what institutional AI work is measured against.
// Process surfaces (intake, the OIT pathway, demand evidence) live under
// /coordination.
const subNavItems: SubNavItem[] = [
  { href: "/standards", label: "Standards" },
  { href: "/standards/data-model", label: "Data Model" },
  { href: "/standards/strategic-plan", label: "Strategic Plan" },
  { href: "/standards/strategic-plan/map", label: "Map" },
];

export default function StandardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="mb-10 border-b border-gray-200">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Standards
        </p>
        <div className="mt-4">
          <SectionSubNav
            items={subNavItems}
            rootHref="/standards"
            ariaLabel="Standards sections"
          />
        </div>
      </header>
      {children}
    </div>
  );
}
