"use client";

import { useEffect, useRef } from "react";
import "reveal.js/reveal.css";

type RevealInstance = {
  initialize: () => Promise<unknown>;
  destroy: () => void;
};
type RevealCtor = new (el: HTMLElement, config: Record<string, unknown>) => RevealInstance;

export default function RevealDeck({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<RevealInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;

    (async () => {
      const RevealModule = await import("reveal.js");
      const Reveal = RevealModule.default as unknown as RevealCtor;
      if (!isMounted || !containerRef.current) return;
      const deck = new Reveal(containerRef.current, {
        embedded: true,
        hash: false,
        controls: true,
        progress: true,
        slideNumber: "c/t",
        keyboard: true,
        touch: true,
        history: false,
        center: false,
        transition: "slide",
        width: 1280,
        height: 720,
        margin: 0.06,
        minScale: 0.2,
        maxScale: 2.0,
      });
      await deck.initialize();
      if (isMounted) deckRef.current = deck;
    })();

    return () => {
      isMounted = false;
      if (deckRef.current) {
        try {
          deckRef.current.destroy();
        } catch {
          // reveal.js occasionally throws during unmount; non-fatal
        }
        deckRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`reveal aispeg-deck ${className}`}
    >
      <div className="slides">{children}</div>
    </div>
  );
}
