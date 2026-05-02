"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/portfolio/error.tsx]", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-clearwater">
        The Work — temporarily unavailable
      </p>

      <h1 className="mt-3 text-3xl font-black tracking-tight text-brand-black md:text-4xl">
        The intervention registry isn&apos;t responding.
      </h1>

      <p className="mt-6 text-base leading-relaxed text-ink-muted">
        This page reads from the <code className="rounded bg-surface-alt px-1.5 py-0.5 font-mono text-sm text-brand-black">applications</code> table in
        Postgres. The query failed or the database isn&apos;t reachable. The portfolio itself
        hasn&apos;t changed — the surface that renders it is the part that&apos;s broken.
      </p>

      <div className="mt-10 border-t border-hairline pt-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">
          While we work on it
        </h2>
        <ul className="mt-4 space-y-3 text-base text-ink-muted">
          <li>
            <button
              type="button"
              onClick={reset}
              className="font-semibold text-brand-black underline decoration-brand-clearwater decoration-[1.5px] underline-offset-4 hover:decoration-2"
            >
              Retry the portfolio
            </button>
            .
          </li>
          <li>
            Submit a project anyway via <Link href="/builder-guide">the intake</Link> — that path is independent.
          </li>
          <li>
            Read the most recent <Link href="/reports">briefs and decks</Link>.
          </li>
          <li>
            Open the public <Link href="/standards">Standards Watch</Link>.
          </li>
        </ul>
      </div>

      {error.digest && (
        <p className="mt-12 font-mono text-xs text-ink-subtle">
          Reference: {error.digest}
        </p>
      )}
    </main>
  );
}
