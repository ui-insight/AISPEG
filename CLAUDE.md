# Institutional AI Initiative — Agent Collaboration Guide

## Project Overview
Interactive website for the University of Idaho's institutional AI initiative, coordinated by IIDS (Institute for Interdisciplinary Data Sciences, which runs MindRouter and DGX Stack). The site maintains a growing inventory of AI interventions across UI units — some built by IIDS, others led by partner units, plus tools from the AI4RA partnership (UI + Southern Utah University NSF GRANTED, producing OpenERA, Vandalizer, MindRouter, ProcessMapping) that UI deploys institutionally. Built with Next.js (App Router), Tailwind CSS v4, and TypeScript.

The repository name and infrastructure identifiers (URLs, container names, database) carry the legacy `aispeg` slug from the project's origin as an AI Strategic Plan Execution Group collaboration site. The AISPEG group is dormant; user-facing surfaces have been rewritten to drop AISPEG branding and present the site as IIDS-coordinated. See `REFACTOR.md` at the project root for the May 2026 refactor history.

## Design Context

Design direction for this project is defined in [`.impeccable.md`](./.impeccable.md)
at the project root. Read it before any visual/design work. Key principles at a glance:

1. **Every claim names a human** — owner-names and home-units are load-bearing UI.
2. **Restraint over decoration** — no gold stripe on every card, no gradient text, no
   glassmorphism, no bouncy motion. Gold is reserved for emphasis.
3. **Density with hierarchy** — stakeholders scan, practitioners read detail. Serve
   both with a steep type hierarchy (≥1.25× ratio between steps).
4. **Light surfaces, charcoal ink, gold sparingly** — surface dominance is near-white
   with neutrals tinted subtly toward gold. The deck (reveal.js) is the exception — dark,
   stage-optimized.
5. **The site demonstrates what it argues** — evidence-forward, owner-named; no
   decorative "trust us" flourishes.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (using `@import "tailwindcss"` and `@theme` for custom colors)
- **Language**: TypeScript
- **Package Manager**: npm

## Project Structure
```
app/               # Next.js App Router pages
  layout.tsx       # Root layout with Sidebar
  page.tsx         # Home / Dashboard
  principles/     # Strategic Principles page
  lessons/        # Lessons Learned page
  playbook/       # Agent Playbook page
  projects/       # Projects & Metrics page
  knowledge/      # Knowledge Base (searchable)
  roadmap/        # Planning & Roadmap page
components/        # Reusable React components
  Sidebar.tsx     # Navigation sidebar
  MetricCard.tsx  # Metric display card
  PrincipleCard.tsx # Expandable principle card
  LessonCard.tsx  # Lesson learned card
  ProjectTable.tsx # Sortable project metrics table
lib/               # Data and utilities
  data.ts         # All static data (metrics, principles, lessons, etc.)
content/           # MDX content files (future use)
  principles/
  lessons/
  playbook/
  knowledge/
```

## Key Conventions
- University of Idaho colors: Gold `#B5A36A`, Black `#000000`, Charcoal `#1a1a2e`
- Custom theme colors defined in `app/globals.css` via `@theme {}`
- All structured data lives in `lib/data.ts`
- Components are client-side (`"use client"`) only when they need interactivity
- Pages are server components by default

## Adding Content
1. Add data to `lib/data.ts` following existing patterns
2. Content files can be added to `content/` directories as MDX (future MDX loader)
3. Use existing components (MetricCard, PrincipleCard, LessonCard) in new pages

## Development Commands
```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Run ESLint
```

## Deployment

### Remote Server
- **Host**: `devops@openera.insight.uidaho.edu`
- **Networking**: Use `10.x.x.x` address space (not Docker default `172.x.x.x`)

### Port Mapping Table (All Insight Apps)
| URL | Port |
|---|---|
| https://openera.insight.uidaho.edu | 9200 |
| https://openera-dev.insight.uidaho.edu | 9210 |
| https://strategicplan.insight.uidaho.edu | 9220 |
| https://strategicplan-dev.insight.uidaho.edu | 9230 |
| https://processmapping.insight.uidaho.edu | 9240 |
| https://processmapping-dev.insight.uidaho.edu | 9250 |
| **https://aispeg.insight.uidaho.edu** | **9260** |
| **https://aispeg-dev.insight.uidaho.edu** | **9270** |
| https://ucmnews.insight.uidaho.edu | 9280 |
| https://ucmnews-dev.insight.uidaho.edu | 9290 |

### Deploy Commands
```bash
# Deploy production (port 9260)
docker compose --profile prod up -d --build

# Deploy dev (port 9270)
docker compose --profile dev up -d --build

# View logs
docker compose --profile prod logs -f
docker compose --profile dev logs -f

# Stop
docker compose --profile prod down
docker compose --profile dev down
```

### Deploy via Claude Code
```
Deploy AISPEG in prod using docker on the remote server accessible via devops@openera.insight.uidaho.edu. Map it to host port 9260. Because of routing conflicts, use 10.x.x.x address space, not the docker default 172.x.x.x address space.
```
Replace `prod` / `9260` with `dev` / `9270` for the dev deployment.
