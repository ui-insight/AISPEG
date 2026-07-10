// lib/clickup-sync.ts
//
// The ClickUp → Postgres sync engine (read side of Sprint 3b, ADR 0003).
// Shared by scripts/sync-clickup.ts (cron/local) and the /internal/sync
// route handler ("Sync now" button), so both triggers exercise the same
// code path.
//
// Per project list: find the "Project Notes" task, upsert its ROI/people
// fields into clickup_projects, then upsert its comments (the dated
// status narrative) into clickup_status_updates. Then the backlog list:
// upsert every request task with its rubric values and weighted score.
//
// Failure posture: a list that fails to fetch aborts the run before its
// delete phase — stale data beats missing data. Lists without a notes
// task are warned about and skipped, never a hard failure.

import { query, queryOne } from "./db";
import { chatCompletion } from "./mindrouter";
import {
  CLICKUP_BACKLOG_LIST_ID,
  CLICKUP_PROJECT_LISTS,
} from "./clickup-map";
import {
  commentBodyText,
  computeWeightedScore,
  getDateField,
  getDropdownField,
  getFormulaField,
  getListTasks,
  getNumberField,
  getTaskComments,
  getTextField,
  getUrlField,
  getUsersField,
  PROJECT_FIELDS,
  PROJECT_NOTES_CUSTOM_ITEM_ID,
  RUBRIC_FIELDS,
  type ClickUpComment,
  type ClickUpTask,
} from "./clickup";

export interface SyncSummary {
  runId: number;
  startedAt: string;
  finishedAt: string;
  projects: number;
  statusUpdates: number;
  requests: number;
  warnings: string[];
}

function msEpochToIso(ms: string): string {
  return new Date(Number(ms)).toISOString();
}

function findNotesTask(tasks: ClickUpTask[]): ClickUpTask | null {
  return (
    tasks.find((t) => t.custom_item_id === PROJECT_NOTES_CUSTOM_ITEM_ID) ??
    tasks.find((t) => /project notes/i.test(t.name)) ??
    null
  );
}

async function syncProjectList(
  listId: string,
  listName: string,
  warnings: string[]
): Promise<{ updates: number; synced: boolean }> {
  const tasks = await getListTasks(listId);
  const notes = findNotesTask(tasks);
  if (!notes) {
    warnings.push(`${listName} (${listId}): no "Project Notes" task — skipped`);
    return { updates: 0, synced: false };
  }

  await query(
    `INSERT INTO clickup_projects (
       clickup_list_id, name, notes_task_id, roi_fte, roi_explanation,
       leads, pocs, stakeholders, repo_url, projected_completion,
       scope, business_unit, synced_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())
     ON CONFLICT (clickup_list_id) DO UPDATE SET
       name = EXCLUDED.name,
       notes_task_id = EXCLUDED.notes_task_id,
       roi_fte = EXCLUDED.roi_fte,
       roi_explanation = EXCLUDED.roi_explanation,
       leads = EXCLUDED.leads,
       pocs = EXCLUDED.pocs,
       stakeholders = EXCLUDED.stakeholders,
       repo_url = EXCLUDED.repo_url,
       projected_completion = EXCLUDED.projected_completion,
       scope = EXCLUDED.scope,
       business_unit = EXCLUDED.business_unit,
       synced_at = now()`,
    [
      listId,
      listName,
      notes.id,
      getNumberField(notes, PROJECT_FIELDS.roiFte),
      getTextField(notes, PROJECT_FIELDS.roiExplanation),
      JSON.stringify(getUsersField(notes, PROJECT_FIELDS.leads)),
      JSON.stringify(getUsersField(notes, PROJECT_FIELDS.pocs)),
      JSON.stringify(getUsersField(notes, PROJECT_FIELDS.stakeholders)),
      getUrlField(notes, PROJECT_FIELDS.repoUrl),
      getDateField(notes, PROJECT_FIELDS.projectedCompletion),
      getTextField(notes, PROJECT_FIELDS.scope),
      getDropdownField(notes, PROJECT_FIELDS.businessUnit),
    ]
  );

  const comments = await getTaskComments(notes.id);
  const seenCommentIds: string[] = [];
  for (const comment of comments) {
    const body = commentBodyText(comment);
    if (!body) continue; // empty after mention-stripping — nothing to show
    seenCommentIds.push(comment.id);
    await query(
      `INSERT INTO clickup_status_updates (
         comment_id, clickup_list_id, author, posted_at, body_text, synced_at
       ) VALUES ($1,$2,$3,$4,$5,now())
       ON CONFLICT (comment_id) DO UPDATE SET
         author = EXCLUDED.author,
         posted_at = EXCLUDED.posted_at,
         body_text = EXCLUDED.body_text,
         synced_at = now()`,
      [comment.id, listId, comment.user?.username ?? null, msEpochToIso(comment.date), body]
    );
  }

  // Deletes run only after this list fetched successfully, and only for
  // this list — comments deleted in ClickUp disappear from the site.
  await query(
    `DELETE FROM clickup_status_updates
     WHERE clickup_list_id = $1 AND NOT (comment_id = ANY($2::text[]))`,
    [listId, seenCommentIds]
  );

  await refreshStatusSummary(listId, listName, comments, warnings);

  return { updates: seenCommentIds.length, synced: true };
}

/**
 * Public status summary (ADR 0003, amended July 2026): the raw comments
 * are internal notes, so the public site renders a short MindRouter-
 * generated summary instead of the corpus. Regenerated only when the
 * comment stream changed since the last summarization; on MindRouter
 * failure the previous summary is kept (stale beats missing) and a
 * warning is surfaced in the run summary.
 */
async function refreshStatusSummary(
  listId: string,
  listName: string,
  comments: ClickUpComment[],
  warnings: string[]
): Promise<void> {
  if (comments.length === 0) return;

  // Comments arrive newest-first; the newest id fingerprints the stream.
  const newestId = comments[0]!.id;
  const existing = await queryOne<{ status_summary_source: string | null }>(
    `SELECT status_summary_source FROM clickup_projects WHERE clickup_list_id = $1`,
    [listId]
  );
  if (existing?.status_summary_source === newestId) return; // unchanged

  const recent = comments.slice(0, 12);
  const corpus = recent
    .map((c) => {
      const date = new Date(Number(c.date)).toISOString().slice(0, 10);
      const body = commentBodyText(c);
      return `[${date}] ${body}`;
    })
    .join("\n\n")
    .slice(0, 8000);

  const systemPrompt =
    "You write status summaries for a University of Idaho public website about institutional AI projects. Given internal status-update notes, write 2-4 plain sentences describing where the project stands: current state, recent progress, and the next step if one is stated. Factual, no hype. Each note is prefixed with its date; if the newest note is months old, describe it as the last reported state (e.g. \"As of March 2026, ...\") rather than implying it is current. Do not include email addresses, meeting links, scheduling chatter, or anything that reads as an internal aside. Do not invent details that are not in the notes. Output only the summary text.";
  const userPrompt = `Today is ${new Date().toISOString().slice(0, 10)}.\nProject: ${listName}\n\nInternal status-update notes, newest first:\n\n${corpus}\n\nWrite the public status summary now.`;

  try {
    let summary = "";
    // qwen3.6 is a thinking model: with a small max_tokens the reasoning
    // stream can exhaust the budget before any visible content is
    // emitted, yielding empty content with finish_reason "length". Give
    // it room, and retry once on an empty result.
    for (let attempt = 0; attempt < 2 && !summary; attempt++) {
      const res = await chatCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 8192,
      });
      summary = (res.choices[0]?.message?.content ?? "").trim();
    }
    if (!summary) throw new Error("empty summary returned");
    await query(
      `UPDATE clickup_projects
       SET status_summary = $2, status_summary_at = now(), status_summary_source = $3
       WHERE clickup_list_id = $1`,
      [listId, summary, newestId]
    );
  } catch (err) {
    warnings.push(
      `${listName} (${listId}): status summary not refreshed (${err instanceof Error ? err.message : String(err)}) — keeping previous summary`
    );
  }
}

async function syncBacklog(warnings: string[]): Promise<number> {
  const tasks = await getListTasks(CLICKUP_BACKLOG_LIST_ID, { includeClosed: true });
  const seenTaskIds: string[] = [];

  for (const task of tasks) {
    const rubric = {
      a1: getNumberField(task, RUBRIC_FIELDS.a1),
      a2: getNumberField(task, RUBRIC_FIELDS.a2),
      a3: getNumberField(task, RUBRIC_FIELDS.a3),
      a4: getNumberField(task, RUBRIC_FIELDS.a4),
      b1: getNumberField(task, RUBRIC_FIELDS.b1),
      b2: getNumberField(task, RUBRIC_FIELDS.b2),
      b3: getNumberField(task, RUBRIC_FIELDS.b3),
      b4: getNumberField(task, RUBRIC_FIELDS.b4),
      c1: getNumberField(task, RUBRIC_FIELDS.c1),
      c2: getNumberField(task, RUBRIC_FIELDS.c2),
      c3: getNumberField(task, RUBRIC_FIELDS.c3),
    };

    let weightedScore = getFormulaField(task, RUBRIC_FIELDS.weightedScore);
    let scoreSource: "clickup" | "computed" = "clickup";
    if (weightedScore === null) {
      const values = Object.values(rubric);
      if (values.every((v) => v !== null)) {
        weightedScore = computeWeightedScore(
          rubric as Record<keyof typeof rubric, number>
        );
        scoreSource = "computed";
        warnings.push(`${task.name} (${task.id}): weighted score computed locally (formula value missing)`);
      }
    }

    seenTaskIds.push(task.id);
    await query(
      `INSERT INTO clickup_requests (
         clickup_task_id, name, status, description, unit, submitter,
         category, feasibility,
         rubric_a1, rubric_a2, rubric_a3, rubric_a4,
         rubric_b1, rubric_b2, rubric_b3, rubric_b4,
         rubric_c1, rubric_c2, rubric_c3,
         weighted_score, score_source, date_created, date_updated, synced_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,now())
       ON CONFLICT (clickup_task_id) DO UPDATE SET
         name = EXCLUDED.name,
         status = EXCLUDED.status,
         description = EXCLUDED.description,
         unit = EXCLUDED.unit,
         submitter = EXCLUDED.submitter,
         category = EXCLUDED.category,
         feasibility = EXCLUDED.feasibility,
         rubric_a1 = EXCLUDED.rubric_a1, rubric_a2 = EXCLUDED.rubric_a2,
         rubric_a3 = EXCLUDED.rubric_a3, rubric_a4 = EXCLUDED.rubric_a4,
         rubric_b1 = EXCLUDED.rubric_b1, rubric_b2 = EXCLUDED.rubric_b2,
         rubric_b3 = EXCLUDED.rubric_b3, rubric_b4 = EXCLUDED.rubric_b4,
         rubric_c1 = EXCLUDED.rubric_c1, rubric_c2 = EXCLUDED.rubric_c2,
         rubric_c3 = EXCLUDED.rubric_c3,
         weighted_score = EXCLUDED.weighted_score,
         score_source = EXCLUDED.score_source,
         date_created = EXCLUDED.date_created,
         date_updated = EXCLUDED.date_updated,
         synced_at = now()`,
      [
        task.id,
        task.name,
        task.status.status,
        task.text_content?.trim() || null,
        getTextField(task, RUBRIC_FIELDS.unit),
        getTextField(task, RUBRIC_FIELDS.submitter),
        getDropdownField(task, RUBRIC_FIELDS.category),
        getDropdownField(task, RUBRIC_FIELDS.feasibility),
        rubric.a1, rubric.a2, rubric.a3, rubric.a4,
        rubric.b1, rubric.b2, rubric.b3, rubric.b4,
        rubric.c1, rubric.c2, rubric.c3,
        weightedScore,
        scoreSource,
        msEpochToIso(task.date_created),
        msEpochToIso(task.date_updated),
      ]
    );
  }

  await query(
    `DELETE FROM clickup_requests WHERE NOT (clickup_task_id = ANY($1::text[]))`,
    [seenTaskIds]
  );

  return seenTaskIds.length;
}

export async function runSync(trigger: "cron" | "manual"): Promise<SyncSummary> {
  const run = await queryOne<{ id: number; started_at: string }>(
    `INSERT INTO clickup_sync_runs (trigger) VALUES ($1) RETURNING id, started_at`,
    [trigger]
  );
  if (!run) throw new Error("failed to record sync run");

  const warnings: string[] = [];
  let projects = 0;
  let statusUpdates = 0;
  let requests = 0;

  try {
    for (const mapping of CLICKUP_PROJECT_LISTS) {
      const result = await syncProjectList(mapping.listId, mapping.listName, warnings);
      if (result.synced) {
        projects += 1;
        statusUpdates += result.updates;
      }
      console.log(
        `  ${result.synced ? "↳" : "!"} ${mapping.listName.padEnd(32)} ${
          result.synced ? `${result.updates} update${result.updates === 1 ? "" : "s"}` : "skipped"
        }`
      );
    }

    requests = await syncBacklog(warnings);
    console.log(`  ↳ ${"AI4UI New Project Requests".padEnd(32)} ${requests} requests`);

    const summary = { projects, statusUpdates, requests, warnings };
    const finished = await queryOne<{ finished_at: string }>(
      `UPDATE clickup_sync_runs
       SET finished_at = now(), ok = true, summary = $2
       WHERE id = $1 RETURNING finished_at`,
      [run.id, JSON.stringify(summary)]
    );

    return {
      runId: run.id,
      startedAt: new Date(run.started_at).toISOString(),
      finishedAt: finished ? new Date(finished.finished_at).toISOString() : new Date().toISOString(),
      projects,
      statusUpdates,
      requests,
      warnings,
    };
  } catch (err) {
    await query(
      `UPDATE clickup_sync_runs
       SET finished_at = now(), ok = false, error = $2
       WHERE id = $1`,
      [run.id, err instanceof Error ? err.message : String(err)]
    ).catch(() => {
      // recording the failure must not mask the original error
    });
    throw err;
  }
}
