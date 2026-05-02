"use client";

import { useState } from "react";

// Toggles all <details> elements within the given selector. Used on
// project-detail pages with >10 tables, where defaulting all column lists
// open would create an excessively long page but engineers still want a
// one-click way to expand the whole catalog.

export default function ExpandAllSchemas({
  selector = "[data-table-card] details",
}: {
  selector?: string;
}) {
  const [allOpen, setAllOpen] = useState(false);

  const toggle = () => {
    const els = document.querySelectorAll<HTMLDetailsElement>(selector);
    const next = !allOpen;
    els.forEach((d) => {
      d.open = next;
    });
    setAllOpen(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-xs font-medium text-ink-muted hover:text-brand-black"
    >
      {allOpen ? "Collapse all schemas" : "Expand all schemas"}
    </button>
  );
}
