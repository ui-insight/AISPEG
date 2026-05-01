# `_archive/`

Routes and library files removed from the active site during the May 2026
refactor. Preserved here for one release cycle so content can be selectively
salvaged into the new About page or Reports surface during Sprint 4. This
directory is **not** wired into Next.js routing — these files are inert.

Slated for deletion in Sprint 4 once salvage is complete. See `REFACTOR.md`
at the project root for context.

## Contents

- `app-routes/knowledge` — wiki-style knowledge base. Cut: not load-bearing
  for the new outward-accountability purpose.
- `app-routes/cautionary-tales` — AISPEG-era warning page. Cut as a route;
  individual tales may move into Reports.
- `app-routes/roadmap` — strategic-plan-execution roadmap. Cut: per-project
  status on The Work replaces it.
- `app-routes/outreach` — events and workshop tracker. Cut: not load-bearing.
- `app-routes/action-plan` — action-item dashboard. Cut: the friction ledger
  on The Work replaces it in higher fidelity.
- `lib/action-plan.ts` — data for the action-plan route.
