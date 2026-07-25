"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SubNavItem {
  href: string;
  label: string;
}

// Pick the longest-prefix match so a more specific entry (e.g. Map under
// Strategic Plan) wins over its parent's prefix. The section root is
// exact-match only — otherwise it would swallow every child route.
function activeHrefFor(
  pathname: string,
  items: SubNavItem[],
  rootHref: string,
): string | null {
  const ranked = [...items].sort((a, b) => b.href.length - a.href.length);
  for (const item of ranked) {
    if (item.href === rootHref) {
      if (pathname === rootHref) return item.href;
      continue;
    }
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      return item.href;
    }
  }
  return null;
}

/**
 * Shared sub-nav for a primary surface's sub-sections. Sidebar entries stay
 * at one per surface; sub-pages live here instead. Used by
 * `app/standards/layout.tsx` and `app/coordination/layout.tsx`.
 */
export default function SectionSubNav({
  items,
  rootHref,
  ariaLabel,
}: {
  items: SubNavItem[];
  rootHref: string;
  ariaLabel: string;
}) {
  const pathname = usePathname();
  const activeHref = activeHrefFor(pathname, items, rootHref);
  return (
    <nav aria-label={ariaLabel} className="-mb-px flex gap-8 overflow-x-auto">
      {items.map((item) => {
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
