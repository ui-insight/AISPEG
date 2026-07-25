import SectionSubNav, { type SubNavItem } from "@/components/SectionSubNav";

// Process surfaces — how a request becomes tracked institutional work.
// Reference surfaces (standards ledger, data model, strategic plan) live
// under /standards.
const subNavItems: SubNavItem[] = [
  { href: "/coordination", label: "Overview" },
  { href: "/coordination/intake-crosswalk", label: "Intake Crosswalk" },
  { href: "/coordination/oit-pathway", label: "OIT Pathway" },
  { href: "/coordination/oit-portfolio", label: "OIT Portfolio" },
  {
    href: "/coordination/operational-excellence",
    label: "Op Excellence Survey",
  },
];

export default function CoordinationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="mb-10 border-b border-gray-200">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Coordination
        </p>
        <div className="mt-4">
          <SectionSubNav
            items={subNavItems}
            rootHref="/coordination"
            ariaLabel="Coordination sections"
          />
        </div>
      </header>
      {children}
    </div>
  );
}
