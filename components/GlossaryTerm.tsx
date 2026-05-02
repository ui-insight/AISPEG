"use client";

import { useId, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { glossary, type GlossaryKey } from "@/lib/governance/glossary";

interface GlossaryTermProps {
  term: GlossaryKey;
  children?: ReactNode;
  /** Where to position the tooltip relative to the trigger. */
  placement?: "below" | "above";
}

export default function GlossaryTerm({
  term,
  children,
  placement = "below",
}: GlossaryTermProps) {
  const def = glossary[term];
  const id = useId();
  const [tapOpen, setTapOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!tapOpen) return;
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setTapOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [tapOpen]);

  if (!def) return <>{children ?? term}</>;

  const positionClass =
    placement === "above"
      ? "bottom-full mb-1.5"
      : "top-full mt-1.5";

  return (
    <span ref={wrapperRef} className="group relative inline-block">
      <span
        tabIndex={0}
        role="button"
        aria-describedby={id}
        onClick={() => setTapOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setTapOpen(false);
        }}
        className="cursor-help border-b border-dotted border-current outline-none focus-visible:rounded-sm focus-visible:bg-brand-clearwater/15"
      >
        {children ?? term}
      </span>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute left-0 z-50 w-64 max-w-[80vw] rounded-md border border-hairline bg-white p-3 text-xs font-normal normal-case leading-relaxed tracking-normal text-ink-muted shadow-md transition-opacity ${positionClass} ${
          tapOpen ? "visible opacity-100" : "invisible opacity-0"
        } group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100`}
      >
        {def}
      </span>
    </span>
  );
}
