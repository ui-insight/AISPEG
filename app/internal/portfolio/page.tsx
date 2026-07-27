import { redirect } from "next/navigation";

// The internal portfolio view was retired on 2026-07-27. It rendered the
// same inventory as /portfolio — no project has ever carried the
// `Internal-only` visibility tier, so the extra tier in its query matched
// nothing — and its only exclusive content was auto-derived placeholder
// blocker text. That made it a second view of the inventory, which the
// one-story directive rules out (ADR 0005 amendment, 2026-07-24, extended
// 2026-07-27).
//
// The `audience: "internal"` seam in lib/work.ts stays. If genuinely
// sensitive blocker detail is ever authored, the query path back is
// intact — but restoring a separate surface needs a deliberate decision,
// not a page that quietly persisted.
//
// proxy.ts redirects this prefix before the auth gate; this handler is
// the belt-and-braces copy, matching /internal/requests.

export default function InternalPortfolioRedirect() {
  redirect("/portfolio");
}
