"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subNavItems = [
  { href: "/standards", label: "Standards" },
  { href: "/standards/data-model", label: "Data Model" },
  { href: "/standards/strategic-plan", label: "Strategic Plan" },
  { href: "/standards/strategic-plan/map", label: "Map" },
];

// Pick the longest-prefix match so a more specific entry (e.g. Map under
// Strategic Plan) wins over its parent's prefix.
function activeHrefFor(pathname: string): string | null {
  const ranked = [...subNavItems].sort(
    (a, b) => b.href.length - a.href.length,
  );
  for (const item of ranked) {
    if (item.href === "/standards") {
      if (pathname === "/standards") return item.href;
      continue;
    }
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      return item.href;
    }
  }
  return null;
}

export default function StandardsSubNav() {
  const pathname = usePathname();
  const activeHref = activeHrefFor(pathname);
  return (
    <nav
      aria-label="Standards sections"
      className="-mb-px flex gap-8 overflow-x-auto"
    >
      {subNavItems.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`unstyled whitespace-nowrap border-b-2 pb-3 text-sm font-semibold tracking-tight transition-colors ${
              active
                ? "border-brand-clearwater text-ui-charcoal"
                : "border-transparent text-gray-600 hover:text-ui-charcoal"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
