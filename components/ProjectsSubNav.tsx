"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const projectSections = [
  { href: "/portfolio", label: "Active projects" },
  { href: "/portfolio/pipeline", label: "Requested projects" },
] as const;

function activeHrefFor(pathname: string): string {
  return pathname === "/portfolio/pipeline" ||
    pathname.startsWith("/portfolio/pipeline/")
    ? "/portfolio/pipeline"
    : "/portfolio";
}

export default function ProjectsSubNav() {
  const pathname = usePathname();
  const activeHref = activeHrefFor(pathname);

  return (
    <nav
      aria-label="Project sections"
      className="-mb-px flex gap-8 overflow-x-auto"
    >
      {projectSections.map((item) => {
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
