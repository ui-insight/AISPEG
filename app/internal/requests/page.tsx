import { redirect } from "next/navigation";

// The unified request queue went public on 2026-07-24: the site tells
// one story with no public/internal split (portfolio owner's call —
// the site is the primary organization and communication tool for the
// institutional AI inventory). /portfolio/pipeline is the canonical
// all-origin queue per ADR 0005; this redirect keeps existing inbound
// links working.

export default function InternalRequestsRedirect() {
  redirect("/portfolio/pipeline");
}
