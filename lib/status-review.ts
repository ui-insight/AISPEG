// lib/status-review.ts
//
// Deterministic checks behind the status review (docs/agent-orchestration.md).
// Each rule compares a project's claimed status with facts gathered today, so
// a review starts from the exceptions rather than a model reading all 32
// projects. ADR 0001 is the source for the day counts below.

import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { Project } from "./portfolio";
import { isOitManagedEnvironment } from "./project-governance";

export type ProbeState = "up" | "down";

export interface UrlProbe {
  url: string;
  status: number | null;
  state: ProbeState;
  error?: string;
  /** Set when the site answered but its certificate chain does not verify. */
  certIssue?: string;
}

export interface RepoFacts {
  requested: string;
  fullName?: string;
  isPrivate?: boolean;
  archived?: boolean;
  lastCommitDate?: string | null;
  lastHumanCommitDate?: string | null;
  /** Commits read from the default branch, capped at one page. */
  commitCount?: number;
  /** Undefined when the full issue list could not be read; never assume zero. */
  openFeatureIssues?: number;
  /** Evidence that could not be read, so its rules did not run. */
  gaps?: string[];
  error?: string;
}

export type ExceptionKind =
  | "live-url-down"
  | "repo-unreachable"
  | "repo-moved"
  | "cadence-building"
  | "cadence-building-near-limit"
  | "cadence-prototype"
  | "cadence-maintained"
  | "maintained-feature-issues"
  | "maintained-candidate"
  | "production-repo-quiet"
  | "archived-still-active"
  | "archived-still-live"
  | "idea-has-commits"
  | "approved-has-activity"
  | "evidence-incomplete";

export interface StatusException {
  slug: string;
  kind: ExceptionKind;
  severity: "act" | "info";
  detail: string;
}

const NON_BLOCKING_LABELS = ["bug", "security", "chore"];
const RETIRED_STATUSES: Project["status"][] = ["paused", "sunsetting", "archived"];

export function isFeatureIssue(labels: string[]): boolean {
  return !labels.some((label) =>
    NON_BLOCKING_LABELS.some((name) => label.toLowerCase().includes(name))
  );
}

export function isBotAuthor(login: string): boolean {
  return login.endsWith("[bot]");
}

/**
 * Answers "is the service up?", so a broken certificate chain must not read as
 * an outage: strict clients reject the Insight proxy's chain while browsers
 * accept it. Certificates go unverified here for that reason, and it is safe
 * because the probe sends no credentials and uses only the status code.
 * Redirects are not followed; a redirect to SSO means the service answered.
 */
function probeOnce(url: string, timeoutMs: number): Promise<UrlProbe> {
  return new Promise((done) => {
    const send = url.startsWith("https:") ? httpsRequest : httpRequest;
    const req = send(
      url,
      {
        method: "GET",
        timeout: timeoutMs,
        rejectUnauthorized: false,
        headers: { "User-Agent": "aispeg-status-review" },
      },
      (res) => {
        const socket = res.socket as { authorized?: boolean; authorizationError?: Error | string };
        const status = res.statusCode ?? null;
        const up = status !== null && status < 500 && status !== 404;
        const probe: UrlProbe = { url, status, state: up ? "up" : "down" };
        if (socket.authorized === false) probe.certIssue = String(socket.authorizationError);
        res.destroy();
        done(probe);
      }
    );
    req.on("timeout", () => req.destroy(new Error(`no answer in ${timeoutMs} ms`)));
    req.on("error", (err) => done({ url, status: null, state: "down", error: err.message }));
    req.end();
  });
}

/** Retries a failed connection once, since a DNS blip is not an outage. */
export async function probeUrl(url: string, timeoutMs = 15_000): Promise<UrlProbe> {
  const first = await probeOnce(url, timeoutMs);
  if (first.status !== null) return first;
  await new Promise((wait) => setTimeout(wait, 3_000));
  return probeOnce(url, timeoutMs);
}

function daysBetween(fromIso: string, to: Date): number {
  return Math.floor((to.getTime() - new Date(fromIso).getTime()) / 86_400_000);
}

export function findExceptions(
  project: Project,
  repo: RepoFacts | null,
  probe: UrlProbe | null,
  asOf: Date
): StatusException[] {
  const found: StatusException[] = [];
  const add = (kind: ExceptionKind, severity: "act" | "info", detail: string) =>
    found.push({ slug: project.slug, kind, severity, detail });
  const retired = RETIRED_STATUSES.includes(project.status);
  // OIT-hosted code ships from OIT's repositories, so a linked repo going
  // quiet says nothing about whether the deployed module is being maintained.
  const oitHosted =
    project.currentDeploymentEnvironment !== undefined &&
    isOitManagedEnvironment(project.currentDeploymentEnvironment);

  if (probe?.state === "down") {
    add(
      "live-url-down",
      retired ? "info" : "act",
      `${probe.url} returned ${probe.status ?? probe.error}; one probe, so confirm before acting.`
    );
  }
  if (project.status === "archived" && probe?.state === "up") {
    add("archived-still-live", "act", `${probe.url} still answers, but archived requires a stopped service.`);
  }
  if (!repo) return found;

  if (repo.error) {
    add("repo-unreachable", retired ? "info" : "act", `${repo.requested}: ${repo.error}`);
    return found;
  }
  if (repo.fullName && repo.fullName.toLowerCase() !== repo.requested.toLowerCase()) {
    add("repo-moved", "act", `${repo.requested} now resolves to ${repo.fullName}.`);
  }
  if (repo.gaps?.length) {
    add("evidence-incomplete", "act", `Could not read ${repo.gaps.join(", ")}; dependent rules did not run.`);
  }
  if (project.status === "maintained" && repo.openFeatureIssues) {
    add("maintained-feature-issues", "act", `${repo.openFeatureIssues} open feature issues; ADR allows none.`);
  }
  if (!repo.lastCommitDate) return found;

  const days = daysBetween(repo.lastCommitDate, asOf);
  switch (project.status) {
    case "idea":
      add("idea-has-commits", "act", "Repo has commits; ADR expects an idea to have none.");
      break;
    case "approved":
      if (days <= 14 && (repo.commitCount ?? 0) >= 10) {
        add("approved-has-activity", "act", `Committed ${days} days ago, so this looks like active building.`);
      }
      break;
    case "building":
      if (days > 60) {
        add("cadence-building", "act", `Last default-branch commit ${days} days ago; ADR limit is 60.`);
      } else if (days > 45) {
        add("cadence-building-near-limit", "info", `Last default-branch commit ${days} days ago; ADR limit is 60.`);
      }
      break;
    case "prototype":
      if (days <= 30 && !project.featureComplete) {
        add("cadence-prototype", "act", `Committed ${days} days ago, so this looks like active building.`);
      }
      break;
    case "maintained":
      if (days < 90) {
        add("cadence-maintained", "act", `Committed ${days} days ago; ADR requires 90 quiet days.`);
      }
      break;
    case "production":
      if (days > 90 && repo.openFeatureIssues === 0 && !oitHosted) {
        add("maintained-candidate", "act", `${days} quiet days and no open feature issues.`);
      }
      if (days > 180) {
        add("production-repo-quiet", "info", `${days} quiet days; confirm repoUrl is the deployed source.`);
      }
      break;
    case "archived":
      if (days < 30) {
        add("archived-still-active", "act", `Archived, but committed ${days} days ago.`);
      }
      break;
  }
  return found;
}
