// Agent loop — see Epic #107.
//
// Stateless, tool-using agent. Each turn:
//   1. Call MindRouter with the running message log + tool definitions.
//   2. If the response has tool_calls, execute each tool, append the
//      results as `tool` messages, and loop.
//   3. Otherwise, return the final assistant message + accumulated
//      citations.
//
// Capped at MAX_ITERATIONS to prevent runaway loops on a model that won't
// commit to a final answer.

import "server-only";
import { chatCompletion, type ChatMessage, type ToolCall } from "@/lib/mindrouter";
import { SYSTEM_PROMPT } from "./prompts/system";
import { searchPortfolioTool } from "./tools/search-portfolio";
import { lookupPortfolioEntryTool } from "./tools/lookup-portfolio-entry";
import { searchBlockersTool } from "./tools/search-blockers";
import { listActiveBlockersTool } from "./tools/list-active-blockers";
import { listStandardsTool } from "./tools/list-standards";
import { getStandardTool } from "./tools/get-standard";
import { listReportsTool } from "./tools/list-reports";
import { getReportTool } from "./tools/get-report";
import { listSiteAreasTool } from "./tools/list-site-areas";
import { listGovernanceProjectsTool } from "./tools/list-governance-projects";
import { lookupUdmTableTool } from "./tools/lookup-udm-table";
import { searchVocabularyTool } from "./tools/search-vocabulary";
import { lookupPillarTool } from "./tools/lookup-pillar";
import { lookupPriorityTool } from "./tools/lookup-priority";
import { listProjectsForPriorityTool } from "./tools/list-projects-for-priority";
import { listOpenIssuesTool } from "./tools/list-open-issues";
import { searchIssuesTool } from "./tools/search-issues";
import { getIssueTool } from "./tools/get-issue";
import { getProjectStatusTool } from "./tools/get-project-status";
import { listRequestedProjectsTool } from "./tools/list-requested-projects";
import { lookupSurveyThemesTool } from "./tools/lookup-survey-themes";
import { listSurveyCandidateProjectsTool } from "./tools/list-survey-candidate-projects";
import { createRegistry, type Audience, type ToolRegistry } from "./tools/registry";

const MAX_ITERATIONS = 6;

// Generous completion budget for the loop's calls: qwen3.6 is a thinking
// model, and the default 2048 leaves too little room for a final answer
// after a long reasoning stream over big tool results (the ClickUp
// summarizer hit the same wall — see lib/clickup-sync.ts).
const LOOP_MAX_TOKENS = 4096;

// One-shot corrective when the model answers without ever calling a tool.
// Observed failure (2026-07-24, qwen3.6-27b): the model *narrates* an
// intention — "I'll search for projects…" with empty section headers —
// instead of emitting tool_calls, and the narration becomes the final
// answer. The nudge explicitly permits the standard refusal so
// out-of-scope questions still resolve cleanly.
const NO_TOOLS_NUDGE =
  "You have not called any tools yet. Do not describe what you plan to do — either call the tool(s) needed to answer now, or output the standard refusal. Never answer with placeholders or empty section headers.";

export const publicRegistry: ToolRegistry = createRegistry([
  searchPortfolioTool,
  lookupPortfolioEntryTool,
  searchBlockersTool,
  listActiveBlockersTool,
  listStandardsTool,
  getStandardTool,
  listReportsTool,
  getReportTool,
  listSiteAreasTool,
  listGovernanceProjectsTool,
  lookupUdmTableTool,
  searchVocabularyTool,
  lookupPillarTool,
  lookupPriorityTool,
  listProjectsForPriorityTool,
  listOpenIssuesTool,
  searchIssuesTool,
  getIssueTool,
  getProjectStatusTool,
  listRequestedProjectsTool,
  lookupSurveyThemesTool,
  listSurveyCandidateProjectsTool,
]);

export interface Citation {
  tool: string;
  url: string;
  label?: string;
}

export interface ToolCallTrace {
  name: string;
  arguments: Record<string, unknown>;
  ok: boolean;
  error?: string;
}

export interface AgentResponse {
  response: string;
  citations: Citation[];
  toolCalls: ToolCallTrace[];
  iterations: number;
  truncated: boolean;
}

export interface RunOptions {
  message: string;
  history?: ChatMessage[];
  audience?: Audience;
  registry?: ToolRegistry;
}

function dedupeCitations(cites: Citation[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const c of cites) {
    const key = `${c.tool}::${c.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function safeParseArgs(raw: string): Record<string, unknown> {
  if (!raw || raw.trim() === "") return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

async function executeToolCall(
  call: ToolCall,
  registry: ToolRegistry,
  audience: Audience
): Promise<{
  message: ChatMessage;
  citations: Citation[];
  trace: ToolCallTrace;
}> {
  const args = safeParseArgs(call.function.arguments);
  const handler = registry.get(call.function.name);

  if (!handler) {
    const errMsg = `Unknown tool: ${call.function.name}`;
    return {
      message: {
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify({ error: errMsg }),
      },
      citations: [],
      trace: { name: call.function.name, arguments: args, ok: false, error: errMsg },
    };
  }

  try {
    const result = await handler.execute(args, { audience });
    const citations: Citation[] = [];
    if (result.canonicalUrl) {
      citations.push({ tool: call.function.name, url: result.canonicalUrl });
    }
    if (result.links) {
      for (const link of result.links) {
        citations.push({ tool: call.function.name, url: link.url, label: link.label });
      }
    }
    return {
      message: {
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify({
          ...((result.data as Record<string, unknown>) ?? {}),
          canonicalUrl: result.canonicalUrl,
        }),
      },
      citations,
      trace: { name: call.function.name, arguments: args, ok: true },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      message: {
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify({ error: message }),
      },
      citations: [],
      trace: { name: call.function.name, arguments: args, ok: false, error: message },
    };
  }
}

export async function runAgent(opts: RunOptions): Promise<AgentResponse> {
  const audience = opts.audience ?? "public";
  const registry = opts.registry ?? publicRegistry;

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(opts.history ?? []),
    { role: "user", content: opts.message },
  ];

  const tools = registry.list();
  const citations: Citation[] = [];
  const toolCalls: ToolCallTrace[] = [];
  let nudged = false;
  let needsSynthesis = false;
  let iterationsUsed = 0;

  for (let iter = 1; iter <= MAX_ITERATIONS; iter++) {
    iterationsUsed = iter;
    const response = await chatCompletion({
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
      max_tokens: LOOP_MAX_TOKENS,
    });

    const choice = response.choices[0];
    if (!choice) {
      return {
        response: "I couldn't generate a response. Please try again.",
        citations: dedupeCitations(citations),
        toolCalls,
        iterations: iter,
        truncated: false,
      };
    }

    const msg = choice.message;
    const calls = msg.tool_calls ?? [];

    if (calls.length === 0) {
      // Narration guard: a final answer before ANY tool has run is
      // either the narrate-instead-of-call failure or an out-of-scope
      // refusal. One corrective pass distinguishes them — the nudge
      // permits the refusal, so a clean refusal comes straight back.
      if (toolCalls.length === 0 && !nudged) {
        nudged = true;
        messages.push({ role: "assistant", content: msg.content ?? "" });
        messages.push({ role: "user", content: NO_TOOLS_NUDGE });
        continue;
      }
      const text = (msg.content ?? "").trim();
      // Empty final (the thinking stream can exhaust the completion
      // budget): force one synthesis turn instead of returning nothing.
      if (text === "") {
        needsSynthesis = true;
        break;
      }
      return {
        response: msg.content ?? "",
        citations: dedupeCitations(citations),
        toolCalls,
        iterations: iter,
        truncated: false,
      };
    }

    // Append the assistant's tool-call turn to the running log so the
    // model sees its own decision when we come back around.
    messages.push({
      role: "assistant",
      content: msg.content ?? null,
      tool_calls: calls,
    });

    // Execute each tool call sequentially. (Parallel would be nicer, but
    // sequentially keeps the citation order deterministic and avoids
    // surprising the eval harness in slice #112.)
    for (const call of calls) {
      const { message, citations: newCites, trace } = await executeToolCall(
        call,
        registry,
        audience
      );
      messages.push(message);
      citations.push(...newCites);
      toolCalls.push(trace);
    }
  }

  // Two ways to land here: the iteration cap was hit (truncated), or the
  // model returned an empty final message (needsSynthesis). Either way,
  // force a synthesis turn with tool_choice = "none" so the model has to
  // commit to text.
  const finalResponse = await chatCompletion({
    messages: [
      ...messages,
      {
        role: "user",
        content: needsSynthesis
          ? "Your previous message was empty. Write your answer now from the tool results above, or output the standard refusal if you don't have enough cited data."
          : "You've reached the tool-call limit. Synthesise your best answer from the tool results above, or refuse if you don't have enough cited data.",
      },
    ],
    tools,
    tool_choice: "none",
    temperature: 0.2,
    max_tokens: LOOP_MAX_TOKENS,
  });

  return {
    response:
      finalResponse.choices[0]?.message.content ??
      "I wasn't able to reach a conclusion within the tool-call limit.",
    citations: dedupeCitations(citations),
    toolCalls,
    iterations: iterationsUsed,
    truncated: !needsSynthesis,
  };
}
