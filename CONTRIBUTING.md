# Contributing to AISPEG with Agentic Coding Tools

This guide explains how to collaboratively add content and features to the AISPEG site using agentic coding tools like **Claude Code**, **Cursor**, **GitHub Copilot**, or similar AI-assisted development environments.

The site was built this way from scratch, and it's designed to keep working this way.

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **Git**
- An **agentic coding tool** (any of the following work):
  - [Claude Code](https://claude.ai/claude-code) (CLI agent)
  - [Cursor](https://cursor.sh) (AI-native IDE)
  - [GitHub Copilot](https://github.com/features/copilot) in VS Code
  - Any LLM-powered coding assistant that can read/write files

---

## Getting Started

```bash
git clone https://github.com/ui-insight/AISPEG.git
cd AISPEG
npm install
npm run dev
```

The site runs at [http://localhost:3000](http://localhost:3000).

> **Tip for agentic tools:** When starting a session, point your agent at the `CLAUDE.md` file in the project root. It contains the project structure, conventions, and rules the agent should follow.

---

## How the Site Works

The architecture is intentionally simple and agent-friendly:

### Data-Driven Design

All content lives in a single file: **`lib/data.ts`**

Pages don't contain hardcoded content. Instead, they import data from `lib/data.ts` and render it using reusable components. To add content, you add data to the file — you don't need to write new components or pages.

### Component Library

Reusable components in `components/` handle rendering:

| Component          | Purpose                        | Used On          |
|--------------------|--------------------------------|------------------|
| `MetricCard.tsx`   | Displays a single metric       | Dashboard, Projects |
| `PrincipleCard.tsx`| Expandable principle card      | Principles       |
| `LessonCard.tsx`   | Lesson with recommendations    | Lessons          |
| `ProjectTable.tsx` | Sortable project metrics table | Projects         |
| `Sidebar.tsx`      | Navigation sidebar             | All pages (layout) |

### Server vs Client Components

- Pages are **server components** by default (no `"use client"` directive)
- Components that need interactivity (expand/collapse, sorting, search) use `"use client"`
- Only add `"use client"` when a component needs `useState`, `useEffect`, or event handlers

---

## Common Tasks

### Adding a New Lesson Learned

Open `lib/data.ts` and add an entry to the `lessons` array:

```typescript
// In the lessons array, add:
{
  id: "your-lesson-id",
  title: "Your Lesson Title",
  context: "Brief context about when this lesson applies",
  recommendations: [
    "First recommendation or takeaway",
    "Second recommendation",
    "Third recommendation",
  ],
  category: "CategoryName",  // e.g., "Coordination", "Governance", "Architecture"
},
```

The Lessons page (`app/lessons/page.tsx`) automatically renders all entries from this array using the `LessonCard` component.

### Adding a New Strategic Principle

Add an entry to the `principles` array in `lib/data.ts`:

```typescript
{
  id: "your-principle-id",
  title: "Your Principle Title",
  summary: "One-line summary shown when collapsed.",
  details: "Longer explanation shown when the card is expanded.",
  category: "Foundation",  // or "Workforce", "Strategy", "Implementation"
},
```

The Principles page groups cards by `category`, so your new principle will appear under the matching heading.

### Adding a Knowledge Base Article

The Knowledge Base page (`app/knowledge/page.tsx`) currently stores articles inline. Add to the `articles` array inside that file:

```typescript
{
  title: "Your Article Title",
  summary: "A paragraph summarizing the article content.",
  tags: ["tag1", "tag2", "tag3"],
  category: "CategoryName",  // e.g., "Context", "Roles", "Architecture", "Strategy"
},
```

Tags are used for filtering and search. The search bar matches against titles, summaries, and tags.

### Adding a New Project to the Metrics Table

Add an entry to the `projects` array in `lib/data.ts`:

```typescript
{
  name: "RepoName",
  daysActive: 5,
  netNewLines: 12000,
  lowEstimate: "80 days (3.6 mo)",
  highEstimate: "120 days (5.5 mo)",
  multiplier: "16-24x",
},
```

Remember to update `projectTotals` if the totals have changed.

### Adding a New Playbook Entry

Add to the `playbookItems` array in `lib/data.ts`:

```typescript
{
  id: "your-item-id",
  title: "Playbook Entry Title",
  description: "Description of the guideline, convention, or pattern.",
  category: "Roles",  // or "Standards", "Infrastructure"
},
```

### Creating a New Page

1. Create a new directory under `app/`:
   ```
   app/your-page/page.tsx
   ```

2. Add a navigation entry in `components/Sidebar.tsx`:
   ```typescript
   // In the navItems array:
   { href: "/your-page", label: "Your Page", icon: "squares" },
   ```
   Choose an icon from the existing set: `squares`, `lightbulb`, `book`, `clipboard`, `chart`, `search`, `map`.

3. Import data and components as needed:
   ```typescript
   import MetricCard from "@/components/MetricCard";
   import { yourData } from "@/lib/data";
   ```

---

## Workflow

### For Solo Work (Direct to Main)

```
1. Pull latest:         git pull origin main
2. Make changes:        (edit files with your agentic tool)
3. Verify build:        npm run build
4. Commit & push:       git add <files> && git commit -m "description" && git push
```

### For Collaborative Work (Branch + PR)

```
1. Create branch:       git checkout -b feature/your-feature
2. Make changes:        (edit files with your agentic tool)
3. Verify build:        npm run build
4. Commit & push:       git add <files> && git commit -m "description" && git push -u origin feature/your-feature
5. Open PR:             gh pr create --title "Add ..." --body "Description"
```

**Always run `npm run build` before committing.** This catches TypeScript errors and ensures the site compiles.

---

## Tips for Agentic Coding Tools

### Starting a Session

When you open the project with an agentic tool, give it context:

> "Read CLAUDE.md to understand the project. This is a Next.js site where all content is data-driven from lib/data.ts. Components in components/ render the data. Run npm run build to verify changes."

### Effective Prompts

Here are example prompts that work well:

**Adding content:**
> "Add a new lesson learned to lib/data.ts about the importance of clear API contracts in multi-agent systems. Use the existing lesson format."

**Modifying a page:**
> "Update the roadmap page to add a Phase 5 about external partnerships. Follow the existing pattern in app/roadmap/page.tsx."

**Building a new feature:**
> "Create a new 'Resources' page at app/resources/page.tsx with a list of links. Add it to the sidebar navigation. Follow the patterns from the existing pages."

**Verification:**
> "Run npm run build and fix any errors."

### What Your Agent Needs to Know

- `lib/data.ts` is the single source of truth for content
- Pages import from `lib/data.ts` and render with components from `components/`
- Tailwind CSS v4 is used — styles are utility classes, custom colors use `ui-gold`, `ui-charcoal`, etc.
- `npm run build` is the verification step — it must pass before committing
- `CLAUDE.md` has the concise project rules for agents

### Common Pitfalls

- **Don't hardcode content in pages** — add it to `lib/data.ts` instead
- **Don't add `"use client"` to pages unnecessarily** — only client components need it
- **Always verify the build** — TypeScript will catch most mistakes
- **Use existing component patterns** — look at how current pages use `MetricCard`, `PrincipleCard`, etc. before creating new components

---

## Style Guide

### Colors

| Token          | Hex       | Usage                          |
|----------------|-----------|--------------------------------|
| `ui-gold`      | `#B5A36A` | Accents, badges, highlights    |
| `ui-gold-dark` | `#8A7D50` | Text on light backgrounds      |
| `ui-charcoal`  | `#1a1a2e` | Headings, sidebar, dark blocks |
| `ui-dark`      | `#16213e` | Card dark variants             |
| `ui-mid`       | `#0f3460` | Secondary badges               |

### Component Conventions

- Cards use `rounded-xl border border-gray-200 bg-white p-6 shadow-sm`
- Badges use `rounded-full px-2.5 py-0.5 text-xs font-medium`
- Headings: `h1` = `text-3xl font-bold`, `h2` = `text-lg font-semibold`
- Spacing between page sections: `space-y-10`

### File Naming

- Pages: `app/{section}/page.tsx`
- Components: `components/PascalCase.tsx`
- Data/utilities: `lib/camelCase.ts`
- IDs in data: `kebab-case` strings
