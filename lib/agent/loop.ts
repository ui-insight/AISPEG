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
import { createRegistry, type Audience, type ToolRegistry } from "./tools/registry";

const MAX_ITERATIONS = 6;

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

  for (let iter = 1; iter <= MAX_ITERATIONS; iter++) {
    const response = await chatCompletion({
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
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

  // Hit the iteration cap — force a final synthesis turn with tool_choice
  // = "none" so the model has to commit to text.
  const finalResponse = await chatCompletion({
    messages: [
      ...messages,
      {
        role: "user",
        content:
          "You've reached the tool-call limit. Synthesise your best answer from the tool results above, or refuse if you don't have enough cited data.",
      },
    ],
    tools,
    tool_choice: "none",
    temperature: 0.2,
  });

  return {
    response:
      finalResponse.choices[0]?.message.content ??
      "I wasn't able to reach a conclusion within the tool-call limit.",
    citations: dedupeCitations(citations),
    toolCalls,
    iterations: MAX_ITERATIONS,
    truncated: true,
  };
}
