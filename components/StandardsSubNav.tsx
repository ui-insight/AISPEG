"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subNavItems = [
  { href: "/standards", label: "Standards" },
  { href: "/standards/data-model", label: "Data Model" },
];

export default function StandardsSubNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Standards sections"
      className="-mb-px flex gap-8 overflow-x-auto"
    >
      {subNavItems.map((item) => {
        const active =
          item.href === "/standards"
            ? pathname === "/standards"
            : pathname === item.href || pathname.startsWith(item.href + "/");
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
