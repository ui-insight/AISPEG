// scripts/collect-status-evidence.ts
//
// Step 1 of a status review (docs/agent-orchestration.md). Gathers repo, URL
// and optional database evidence for every project, applies the rules in
// lib/status-review.ts, and writes:
//
//   evidence-ids.json   every citable ID, per project
//                       tags: P portfolio, G GitHub, U URL, C ClickUp statement,
//                       D database, X exception, N evidence gap
//   exceptions.json     what needs a human or model to look at it
//   packets.md          exception projects only, ready to paste into a brief
//   all-packets.md      every project
//
// Output is non-public and must stay out of this public repository, so the
// script refuses an --out path inside it. ClickUp connector notes come from
// <out>/clickup-notes.json ({ "<slug>": ["note", ...] }), written by the
// orchestrator because connector tools cannot be called from a script.
//
//   GITHUB_TOKEN=$(gh auth token) npm run status:collect -- --out <dir>
//
// Set DATABASE_URL to add open blockers, linked requests and ClickUp sync
// freshness. Without it the database evidence is recorded as a gap.

import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { slugForListId } from "../lib/clickup-map.js";
import { projects, type Project } from "../lib/portfolio.js";
import {
  findExceptions,
  isBotAuthor,
  isFeatureIssue,
  probeUrl,
  type RepoFacts,
  type StatusException,
  type UrlProbe,
} from "../lib/status-review.js";

const REPO_ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const API = "https://api.github.com";

interface GitHubEvidence extends RepoFacts {
  commits: { date: string; author: string; message: string }[];
  prs: { number: number; state: string; updated: string; title: string }[];
  issues: { number: number; updated: string; title: string }[];
  releases: string[];
}

interface DbEvidence {
  gap?: string;
  syncedAt?: string | null;
  bySlug: Record<string, string[]>;
}

/** Resolves symlinks through the deepest part of a path that exists yet. */
function canonicalPath(path: string): string {
  if (existsSync(path)) return realpathSync(path);
  const parent = dirname(path);
  return parent === path ? path : join(canonicalPath(parent), basename(path));
}

function parseArgs(): { out: string } {
  const index = process.argv.indexOf("--out");
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value) throw new Error("Usage: npm run status:collect -- --out <dir outside the repo>");
  const out = resolve(value);
  const rel = relative(REPO_ROOT, canonicalPath(out));
  const outside = rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel);
  if (!outside) {
    throw new Error(`--out must be outside the repository; evidence is non-public (${out}).`);
  }
  return { out };
}

async function github<T>(path: string): Promise<{ data?: T; error?: string }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "aispeg-status-review",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) return { error: `HTTP ${res.status}` };
  return { data: (await res.json()) as T };
}

interface OpenIssue {
  number: number;
  title: string;
  updated_at: string;
  pull_request?: unknown;
  labels: { name: string }[];
}

/** Reads every open issue. Returns null if any page fails or the cap is hit. */
async function allOpenIssues(name: string): Promise<OpenIssue[] | null> {
  const issues: OpenIssue[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await github<OpenIssue[]>(
      `/repos/${name}/issues?state=open&sort=updated&direction=desc&per_page=100&page=${page}`
    );
    if (!res.data) return null;
    issues.push(...res.data);
    if (res.data.length < 100) return issues;
  }
  return null;
}

function repoPath(url: string): string | null {
  return url.match(/^https:\/\/github\.com\/([^/]+\/[^/.]+)/)?.[1] ?? null;
}

async function collectRepo(requested: string): Promise<GitHubEvidence> {
  const empty = { commits: [], prs: [], issues: [], releases: [] };
  const repo = await github<{
    full_name: string;
    private: boolean;
    archived: boolean;
  }>(`/repos/${requested}`);
  if (!repo.data) return { requested, error: repo.error, ...empty };
  const name = repo.data.full_name;

  const [commits, pulls, issues, releases] = await Promise.all([
    github<
      {
        author: { login: string } | null;
        commit: { message: string; author: { name: string }; committer: { date: string } };
      }[]
    >(`/repos/${name}/commits?per_page=100`),
    github<{ number: number; state: string; updated_at: string; title: string; merged_at: string | null }[]>(
      `/repos/${name}/pulls?state=all&sort=updated&direction=desc&per_page=8`
    ),
    allOpenIssues(name),
    github<{ tag_name: string; published_at: string | null }[]>(`/repos/${name}/releases?per_page=2`),
  ]);

  const history = (commits.data ?? []).map((c) => ({
    date: c.commit.committer.date,
    author: c.author?.login ?? c.commit.author.name,
    message: c.commit.message.split("\n")[0]!.slice(0, 80),
  }));
  const openIssues = (issues ?? []).filter((i) => !i.pull_request);
  const gaps = [
    commits.data ? null : "commits",
    issues ? null : "open issues",
    pulls.data ? null : "pull requests",
    releases.data ? null : "releases",
  ].filter((gap): gap is string => gap !== null);

  return {
    requested,
    fullName: name,
    isPrivate: repo.data.private,
    archived: repo.data.archived,
    lastCommitDate: history[0]?.date ?? null,
    lastHumanCommitDate: history.find((c) => !isBotAuthor(c.author))?.date ?? null,
    commitCount: history.length,
    openFeatureIssues: issues
      ? openIssues.filter((i) => isFeatureIssue(i.labels.map((label) => label.name))).length
      : undefined,
    gaps,
    commits: history.slice(0, 5),
    prs: (pulls.data ?? []).slice(0, 4).map((p) => ({
      number: p.number,
      state: p.merged_at ? "merged" : p.state,
      updated: p.updated_at.slice(0, 10),
      title: p.title.slice(0, 70),
    })),
    issues: openIssues.slice(0, 3).map((i) => ({
      number: i.number,
      updated: i.updated_at.slice(0, 10),
      title: i.title.slice(0, 70),
    })),
    releases: (releases.data ?? []).map((r) => `${r.tag_name} ${(r.published_at ?? "").slice(0, 10)}`),
  };
}

async function collectDb(): Promise<DbEvidence> {
  const url = process.env.DATABASE_URL;
  if (!url) return { gap: "DATABASE_URL not set", bySlug: {} };

  const pool = new Pool({ connectionString: url });
  const bySlug: Record<string, string[]> = {};
  const add = (slug: string, line: string) => (bySlug[slug] ??= []).push(line);
  try {
    const blockers = await pool.query(
      `SELECT a.slug, b.category, b.since::text, b.public_text
         FROM blockers b JOIN applications a ON a.id = b.application_id
        WHERE b.resolved_at IS NULL`
    );
    for (const b of blockers.rows) {
      add(b.slug, `open blocker ${b.category} since ${b.since}: ${b.public_text}`);
    }
    const links = await pool.query(
      `SELECT l.application_slug AS slug, l.link_type, r.title, r.disposition
         FROM tech_request_project_links l JOIN tech_requests r ON r.id = l.request_id`
    );
    for (const l of links.rows) {
      add(l.slug, `linked request (${l.link_type}): ${l.title}; disposition ${l.disposition}`);
    }
    const updates = await pool.query(
      `SELECT DISTINCT ON (clickup_list_id) clickup_list_id, posted_at::date::text AS posted, body_text
         FROM clickup_status_updates ORDER BY clickup_list_id, posted_at DESC`
    );
    for (const u of updates.rows) {
      const slug = slugForListId(u.clickup_list_id);
      if (slug) add(slug, `last synced ClickUp update ${u.posted}: ${String(u.body_text).slice(0, 400)}`);
    }
    const sync = await pool.query(
      `SELECT max(finished_at)::text AS at FROM clickup_sync_runs WHERE ok`
    );
    return { syncedAt: sync.rows[0]?.at ?? null, bySlug };
  } finally {
    await pool.end();
  }
}

function readNotes(out: string): Record<string, string[]> {
  const path = join(out, "clickup-notes.json");
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, string[]>;
}

function packet(
  project: Project,
  repo: GitHubEvidence | null,
  sharedWith: string[],
  probe: UrlProbe | null,
  exceptions: StatusException[],
  notes: string[],
  db: string[]
): { text: string; ids: string[] } {
  const lines: string[] = [];
  const counts: Record<string, number> = {};
  const add = (tag: string, text: string) => {
    counts[tag] = (counts[tag] ?? 0) + 1;
    lines.push(`[${project.slug}/${tag}${counts[tag]}] ${text}`);
  };

  const facts = {
    status: project.status,
    owners: project.operationalOwners.map((o) => o.name),
    pilotCohort: project.pilotCohort,
    liveUrlIsStaging: project.liveUrlIsStaging,
    currentDeployment: project.currentDeploymentEnvironment,
  };
  add("P", `portfolio ${JSON.stringify(facts)}`);

  if (!repo) {
    add("G", "no repo linked");
  } else if (repo.error) {
    add("G", `repo ${repo.requested}: ${repo.error}`);
  } else {
    add(
      "G",
      `repo ${repo.fullName} private=${repo.isPrivate} archived=${repo.archived}; last commit ${repo.lastCommitDate?.slice(0, 10)}; last non-bot commit ${repo.lastHumanCommitDate?.slice(0, 10) ?? "none in last 100"}; open feature issues ${repo.openFeatureIssues ?? "unknown"}; releases ${repo.releases.join(", ") || "none"}`
    );
    if (sharedWith.length) add("G", `repo shared with ${sharedWith.join(", ")}: activity cannot be attributed to one project`);
    if (repo.commits.length) {
      add("G", `commits: ${repo.commits.map((c) => `${c.date.slice(0, 10)} ${c.message}`).join(" | ")}`);
    }
    if (repo.prs.length) {
      add("G", `PRs: ${repo.prs.map((p) => `#${p.number} ${p.state} ${p.updated} ${p.title}`).join(" | ")}`);
    }
    if (repo.issues.length) {
      add("G", `issues: ${repo.issues.map((i) => `#${i.number} ${i.updated} ${i.title}`).join(" | ")}`);
    }
  }
  if (probe) {
    const cert = probe.certIssue ? `; certificate chain: ${probe.certIssue}` : "";
    add("U", `${probe.url} probed: HTTP ${probe.status ?? probe.error} (${probe.state})${cert}`);
  }
  for (const note of notes) add("C", note);
  if (!notes.length) add("N", "no ClickUp notes supplied");
  for (const line of db) add("D", line);
  for (const e of exceptions) add("X", `${e.kind} (${e.severity}): ${e.detail}`);

  return {
    text: `### ${project.slug} (${project.name})\n${lines.join("\n")}`,
    ids: lines.map((line) => line.slice(1, line.indexOf("]"))),
  };
}

async function main(): Promise<void> {
  const { out } = parseArgs();
  mkdirSync(out, { recursive: true });
  const asOf = new Date();
  if (!process.env.GITHUB_TOKEN) console.warn("GITHUB_TOKEN not set; private repos will read as unreachable.");

  const repoNames = [
    ...new Set(projects.flatMap((p) => (p.repoUrl ? [repoPath(p.repoUrl)] : [])).filter(Boolean)),
  ] as string[];
  const repos = new Map<string, GitHubEvidence>();
  for (const name of repoNames) repos.set(name, await collectRepo(name));

  const urls = [...new Set(projects.flatMap((p) => (p.liveUrl ? [p.liveUrl] : [])))];
  const probes = new Map((await Promise.all(urls.map((u) => probeUrl(u)))).map((p) => [p.url, p]));

  const db = await collectDb();
  const notes = readNotes(out);

  const texts: Record<string, string> = {};
  const ids: Record<string, string[]> = {};
  const exceptions: StatusException[] = [];
  for (const project of projects) {
    const name = project.repoUrl ? repoPath(project.repoUrl) : null;
    const repo = name ? (repos.get(name) ?? null) : null;
    const probe = project.liveUrl ? (probes.get(project.liveUrl) ?? null) : null;
    const sharedWith = projects
      .filter((p) => p.slug !== project.slug && p.repoUrl && repoPath(p.repoUrl) === name)
      .map((p) => p.slug);
    const found = findExceptions(project, repo, probe, asOf);
    exceptions.push(...found);
    const built = packet(project, repo, sharedWith, probe, found, notes[project.slug] ?? [], db.bySlug[project.slug] ?? []);
    texts[project.slug] = built.text;
    ids[project.slug] = built.ids;
  }

  const flagged = [...new Set(exceptions.map((e) => e.slug))];
  const allPackets = projects.map((p) => texts[p.slug]).join("\n\n");
  const flaggedPackets = flagged.map((slug) => texts[slug]).join("\n\n");
  writeFileSync(join(out, "evidence-ids.json"), JSON.stringify(ids, null, 1));
  writeFileSync(join(out, "exceptions.json"), JSON.stringify(exceptions, null, 1));
  writeFileSync(join(out, "packets.md"), flaggedPackets);
  writeFileSync(join(out, "all-packets.md"), allPackets);

  console.log(`As of ${asOf.toISOString().slice(0, 10)}: ${projects.length} projects, ${exceptions.length} exceptions across ${flagged.length}.`);
  for (const e of exceptions) console.log(`  ${e.severity.padEnd(4)} ${e.slug.padEnd(30)} ${e.kind}: ${e.detail}`);
  const certIssues = [...probes.values()].filter((p) => p.certIssue).length;
  if (certIssues) console.log(`Certificate chain issues: ${certIssues} of ${probes.size} URLs (see packets).`);
  console.log(`Database: ${db.gap ?? `read; last good ClickUp sync ${db.syncedAt ?? "never"}`}`);
  console.log(`ClickUp notes: ${Object.keys(notes).length} projects`);
  console.log(`packets.md is ${flaggedPackets.length} bytes. Wrote to ${out}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
