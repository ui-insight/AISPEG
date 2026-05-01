import { redirect } from "next/navigation";

// /presentations was the standalone reveal.js deck index. As of Sprint 4
// the Reports surface is the unified timeline for every public artifact —
// briefs, activity reports, decks, and external presentations all listed
// together in lib/artifacts.ts. This redirect keeps any existing inbound
// links working.

export default function PresentationsRedirect() {
  redirect("/reports");
}
