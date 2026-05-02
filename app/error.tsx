"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error.tsx]", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-clearwater">
        Surface unavailable
      </p>

      <h1 className="mt-3 text-3xl font-black tracking-tight text-brand-black md:text-4xl">
        This page depends on a service that isn&apos;t responding.
      </h1>

      <p className="mt-6 text-base leading-relaxed text-ink-muted">
        The site reads from a Postgres registry and a few other internal services. One of them
        timed out or returned an error. We&apos;d rather tell you that plainly than show a
        generic crash page.
      </p>

      <div className="mt-10 border-t border-hairline pt-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">
          What you can do
        </h2>
        <ul className="mt-4 space-y-3 text-base text-ink-muted">
          <li>
            <button
              type="button"
              onClick={reset}
              className="font-semibold text-brand-black underline decoration-brand-clearwater decoration-[1.5px] underline-offset-4 hover:decoration-2"
            >
              Try this page again
            </button>{" "}
            — sometimes a single retry is enough.
          </li>
          <li>
            Read the latest <Link href="/reports">briefs and activity reports</Link> — those don&apos;t depend on the registry.
          </li>
          <li>
            Open the public <Link href="/standards">Standards Watch</Link> — also independent.
          </li>
          <li>
            Or learn what this site is on the <Link href="/about">About</Link> page.
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
