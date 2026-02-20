# AISPEG Interactive Website — Implementation Plan

## Overview
A Next.js interactive website for the AI Strategic Planning & Evaluation Group (AISPEG) at UI. The site serves as a collaborative hub for planning, lessons learned, information aggregation, and knowledge sharing around agentic AI at the university. Designed so team members using agentic tools (Claude Code, etc.) can easily create content, modify pages, and evolve the site over time.

---

## Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Content**: MDX files (Markdown + JSX) — agent-friendly, easy to edit
- **Interactivity**: React components embedded in MDX
- **Package Manager**: npm

## Content Architecture (from PowerPoint themes)

### Main Sections / Pages

1. **Home / Dashboard**
   - Mission statement & overview of AISPEG
   - Quick links to all sections
   - Activity feed / recent updates
   - Key metrics display (from appendix data: 248 commits, 142K lines, 7 repos, 10-15x multiplier)

2. **Strategic Principles**
   - Content from slides 4-10, 16-19 organized as expandable cards
   - Topics: Core Institutional Principle, Jobs Changing, Demand Misconception, Force Multiplier, Workflow Redesign, Greenfield vs Brownfield, Start Small
   - Each principle has a discussion/notes area for team input

3. **Lessons Learned**
   - Content from slides 13-15 (Repo Lessons) plus space for new lessons
   - Categories: Multi-Agent Coordination, Explicit Agent Rules, Architectural Intent
   - Structured format: Lesson → Context → Recommendation
   - Team members can add new lessons via MDX files

4. **Agent Playbook**
   - Guidelines for agents AND humans (slide 12)
   - Preferred stacks by project type
   - Security, deployment, documentation patterns
   - Data access conventions and reusable primitives
   - The Agent Orchestrator role definition (slide 11)

5. **Projects & Metrics**
   - Repository summaries and effort estimates (slides 22-27)
   - Interactive table with per-project metrics
   - Productivity multiplier visualizations
   - Space to add new project entries

6. **Team Knowledge Base**
   - Wiki-style collaborative space
   - Organized by topic tags
   - Search functionality
   - Designed for broad stakeholders (non-technical friendly)

7. **Planning & Roadmap**
   - Strategic questions and institutional framing (slide 19)
   - Timeline / roadmap visualization
   - Action items and status tracking

## File Structure

```
AISPEG/
├── app/
│   ├── layout.tsx              # Root layout with nav sidebar
│   ├── page.tsx                # Home / Dashboard
│   ├── principles/
│   │   └── page.tsx            # Strategic Principles
│   ├── lessons/
│   │   └── page.tsx            # Lessons Learned
│   ├── playbook/
│   │   └── page.tsx            # Agent Playbook
│   ├── projects/
│   │   └── page.tsx            # Projects & Metrics
│   ├── knowledge/
│   │   └── page.tsx            # Team Knowledge Base
│   └── roadmap/
│       └── page.tsx            # Planning & Roadmap
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── MetricCard.tsx          # Reusable metric display
│   ├── PrincipleCard.tsx       # Expandable principle card
│   ├── LessonCard.tsx          # Lesson learned card
│   ├── ProjectTable.tsx        # Interactive project metrics table
│   ├── SearchBar.tsx           # Knowledge base search
│   └── ActivityFeed.tsx        # Recent updates feed
├── content/
│   ├── principles/             # MDX files for each principle
│   ├── lessons/                # MDX files for each lesson
│   ├── playbook/               # MDX files for playbook entries
│   └── knowledge/              # MDX files for knowledge articles
├── lib/
│   ├── content.ts              # MDX loading utilities
│   └── data.ts                 # Static data (metrics, projects)
├── public/
│   └── ...                     # Static assets
├── tailwind.config.ts
├── next.config.mjs
├── package.json
├── tsconfig.json
├── CLAUDE.md                   # Agent instructions for collaborators
└── README.md
```

## Agent-Friendly Design Principles

1. **MDX Content Files**: All substantive content lives in `/content/` as MDX files. Any collaborator's AI agent can add/edit content by creating or modifying these files.

2. **CLAUDE.md**: A project-level instruction file that tells agentic tools about the project structure, conventions, and how to add content.

3. **Consistent Frontmatter**: Each MDX file uses standardized frontmatter (title, date, author, tags, category) so agents can programmatically create well-structured content.

4. **Component Library**: Reusable React components that agents can compose in MDX without needing to write custom UI code.

5. **Clear File Naming**: Descriptive, slugified filenames so agents can find and reference content easily.

## Implementation Steps

1. Initialize Next.js project with TypeScript + Tailwind
2. Set up app layout with responsive sidebar navigation
3. Build reusable component library (MetricCard, PrincipleCard, LessonCard, etc.)
4. Create the Home/Dashboard page with key metrics
5. Build Strategic Principles page with content from slides
6. Build Lessons Learned page with content from slides
7. Build Agent Playbook page
8. Build Projects & Metrics page with interactive table
9. Build Knowledge Base with search
10. Build Planning & Roadmap page
11. Create CLAUDE.md with agent collaboration guidelines
12. Populate initial MDX content from the PowerPoint
13. Create initial git commit and push to GitHub

## Design
- Clean, modern UI with university-appropriate styling
- Dark/light mode toggle
- Responsive (desktop + tablet)
- University of Idaho gold (#B5A36A) and black (#000000) accent colors
