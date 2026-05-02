import type { ReactNode } from "react";

type CalloutTone = "default" | "subtle" | "emphasis";

interface CalloutProps {
  eyebrow?: string;
  title?: string;
  tone?: CalloutTone;
  children: ReactNode;
  className?: string;
}

const surfaceByTone: Record<CalloutTone, string> = {
  default: "bg-white shadow-sm",
  subtle: "bg-surface-alt",
  emphasis: "bg-brand-gold/5 ring-1 ring-brand-gold/20",
};

export function Callout({
  eyebrow,
  title,
  tone = "default",
  children,
  className = "",
}: CalloutProps) {
  const surface = surfaceByTone[tone];
  return (
    <div
      className={`rounded-xl border border-hairline ${surface} p-6 ${className}`.trim()}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-clearwater">
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="mt-2 text-lg font-bold text-brand-black">{title}</h2>
      )}
      <div className={eyebrow || title ? "mt-3 text-base leading-relaxed text-ink-muted" : "text-base leading-relaxed text-ink-muted"}>
        {children}
      </div>
    </div>
  );
}
