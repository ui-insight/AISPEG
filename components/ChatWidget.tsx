"use client";

// ChatWidget — Slice #108 of Epic #107.
//
// Floating chat button + panel that hits POST /api/ask. Keeps a single
// in-memory conversation thread (closing the panel preserves it; full
// page reload drops it — persistence is Slice #111).
//
// Streaming, markdown rendering, and richer mobile polish are all
// explicitly Slice #111 — this widget renders the response as plain
// text with auto-linked URLs for the inline citations.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Citation {
  tool: string;
  url: string;
  label?: string;
}

interface AssistantTurn {
  role: "assistant";
  content: string;
  citations: Citation[];
}

interface UserTurn {
  role: "user";
  content: string;
}

type Turn = AssistantTurn | UserTurn;

interface AskResponse {
  response: string;
  citations: Citation[];
  toolCalls: { name: string }[];
}

interface AskError {
  error: string;
  unconfigured?: boolean;
}

function isInternalUrl(url: string): boolean {
  return url.startsWith("/");
}

// Render the assistant text. The agent already weaves markdown links —
// `[Label](/url)` — into responses; we parse those and render real
// anchors so users can click. Plain text passes through unchanged.
const MD_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderAssistantText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;
  while ((match = MD_LINK.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const [, label, url] = match;
    parts.push(
      isInternalUrl(url!) ? (
        <Link
          key={`md-${keyCounter++}`}
          href={url!}
          className="text-brand-clearwater underline decoration-brand-clearwater underline-offset-2 hover:decoration-2"
        >
          {label}
        </Link>
      ) : (
        <a
          key={`md-${keyCounter++}`}
          href={url!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-clearwater underline decoration-brand-clearwater underline-offset-2 hover:decoration-2"
        >
          {label}
        </a>
      )
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

// Inline citation pill — the agent's citations array often contains the
// canonical URL the model already linked, so we de-dupe before rendering.
function CitationPill({ c }: { c: Citation }) {
  const label = c.label ?? c.url;
  if (isInternalUrl(c.url)) {
    return (
      <Link
        href={c.url}
        className="inline-flex items-center rounded-sm border border-hairline bg-surface-alt px-2 py-0.5 text-xs text-ink-muted transition-colors hover:border-brand-clearwater hover:text-brand-clearwater"
      >
        {label}
      </Link>
    );
  }
  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-sm border border-hairline bg-surface-alt px-2 py-0.5 text-xs text-ink-muted transition-colors hover:border-brand-clearwater hover:text-brand-clearwater"
    >
      {label}
    </a>
  );
}

function dedupeCitations(cites: Citation[], inlineText: string): Citation[] {
  // Drop pills for URLs the model already inlined as a markdown link.
  const inlinedUrls = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(MD_LINK.source, "g");
  while ((m = re.exec(inlineText)) !== null) {
    inlinedUrls.add(m[2]!);
  }
  const seen = new Set<string>();
  return cites.filter((c) => {
    if (inlinedUrls.has(c.url)) return false;
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });
}

function ChatIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.21 0-2.36-.21-3.41-.6L3 21l1.6-4.59C3.6 15.36 3 13.74 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M13 6l6 6-6 6"
      />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the latest turn in view as new messages stream in.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, pending]);

  // Focus the input each time the panel opens.
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function send() {
    const message = draft.trim();
    if (!message || pending) return;
    setError(null);
    setDraft("");
    const nextTurns: Turn[] = [...turns, { role: "user", content: message }];
    setTurns(nextTurns);
    setPending(true);
    try {
      const history = nextTurns.slice(0, -1).map((t) => ({
        role: t.role,
        content: t.content,
      }));
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const body = (await res.json()) as AskResponse | AskError;
      if (!res.ok || "error" in body) {
        const errMsg =
          ("error" in body && body.error) ||
          `Request failed (HTTP ${res.status})`;
        setError(errMsg);
        return;
      }
      setTurns([
        ...nextTurns,
        {
          role: "assistant",
          content: body.response,
          citations: body.citations ?? [],
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Network error reaching the agent";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[min(380px,calc(100vw-2rem))] max-h-[min(70vh,640px)] flex-col rounded-md border border-hairline bg-surface shadow-2xl"
          role="dialog"
          aria-label="IIDS site assistant"
        >
          <header className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                IIDS Assistant
              </p>
              <p className="text-sm font-semibold text-ink">
                Ask about projects, standards, or reports
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-sm p-1 text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
              aria-label="Close assistant"
            >
              <CloseIcon />
            </button>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {turns.length === 0 && !pending && (
              <div className="space-y-3 text-sm text-ink-muted">
                <p>
                  I answer questions grounded in this site&apos;s data
                  &mdash; the live project portfolio, standards ledger,
                  reports timeline, and strategic-plan alignment.
                </p>
                <p className="text-xs">
                  Try: <em>What projects is IIDS working on?</em> or{" "}
                  <em>What&apos;s the status of MindRouter?</em>
                </p>
              </div>
            )}

            <ul className="space-y-4">
              {turns.map((t, i) =>
                t.role === "user" ? (
                  <li key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-md bg-surface-alt px-3 py-2 text-sm text-ink">
                      {t.content}
                    </div>
                  </li>
                ) : (
                  <li key={i} className="space-y-2">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                      {renderAssistantText(t.content)}
                    </div>
                    {(() => {
                      const pills = dedupeCitations(t.citations, t.content);
                      return pills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {pills.map((c, j) => (
                            <CitationPill key={`${c.url}-${j}`} c={c} />
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </li>
                )
              )}

              {pending && (
                <li className="flex items-center gap-2 text-sm text-ink-muted">
                  <span className="inline-flex gap-1" aria-label="Thinking">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-subtle [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-subtle [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-subtle" />
                  </span>
                  <span>Looking that up&hellip;</span>
                </li>
              )}

              {error && (
                <li className="rounded-md border border-hairline bg-surface-alt px-3 py-2 text-xs text-ink-muted">
                  <span className="font-semibold text-ink">
                    Couldn&apos;t reach the assistant.
                  </span>{" "}
                  {error}
                </li>
              )}
            </ul>
          </div>

          <form
            className="flex items-end gap-2 border-t border-hairline px-3 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask a question…"
              disabled={pending}
              className="min-h-[40px] max-h-32 flex-1 resize-none rounded-sm border border-hairline bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending || draft.trim().length === 0}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-sm bg-ui-charcoal px-3 text-sm font-semibold text-brand-white transition-colors hover:bg-brand-huckleberry disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ui-charcoal text-brand-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-huckleberry focus:outline-none focus:ring-2 focus:ring-ui-gold focus:ring-offset-2"
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
}
