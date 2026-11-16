// ============================================================
// UTR export — institutional emails, keyed by person name
// ============================================================
// TDX resolves Requestor and Contact people by email. Emails live here,
// not on `OperationalOwner` in lib/portfolio.ts, because lib/portfolio.ts
// reaches the browser: components/ProjectMap.tsx (a client component)
// imports the project list through lib/project-map-graph.ts, so any
// field on a portfolio entry ships in the client bundle.
//
// Import this module ONLY from lib/utr-export.ts. Never from app/,
// components/, lib/agent/, or anything those import.
//
// The repository is public, so every address here is public on GitHub.
// Add only institutional addresses already listed in the UI directory.
// Keys must match the person's name exactly as written in
// lib/portfolio.ts (operationalOwners, supportContact, iidsSponsor).
// ============================================================

export const utrPersonEmails: Record<string, string> = {};
