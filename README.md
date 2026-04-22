# AISPEG — AI Strategic Plan Execution Group

An interactive website for the **AI Strategic Plan Execution Group** at the University of Idaho. AISPEG is a Presidentially-chartered cross-cutting initiative (chaired by Ben Hunter, Dean of the Libraries) supporting execution of the University's Strategic Plan. The site maintains a growing inventory of AI interventions for operational excellence across UI units.

This site is designed to be **built and maintained collaboratively using agentic coding tools** (Claude Code, Cursor, GitHub Copilot, etc.). Any team member with an agentic tool can add content, modify pages, and evolve the site.

## Quick Start

```bash
git clone https://github.com/ui-insight/AISPEG.git
cd AISPEG
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Framework | Next.js 16 (App Router)             |
| Styling   | Tailwind CSS v4                     |
| Language  | TypeScript                          |
| Package   | npm                                 |

## Project Structure

```
app/                # Next.js App Router pages
  layout.tsx        # Root layout with sidebar navigation
  page.tsx          # Home / Dashboard
  principles/       # Strategic Principles
  lessons/          # Lessons Learned
  playbook/         # Agent Playbook
  projects/         # Projects & Metrics
  knowledge/        # Knowledge Base (searchable)
  roadmap/          # Planning & Roadmap
components/         # Reusable React components
lib/
  data.ts           # All structured data (single source of truth)
content/            # MDX content files (future use)
```

## Key Pages

| Route          | Description                                              |
|----------------|----------------------------------------------------------|
| `/`            | Dashboard with key metrics and strategic overview        |
| `/principles`  | Expandable cards for each strategic principle            |
| `/lessons`     | Lessons from repo-scale multi-agent collaboration        |
| `/playbook`    | Agent orchestrator role and development guidelines       |
| `/projects`    | Sortable project metrics table with effort estimates     |
| `/knowledge`   | Searchable knowledge base with tag filtering             |
| `/roadmap`     | Phased roadmap with timeline visualization               |

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for a detailed guide on how to add content and collaborate using agentic coding tools.

## For Agentic Tools

The **[CLAUDE.md](CLAUDE.md)** file contains project conventions and instructions specifically for AI coding agents. Point your agent at this file when starting work on the project.

## Commands

```bash
npm run dev    # Start development server
npm run build  # Production build (use to verify changes)
npm run lint   # Run ESLint
```

## University of Idaho Branding

The site uses U of I institutional colors:
- **Gold**: `#B5A36A`
- **Black**: `#000000`
- **Charcoal**: `#1a1a2e`

These are defined as custom theme tokens in `app/globals.css` and referenced throughout as `ui-gold`, `ui-charcoal`, etc.
