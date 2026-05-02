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
> they cover project structure, conventions, the four-surface IA, the
> friction-ledger model, and the sprint sequencing.

---

## How the site works

### Four primary surfaces

| Surface | Route | Source of truth |
|---|---|---|
| The Work | `/portfolio` | `lib/portfolio.ts` |
| Submit a Project | `/builder-guide` | `lib/builder-guide-data.ts` (quiz) + Postgres `submissions` (responses) |
| Reports | `/reports` | `lib/artifacts.ts` (unified timeline) + per-report routes |
| Standards | `/standards` | `lib/standards-watch.ts` |

Plus `/ai4ra-ecosystem`, `/docs/*`, `/admin/*`. See
[`CLAUDE.md`](./CLAUDE.md) for the full route inventory and what's been
archived.

### Typed data modules over JSON blobs

Most structured data lives in typed TypeScript modules so the build
catches schema drift:

- `lib/portfolio.ts` — interventions inventory (seed source; runtime via Postgres)
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

### Adding an intervention to the portfolio

Open `lib/portfolio.ts` and append a new entry to the `interventions`
array. The shape is defined in the same file. Required fields include
`slug`, `name`, `tagline`, `description`, `homeUnits`,
`operationalOwners`, `buildParticipants`, `status`, `visibility`, and
`ai4raRelationship`. Use existing entries as templates.

```ts
{
  slug: "my-new-intervention",
  name: "My New Intervention",
  tagline: "One-line elevator pitch.",
  description: "Longer description shown on the detail page.",
  homeUnits: ["Office of the Provost"],
  operationalOwners: [
    { name: "Pat Owner", title: "Director of Something" },
  ],
  buildParticipants: ["IIDS"],
  status: "Piloting",        // Planned | Prototype | Piloting | Production | Tracked | Archived
  visibility: "Public",      // Public | Partial | Internal-only
  ai4raRelationship: "None", // None | Core | Adjacent
  tags: ["diffusion"],       // optional
  // ...optional fields: funding, externalDeployments, links, etc.
},
```

The portfolio page automatically picks up the new entry, groups it under
its home unit, and filters by visibility tier.

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

The IA is intentionally narrow (4 primary surfaces). Adding a new top-level
route should be a deliberate choice — discuss in `REFACTOR.md` first.

If approved:

1. Create `app/<route>/page.tsx`.
2. Add the entry to `primaryItems` (or `footerItems`) in
   `components/Sidebar.tsx`. Choose an icon from the existing set:
   `squares`, `grid`, `shield`, `compass`, `document`, `book`.
3. Verify with `npm run build`.

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
> from a legacy AISPEG-collaboration framing. The IA is four surfaces:
> The Work, Submit a Project, Reports, Standards. Run `npm run build` to
> verify changes.

### Effective prompt patterns

**Adding content:**
> "Add a new intervention to `lib/portfolio.ts`: [name], owned by [unit],
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

### Brand colors (canonical)

Defined in `app/globals.css` via `@theme {}`. Use the Tailwind tokens, not
raw hex.

| Token | Hex | Usage |
|---|---|---|
| `ui-gold` (Pride Gold) | `#F1B300` | Emphasis, focus outlines, highlight fills |
| `ui-gold-dark` | (computed) | Text on light backgrounds |
| `ui-charcoal` (Brand Black) | `#191919` | Headings, sidebar, dark blocks |
| `brand-huckleberry` | `#261882` | Section accents, status chips |
| `brand-lupine` | `#5E48FF` | Variety in deck slides |
| `brand-clearwater` | `#008080` | Link underlines |

Pride Gold is **rare**. Don't apply it to every card. Reserve for emphasis,
active focus, and the highlight behind one or two emphasis words on a page.

### Typography

Single family: **Public Sans**, variable weight 100–900 (loaded via
`next/font/google` in `app/layout.tsx`). Use weight contrast for hierarchy:

- Display headings: weight 900
- Body: weight 400
- Emphasis: weight 600–700
- Italic axis available for owner-name treatments and emphasis

No display serif pairing. The brand is sans-only.

### Component conventions

- Cards: `rounded-xl border border-gray-200 bg-white p-6 shadow-sm`
- Hover: `transition-all hover:border-ui-gold/40 hover:shadow-md`
- Status chips: `rounded-full px-2.5 py-0.5 text-xs font-medium`
- Section spacing on pages: `space-y-10` or `space-y-12`
- Headings: `h1` = `text-3xl font-black tracking-tight text-ui-charcoal`,
  `h2` = `text-xl font-bold text-ui-charcoal`

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
