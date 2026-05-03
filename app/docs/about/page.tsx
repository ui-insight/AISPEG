import { redirect } from "next/navigation";

// /docs/about was a 158-line developer-facing "what this site is" doc that
// duplicated the user-facing /about page. The user-facing version (built
// before Sprint 4) is the canonical institutional framing; keeping a second
// version in /docs forced both to stay in sync and they had already drifted
// (e.g. /docs/about referenced retired "decks" Reports content and stale
// Sprint 2-4 milestones). Closes #98 with the simpler answer: redirect.

export default function DocsAboutRedirect() {
  redirect("/about");
}
