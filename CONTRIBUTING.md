# Contributing with Agentic Coding Tools

This guide explains how to add content and features to the
**Institutional AI Initiative** site (an IIDS-coordinated coordination
nexus for the University of Idaho's institutional AI work) using agentic
coding tools like **Claude Code**, **Codex**, **Cursor**, **GitHub
Copilot**, or any LLM-powered coding assistant.

The site was built collaboratively this way and is designed to keep working
that way.

> Before you make non-trivial changes: read [`REFACTOR.md`](./REFACTOR.md)
> for the strategic context and current sprint state, and
> [`CLAUDE.md`](./CLAUDE.md) for project conventions and the IA.

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **Git**
- **PostgreSQL 16** (local or via Docker) for any work touching submissions,
  registry, or similarity
- An **agentic coding tool** of your choice

---

## Getting started

```bash
git clone https://github.com/ui-insight/AISPEG.git
cd AISPEG
cp .env.example .env.local   # then fill in DATABASE_URL and optional GITHUB_TOKEN
npm install
npm run dev
```

The site runs at <http://localhost:3000>.

> **Tip for agentic tools**: at the start of a session, point your agent at
> [`CLAUDE.md`](./CLAUDE.md) and [`REFACTOR.md`](./REFACTOR.md). Together
> they cover project structure, conventions, the five-surface IA, the
> friction-ledger model, and the sprint sequencing.

---

## How the site works

### Five primary surfaces

| Surface | Route | Source of truth |
|---|---|---|
| Projects | `/portfolio` | Postgres `applications` (read via `lib/work.ts`); `lib/portfolio.ts` is the typed seed source. Two-tier filter (public stage → operational status) per [ADR 0001](./docs/adr/0001-product-lifecycle-taxonomy.md). |
| Explore | `/explore` | `lib/work-categories.ts` (taxonomy) + `lib/portfolio.ts` (counts) — by-problem axis. |
| Submit a Project | `/builder-guide` | `lib/builder-guide-data.ts` (quiz) + Postgres `submissions` (responses); status page at `/intake/[token]`. |
| Reports | `/reports` | `lib/artifacts.ts` (unified timeline) + per-report routes |
| Standards | `/standards` | `lib/standards-watch.ts`; sub-nav surfaces `/standards/data-model` and `/standards/strategic-plan`. |

Plus `/ai4ra-ecosystem`, `/about`, `/internal` (auth-gated),
`/docs/*`, `/admin/*`. See [`CLAUDE.md`](./CLAUDE.md) for the full
route inventory and what's been archived.

### Typed data modules over JSON blobs

Most structured data lives in typed TypeScript modules so the build
catches schema drift:

- `lib/portfolio.ts` — projects inventory (seed source; runtime via Postgres)
- `lib/standards-watch.ts` — standards ledger
- `lib/builder-guide-data.ts` — quiz, scoring, tiers
- `lib/artifacts.ts` — unified Reports timeline (briefs, activity reports, external talks)
- `lib/intake-config.ts` — Submit-a-Project named human + SLA + status labels

Per-page data that backs only one route lives next to the page (e.g.
`app/reports/feb-2026/data.ts`), not in `lib/`. Reserve `lib/` for data
shared across surfaces.

### Server vs client components

- Pages are **server components** by default (no `"use client"`).
- Components needing `useState`, `useEffect`, or event handlers use
  `"use client"` (`Sidebar.tsx`, the builder-guide wizard).
- Don't reach for `"use client"` reflexively — server components keep
  bundles small and let Next render on the server.

### Data architecture intent (Sprint 2+)

The post-refactor data model:

- **Postgres `applications` table** is canonical for project identity,
  classification, and provenance.
- **ClickUp** is canonical for project status, blockers, and daily
  workflow. Each ClickUp task references an `applications.id`; each
  `applications` row has a `clickup_task_id`. Sync runs on a cron.
- **GitHub issues** drive technical work and are surfaced via
  `lib/github.ts`.
- **Markdown / typed TS** drives narrative content (decks, About copy,
  standards ledger).

Sprint 1 has not yet wired ClickUp; Sprint 2's Migration 005 adds the
friction-ledger fields and a `blockers` table. Until then, status data is
hand-maintained in `lib/portfolio.ts`.

---

## Common tasks

### Adding a project to the portfolio

Open `lib/portfolio.ts` and append a new entry to the `projects`
array. The shape is defined in the same file. Required fields include
`slug`, `name`, `tagline`, `description`, `homeUnits`,
`operationalOwners`, `buildParticipants`, `status`, `visibility`, and
`ai4raRelationship`. Use existing entries as templates.

```ts
{
  slug: "my-new-project",
  name: "My New Project",
  tagline: "One-line elevator pitch.",
  description: "Longer description shown on the detail page.",
  homeUnits: ["Office of the Provost"],
  operationalOwners: [
    { name: "Pat Owner", title: "Director of Something" },
  ],
  buildParticipants: ["IIDS"],
  status: "piloting",        // ADR 0001 operational state — see below
  visibility: "Public",      // see "Visibility tier" below
  ai4raRelationship: "None", // see "AI4RA relationship" below
  tags: ["diffusion"],       // optional; see "Tag vocabulary" below
  workCategories: ["..."],   // typed category slugs from lib/work-categories.ts
  iidsSponsor: "Name",       // ADR 0001 — required to claim approved+
  // ...plus the ADR 0001 status-specific fields (pilotCohort,
  //    productionScope, supportContact, sunsetDate, replacedBy, etc.)
  //    and optional: funding, externalDeployments, links,
  //    strategicPlanAlignment (priority codes per ADR 0002).
},
```

The portfolio page automatically picks up the new entry, groups it under
its home unit, and filters by visibility tier.

### IIDS curator decision guidance

The portfolio is the institution's representation of itself; keeping it
honest is more important than keeping it tidy. The rules below codify
the editorial decisions that shape what shows up where.

#### Visibility tier

- **`Public`** — default for anything UI is OK to talk about externally.
  Owner-named, status-named, links visible. Use this when external
  comms have aligned and the deployment is something we'd cite in a
  brief.
- **`Partial`** — UI deployment exists but specific operational details
  (pilot scope, participant identities, configuration) are embargoed.
  The project shows on `/portfolio` with a *"deployment details
  embargoed"* notice. Use when the underlying work is sensitive, in
  negotiation, or pending public communications.
- **`Internal-only`** — not visible on public `/portfolio` at all; only
  on `/internal` (auth-gated). Use when even the existence of the work
  shouldn't appear publicly yet.

**When in doubt:** start at `Partial` and revise to `Public` once
external comms align. Do not start at `Internal-only` unless the
existence of the work is itself sensitive.

#### Status transitions

The status taxonomy is defined and enforced by
[ADR 0001 — Product Lifecycle Taxonomy](./docs/adr/0001-product-lifecycle-taxonomy.md).
The lifecycle has two layers:

- **Operational ladder** (9 states + `tracked` meta): `idea`,
  `approved`, `building`, `prototype`, `piloting`, `production`,
  `maintained`, `sunsetting`, `archived`, plus `tracked` for
  partner-unit-led work IIDS coordinates around.
- **Public stage rollup** (5 buckets) — `exploring`, `building`,
  `live`, `retired`, `tracked` — derived automatically from the
  operational state. Stakeholders see the public stage; IIDS sees the
  operational state as a secondary chip.

Each operational state has a **measurable verification rule** (e.g.
`production` requires either a public `liveUrl` reachable beyond the
pilot or a public `repoUrl` where the repo itself is the deliverable,
plus `productionScope` and `supportContact`). `npm run verify:portfolio`
enforces the rules in CI; run it locally before pushing.

For the full rule table, the schema fields each state requires, and
the rationale, read [ADR 0001](./docs/adr/0001-product-lifecycle-taxonomy.md)
in full before changing a project's `status`.

**The bar for `tracked`**: IIDS is aware of the work, the home unit
owns it, IIDS may have advised but did not build. Always pair with
`buildParticipants` that does *not* list IIDS, and set
`trackingOnly: true`.

#### `homeUnits` vs `buildParticipants`

- **`homeUnits`** — the UI organizational unit(s) whose operations the
  project serves. *Whose work depends on this.* Always at least
  one entry. Multiple entries when a project serves more than
  one unit (rare).
- **`buildParticipants`** — who actually built (or builds) the thing.
  Almost always includes `"IIDS"` for IIDS-built work; lists
  partner-unit teams for co-built work. For partner-unit-led `Tracked`
  work, may not include IIDS at all.
- **Example:** UCM Daily Register — `homeUnits:
  ["University Communications and Marketing"]`, `buildParticipants:
  ["UCM"]`, `status: "Tracked"`. IIDS coordinates; UCM owns and builds.

#### AI4RA relationship

- **`Core`** — *dual-destiny* project: an AI4RA open-source release
  maintained for the partnership AND a UI deployment in the
  institutional portfolio (Vandalizer, OpenERA, MindRouter,
  ProcessMapping). Pair with `dualDestinyPlanned: true` if the
  OSS+UI plan is on file.
- **`Adjacent`** — related to AI4RA aims but not formally part of the
  partnership.
- **`Reference`** — the UI deployment consumes an AI4RA spec or tool
  but isn't itself dual-destiny.
- **`UI-parallel`** — UI work running alongside AI4RA work.
- **`None`** — no AI4RA connection. Default.

#### Tag vocabulary

`tags` is currently a free `string[]` used for situational flags. The
known active values:

- **`"diffusion"`** — the project is a *capability diffusion*
  case: a non-IIDS UI unit is co-building, not just consuming. Renders
  the *"Capability diffusion"* chip on `/portfolio`.

Category tagging now lives in a typed `workCategories` field on each
project (sourced from `lib/work-categories.ts`); the by-problem
explore axis ([epic #154](https://github.com/ui-insight/AISPEG/issues/154))
shipped via PRs #158-163. `tags` retains its ad-hoc usage for
situational flags only. **Don't invent new ad-hoc tags** — promote
the concept into `workCategories` (with a header-comment-driven
add/rename/retire flow) or open a new issue.

#### Freshness expectations

The portfolio is only useful if it's current. The rules:

- **At commit time** — when a project's *status*, *operational
  owner*, *home unit*, or *scope* changes in real life, update
  `lib/portfolio.ts` in the same week. The git log is the audit
  trail.
- **At least quarterly** — IIDS reviews the full inventory and
  confirms each entry is still accurate. Stale entries get a status
  update or move to `Archived`. (A scheduled agent or a calendar
  reminder is fine; either way, there is a recurring eye on this.)
- **For partner-unit `Tracked` work** — confirm with the named
  operational owner annually that the entry is still current. The
  named-owner discipline is what makes the *"every claim names a
  human"* design principle real.

If a change to one of these fields would meaningfully change how a
Provost reads the portfolio, prefer to make the change *before*
external communications go out, not after.

### Adding a Standards ledger entry

Open `lib/standards-watch.ts` and append a new `StandardsWatchItem`. Each
entry is a commit-worthy event — the git log is the audit trail. Set
`dateRequested` to the actual date OIT was formally asked for the
standard, and start with `status: "requested"`.

When OIT responds, edit the entry's `status` and add `responseUrl` /
`responseNote` as appropriate. Don't delete entries — published standards
keep their history visible.

### Adding a report, brief, or presentation

The Reports surface is a single reverse-chronological timeline. To add an
artifact:

1. Append an entry to `lib/artifacts.ts` with the appropriate `kind`
   (`activity-report` | `brief` | `presentation`), `dateIso`, `dateLabel`,
   and `href` (internal route or external URL).
2. If the artifact has its own page (most reports and briefs do), create
   `app/reports/<slug>/page.tsx`.
3. For an external talk or deck hosted elsewhere, use
   `kind: "presentation"`, `external: true`, and point `href` at the
   hosted URL.
4. Set `featured: true` to give the artifact the hero spot on /reports
   (most-recent featured wins).

### Adding a new top-level route

The IA is intentionally narrow (5 primary surfaces). Adding a new
top-level route should be a deliberate choice — discuss in
`REFACTOR.md` or open an issue first.

If approved:

1. Create `app/<route>/page.tsx`.
2. Add the entry to `primaryItems` (or `footerItems`) in
   `components/Sidebar.tsx`. Existing icons (each used by exactly one
   entry): `house` (Home), `grid` (Projects), `compass` (Submit a
   Project), `shield` (Standards), `document` (Reports), `book` (About).
   **Each sidebar entry uses a distinct icon** — adding a new entry
   means adding a new glyph to `NavIcon`, not reusing an existing one.
3. Apply the page-heading-and-eyebrow rule documented in
   `.impeccable.md` — the H1 must thread the sidebar label (Form A: H1
   matches verbatim; Form B: declarative H1 with the sidebar label as
   the eyebrow).
4. Verify with `npm run build`.

### Adding to the documentation surface

Pages under `app/docs/` use the `DocPage` and `DocCard` components from
`components/DocPage.tsx`. Add a new doc by creating
`app/docs/<topic>/page.tsx` and (optionally) linking to it from the docs
index.

---

## Workflow

### For solo work (direct to main)

```
1. Pull latest:    git pull origin main
2. Make changes:   (edit with your agentic tool)
3. Verify:         npm run build && npm run lint
4. Commit & push:  git add <files>
                   git commit -m "imperative-mood subject"
                   git push
```

### For collaborative or substantive work (branch + PR)

```
1. Create branch:  git checkout -b feature/your-feature
2. Make changes
3. Verify:         npm run build && npm run lint
4. Commit & push:  git push -u origin feature/your-feature
5. Open PR:        gh pr create --title "..." --body "..."
```

**Always run `npm run build` before committing.** It's the primary
TypeScript check and catches drift between data shapes and components.

For the May 2026 refactor itself, work is happening in **per-sprint PRs**
off `main` (see `REFACTOR.md`). If you're contributing during the
refactor window, sync with whoever's running the active sprint before
opening a parallel PR.

---

## Tips for agentic tools

### Starting a session

Give your agent the strategic context first. A good opening:

> Read `REFACTOR.md` and `CLAUDE.md` to understand the project. This is a
> Next.js 16 site that's the coordination nexus for the University of
> Idaho's institutional AI initiative, operated by IIDS. We're mid-refactor
> from a legacy AISPEG-collaboration framing. The IA is five surfaces:
> Projects, Explore, Submit a Project, Reports, Standards. Run
> `npm run build` to verify changes.

### Effective prompt patterns

**Adding content:**
> "Add a new project to `lib/portfolio.ts`: [name], owned by [unit],
> built by IIDS. Use the existing entry shape. Visibility: Public."

**Modifying a page:**
> "Update `app/portfolio/page.tsx` so the home-unit groups are
> alphabetical. Don't change the data."

**New feature:**
> "Add a `/standards/[id]` permalink that opens directly to the relevant
> entry on the standards page. Read `lib/standards-watch.ts` first."

**Verification:**
> "Run `npm run build` and `npm run lint`, fix any errors."

### What your agent needs to know

- `REFACTOR.md` and `CLAUDE.md` are the primary orientation docs.
- Typed `lib/*.ts` modules are the source of truth for cross-surface
  content. Per-page data lives next to the page (e.g.
  `app/reports/<slug>/data.ts`).
- Tailwind tokens: `ui-charcoal`, `ui-gold`, `ui-gold-dark`,
  `brand-huckleberry`, `brand-lupine`. No raw hex in components.
- `npm run build` must pass before committing.
- The site is mid-refactor; legacy routes were cut for cause in the May
  2026 refactor and should not be reintroduced without checking
  `REFACTOR.md`.

### Common pitfalls

- **Don't put route-specific data in `lib/`** — colocate it with the page
  that consumes it (e.g. `app/reports/<slug>/data.ts`). Reserve `lib/`
  for content shared across surfaces.
- **Don't reach for `"use client"`** unless a component genuinely needs
  client-side state or events.
- **Don't reintroduce cut routes** (`/knowledge`, `/cautionary-tales`,
  `/roadmap`, `/outreach`, `/action-plan`, `/approach`) — they were cut
  for cause; check `REFACTOR.md` before touching them.
- **Don't editorialize on user-facing surfaces** — the design principle is
  evidence-forward (status fields, day counters, owner names) over
  forcing-function rhetoric.
- **Don't add AISPEG branding to new copy.** The repo name is historical;
  user-facing surfaces are IIDS-coordinated.

---

## Style guide

For the full design context (audience, brand personality, anti-references,
type system rationale), see [`.impeccable.md`](./.impeccable.md). The page
heading + eyebrow rule and the eyebrow-color-by-surface rule both live
there and are mandatory reading before any visual change.

### Brand colors (canonical)

Defined in `app/globals.css` via `@theme {}`. Use the Tailwind tokens, not
raw hex. The site has been migrating from `ui-*` legacy aliases to
`brand-*` tokens; **prefer `brand-*` in new code**. Legacy aliases still
work and are retained for the existing surfaces.

| Token | Hex | Usage |
|---|---|---|
| `brand-gold` (Pride Gold) | `#F1B300` | Primary CTA buttons, focus outlines, sidebar active state. **Rare** — at most one focal moment per surface. |
| `brand-gold-dark` | `#C58F00` | Hover state on the gold CTA. |
| `brand-black` (Brand Black) | `#191919` | Body ink, headings (weight 900 enforced by `@layer base`), dark surfaces, sidebar background. |
| `brand-silver` | `#808080` | All eyebrows (uppercase tracking-wider labels above H1/H2). |
| `ink-muted` | `#595959` | Secondary body text — paragraphs subordinate to the main claim. |
| `ink-subtle` | `#8a8a8a` | Meta / captions / hairline-importance text. |
| `hairline` | `#E5E5E2` | Card borders, list dividers. |
| `surface-alt` | `#FAFAF8` | Subtle off-white for chips, callouts, neutral panels. |
| `brand-huckleberry` | `#261882` | Section accents, *"Tracked"* status chips. |
| `brand-lupine` | `#5E48FF` | AI4RA chips. |
| `brand-clearwater` | `#008080` | Link underline color, *"Capability diffusion"* / activity-report kind chips, domain-accent eyebrows on data-model pages. |

**Pride Gold is rare.** Never apply it as wallpaper (e.g., gold border on
every card). Reserve for primary CTAs, active focus, sidebar active state,
the highlight behind one or two emphasis words on a page, and the rare
on-dark hero accent.

### Typography

Single family: **Public Sans**, variable weight 100–900 (loaded via
`next/font/google` in `app/layout.tsx`). Use weight contrast for
hierarchy:

- Display headings: weight 900 (auto-applied to `main h1`–`h4` via
  `@layer base` in `globals.css`)
- Body: weight 400
- Emphasis: weight 600–700
- Italic axis: used sparingly for owner names and emphasis

No display serif pairing. The brand is sans-only.

### Component conventions

- **Cards**: `rounded-xl border border-hairline bg-white p-{5,6,8} shadow-sm`. Default `p-6`; `p-5` for secondary tiles, `p-8` for the focal hero tile.
- **Card hover**: `transition-shadow hover:shadow-md`. **Do not** apply gold border on hover (this pattern was swept out in PR #124). **Do not** change H2 color on hover — the whole card is the click target; the title doesn't need to "look like a link."
- **Status chips**: `rounded-full px-2.5 py-0.5 text-xs font-medium`. Default neutral: `bg-surface-alt border border-hairline text-brand-black`. Use brand secondary colors only for category accents that carry meaning.
- **Eyebrows** (uppercase labels above headings): `text-xs font-medium uppercase tracking-wider`. Color varies by surface — `brand-silver` on light, `brand-black/70` on saturated, `white/60` on dark. Documented in `.impeccable.md`.
- **Section spacing on pages**: `space-y-10` (default).
- **Headings**: weight 900 is enforced globally for `main h1`–`h4` via `@layer base`. Do not redeclare `font-black` on every heading; do explicitly set the size class (e.g., `text-4xl`, `text-2xl`). Page H1 is typically `text-3xl font-black leading-tight sm:text-4xl`. Card H2 is `text-2xl`. The component-level `font-black` on the page H1 is intentional belt-and-suspenders against the cascade getting refactored out.

### File naming

- Pages: `app/<route>/page.tsx`
- Components: `components/PascalCase.tsx`
- Library modules: `lib/kebab-case.ts`
- IDs in data: `kebab-case` strings

---

## Where to ask for help

For project context (why a thing is the way it is): start with
`REFACTOR.md` and `CLAUDE.md`. For technical specifics: see
[`/docs`](http://localhost:3000/docs) on the running site. For anything
else: ping the IIDS team through the usual UI channels.
