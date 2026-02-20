# AISPEG — Agent Collaboration Guide

## Project Overview
Interactive website for the AI Strategic Planning & Evaluation Group (AISPEG) at the University of Idaho. Built with Next.js (App Router), Tailwind CSS v4, and TypeScript.

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
