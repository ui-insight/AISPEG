// lib/clickup.ts
//
// Minimal typed client for the ClickUp REST API (v2), scoped to what the
// ingestion sync needs: list tasks (with custom fields) and task comments.
// Pull-only — this module never writes to ClickUp. See ADR 0004.
//
// Auth: CLICKUP_API_TOKEN env var (a personal API token with read access
// to the IIDS-AI4UI space). Field ids below were captured from the live
// space; they are stable identifiers, not secrets.
//
// Not marked "server-only" because scripts/sync-clickup.ts imports it
// from tsx. Never import from a client component.

const BASE = "https://api.clickup.com/api/v2";

export class ClickUpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ClickUpError";
    this.status = status;
  }
}

function token(): string {
  const value = process.env.CLICKUP_API_TOKEN;
  if (!value) {
    throw new Error(
      "CLICKUP_API_TOKEN is not set. Add a ClickUp personal API token with read access to the IIDS-AI4UI space (see .env.example)."
    );
  }
  return value;
}

// Small courtesy delay between requests keeps a full sync (~35 requests)
// far below ClickUp's ~100 req/min per-token limit.
const INTER_REQUEST_DELAY_MS = 150;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cuFetch<T>(path: string, attempt = 0): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: token() },
  });

  if (res.status === 429 && attempt === 0) {
    const retryAfter = Number(res.headers.get("Retry-After")) || 60;
    console.warn(`  ! ClickUp 429 — waiting ${retryAfter}s before retry`);
    await sleep(retryAfter * 1000);
    return cuFetch<T>(path, attempt + 1);
  }
  if (res.status >= 500 && attempt === 0) {
    await sleep(2000);
    return cuFetch<T>(path, attempt + 1);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ClickUpError(
      `ClickUp GET ${path} failed: ${res.status} ${res.statusText} ${body.slice(0, 200)}`,
      res.status
    );
  }

  await sleep(INTER_REQUEST_DELAY_MS);
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// API shapes (only the parts the sync reads)
// ---------------------------------------------------------------------------

export interface ClickUpDropdownOption {
  id: string;
  name?: string;
  label?: string; // "labels"-type fields use `label` instead of `name`
  orderindex?: number;
}

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config?: { options?: ClickUpDropdownOption[] };
  value?: unknown;
}

export interface ClickUpTask {
  id: string;
  name: string;
  custom_item_id: number | null;
  status: { status: string };
  date_created: string; // ms epoch as string
  date_updated: string;
  date_closed: string | null;
  description?: string | null;
  text_content?: string | null;
  creator?: { username: string | null };
  custom_fields?: ClickUpCustomField[];
}

export interface ClickUpCommentSegment {
  type?: string;
  text?: string;
  user?: { username?: string | null; email?: string | null };
}

export interface ClickUpComment {
  id: string;
  comment: ClickUpCommentSegment[];
  comment_text: string;
  user: { username: string | null; email?: string | null };
  date: string; // ms epoch as string
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

/**
 * All top-level tasks in a list, paginated. Custom fields are included in
 * the response.
 */
export async function getListTasks(
  listId: string,
  opts: { includeClosed?: boolean } = {}
): Promise<ClickUpTask[]> {
  const tasks: ClickUpTask[] = [];
  for (let page = 0; ; page++) {
    const params = new URLSearchParams({
      page: String(page),
      subtasks: "false",
      include_closed: opts.includeClosed ? "true" : "false",
    });
    const data = await cuFetch<{ tasks: ClickUpTask[]; last_page?: boolean }>(
      `/list/${listId}/task?${params}`
    );
    tasks.push(...data.tasks);
    if (data.last_page || data.tasks.length === 0) break;
  }
  return tasks;
}

/**
 * All comments on a task, oldest page last. The API returns up to 25 per
 * page, newest first; older pages are fetched with start + start_id.
 */
export async function getTaskComments(taskId: string): Promise<ClickUpComment[]> {
  const comments: ClickUpComment[] = [];
  let cursor: { start: string; startId: string } | null = null;
  for (;;) {
    const params = new URLSearchParams();
    if (cursor) {
      params.set("start", cursor.start);
      params.set("start_id", cursor.startId);
    }
    const qs = params.toString();
    const data = await cuFetch<{ comments: ClickUpComment[] }>(
      `/task/${taskId}/comment${qs ? `?${qs}` : ""}`
    );
    comments.push(...data.comments);
    if (data.comments.length < 25) break;
    const oldest = data.comments[data.comments.length - 1]!;
    cursor = { start: oldest.date, startId: oldest.id };
  }
  return comments;
}

// ---------------------------------------------------------------------------
// Custom-field extraction
// ---------------------------------------------------------------------------

function field(task: ClickUpTask, fieldId: string): ClickUpCustomField | null {
  return task.custom_fields?.find((f) => f.id === fieldId) ?? null;
}

/** Number fields arrive as strings ("3") or numbers. Null when unset. */
export function getNumberField(task: ClickUpTask, fieldId: string): number | null {
  const value = field(task, fieldId)?.value;
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function getTextField(task: ClickUpTask, fieldId: string): string | null {
  const value = field(task, fieldId)?.value;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Dropdown values arrive either as the option's orderindex (number) or its
 * uuid (string). Resolve to the option's display name.
 */
export function getDropdownField(task: ClickUpTask, fieldId: string): string | null {
  const f = field(task, fieldId);
  if (!f || f.value === undefined || f.value === null) return null;
  const options = f.type_config?.options ?? [];
  const match =
    typeof f.value === "number"
      ? options.find((o) => o.orderindex === f.value)
      : options.find((o) => o.id === f.value);
  return match?.name ?? match?.label ?? null;
}

export interface ClickUpPerson {
  name: string;
  email: string | null;
}

/** Users fields hold arrays of member objects; username may be null for guests. */
export function getUsersField(task: ClickUpTask, fieldId: string): ClickUpPerson[] {
  const value = field(task, fieldId)?.value;
  if (!Array.isArray(value)) return [];
  return value
    .map((u) => {
      const user = u as { username?: string | null; email?: string | null };
      const name = user.username ?? user.email ?? null;
      if (!name) return null;
      return { name, email: user.email ?? null };
    })
    .filter((p): p is ClickUpPerson => p !== null);
}

/** Date fields arrive as ms-epoch strings. Returns "YYYY-MM-DD" or null. */
export function getDateField(task: ClickUpTask, fieldId: string): string | null {
  const value = field(task, fieldId)?.value;
  if (value === undefined || value === null || value === "") return null;
  const ms = Number(value);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString().slice(0, 10);
}

export function getUrlField(task: ClickUpTask, fieldId: string): string | null {
  return getTextField(task, fieldId);
}

/** Formula values arrive as strings ("64") when computed, absent otherwise. */
export function getFormulaField(task: ClickUpTask, fieldId: string): number | null {
  return getNumberField(task, fieldId);
}

/**
 * Plain-text comment body from the structured segment array: text segments
 * verbatim, user-mention segments as display names. Falls back to
 * comment_text when segments are missing.
 */
export function commentBodyText(comment: ClickUpComment): string {
  if (!Array.isArray(comment.comment) || comment.comment.length === 0) {
    return comment.comment_text ?? "";
  }
  return comment.comment
    .map((segment) => {
      if (segment.user) return segment.user.username ?? segment.user.email ?? "";
      return segment.text ?? "";
    })
    .join("")
    .trim();
}

// ---------------------------------------------------------------------------
// Field ids (captured from the live IIDS-AI4UI space)
// ---------------------------------------------------------------------------

/** ClickUp task type ("Project Detail") used for each list's notes task. */
export const PROJECT_NOTES_CUSTOM_ITEM_ID = 1007;

/** Fields read from each project list's "Project Notes" task. */
export const PROJECT_FIELDS = {
  roiFte: "cf9b0bf9-32fb-4a93-a5aa-3f6c51f1e166",
  roiExplanation: "36e11677-c07a-44df-8c16-a63f52e8110c",
  leads: "24af91a5-9373-4d48-afa2-e6f3f9bddeef",
  pocs: "8afcbe58-f717-4b09-8270-1038a575f8e9",
  stakeholders: "e080713b-6508-4602-9897-4dff1688bfba",
  repoUrl: "e935db95-fb1c-460b-98b5-e079a00bae70", // "Github Repo/Website Link"
  projectedCompletion: "41912eac-3597-4382-82e9-3a7f4d37a7e2",
  scope: "1db86409-581a-4c30-95fd-939ae02ce48a",
  businessUnit: "42d71c8b-9673-4faf-b319-4b8dfc66a271", // "Business Unit Customer"
} as const;

/** Fields read from the "AI4UI New Project Requests" backlog tasks. */
export const RUBRIC_FIELDS = {
  a1: "432f1cea-01da-464b-905e-e9306e80afca", // A1 Alignment with University Strategic Plan
  a2: "cddc28c1-8e62-445f-932e-65f864521e50", // A2 Financial Impact (Savings/Revenue)
  a3: "999c0f52-da35-4491-8dd2-2a6c1818bacf", // A3 Breadth of Impact/Transferability
  a4: "18f76174-b417-4317-acca-58822180f911", // A4 Reputational Benefit & Visibility
  b1: "e5cf0686-d9ae-49be-b06c-fcbaeef33ce5", // B1 Technical Complexity
  b2: "bbae29f9-9e83-457d-ba68-08c70f98fb82", // B2 Data Availability & Quality
  b3: "0bb1bad6-0b4e-4fc7-a945-e42a73590016", // B3 Time to Deliver MVP
  b4: "97f3a818-85b1-4a56-a665-f4f2c9a63eaf", // B4 Technical Load/Maintenance
  c1: "e8b1de19-3a23-4c43-b802-8ee8b4282eb1", // C1 Urgency & Pain Point Severity
  c2: "2b16094c-46a3-4964-b4ca-bcf780eb4b77", // C2 Depth of Impact (Improvement per User)
  c3: "b58b22d1-3249-4cdc-997d-4d61770c1476", // C3 Champion & Departmental Buy-in
  weightedScore: "a2d8f53a-7ed4-4efd-8736-7addb93321cb",
  feasibility: "adea2188-0b91-41ef-8de6-824bb8543569",
  unit: "4afdb82c-c5ed-4ba8-9a83-064df923f6a9",
  category: "b5e9c05d-a178-460c-b4db-928d5060ff6d", // "Project Category"
  submitter: "a47ad6ec-9fe5-4886-b5ce-6fc5333d404b", // "Your Name"
} as const;

/**
 * The published rubric weights, mirrored from the ClickUp "Weighted Score"
 * formula: (A1..A4 × 0.1 + B1..B4 × 0.075 + C1..C3 × 0.1) × 20.
 * Used only as a fallback when the API omits the formula value.
 */
export function computeWeightedScore(rubric: {
  a1: number; a2: number; a3: number; a4: number;
  b1: number; b2: number; b3: number; b4: number;
  c1: number; c2: number; c3: number;
}): number {
  const a = (rubric.a1 + rubric.a2 + rubric.a3 + rubric.a4) * 0.1;
  const b = (rubric.b1 + rubric.b2 + rubric.b3 + rubric.b4) * 0.075;
  const c = (rubric.c1 + rubric.c2 + rubric.c3) * 0.1;
  return (a + b + c) * 20;
}
