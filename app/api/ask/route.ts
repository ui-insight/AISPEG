import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agent/loop";
import { checkRate } from "@/lib/agent/rate-limit";
import { hashIp, logAgentQuery, type AgentOutcome } from "@/lib/agent/log";
import { currentMindRouterModel, type ChatMessage } from "@/lib/mindrouter";

const ALLOWED_HISTORY_ROLES = new Set(["user", "assistant"]);
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

const MINDROUTER_OUTAGE_MESSAGE =
  "The AI assistant is temporarily unavailable. Try browsing /portfolio for active projects, or refresh and try again in a moment.";

interface RawHistoryMessage {
  role?: unknown;
  content?: unknown;
}

function sanitizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];
  const out: ChatMessage[] = [];
  for (const m of history.slice(-MAX_HISTORY_MESSAGES)) {
    const raw = m as RawHistoryMessage;
    if (
      typeof raw.role === "string" &&
      typeof raw.content === "string" &&
      ALLOWED_HISTORY_ROLES.has(raw.role)
    ) {
      out.push({
        role: raw.role as "user" | "assistant",
        content: raw.content.slice(0, MAX_MESSAGE_LENGTH),
      });
    }
  }
  return out;
}

function clientIp(request: NextRequest): string {
  // Trust the leftmost X-Forwarded-For entry when behind the reverse
  // proxy on openera.insight.uidaho.edu; fall back to the request's
  // direct IP otherwise.
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const ip = clientIp(request);
  const ipHash = hashIp(ip);
  const audience = "public" as const;
  const model = currentMindRouterModel();

  let message = "";
  let history: ChatMessage[] = [];
  try {
    const body = await request.json();
    message = typeof body?.message === "string" ? body.message.trim() : "";
    history = sanitizeHistory(body?.history);
  } catch {
    return finalize({
      ipHash,
      audience,
      message,
      latencyMs: Date.now() - startedAt,
      outcome: "bad_request",
      httpStatus: 400,
      errorMessage: "Request body was not valid JSON.",
      payload: { error: "Invalid JSON body" },
      model,
    });
  }

  if (message.length === 0) {
    return finalize({
      ipHash,
      audience,
      message,
      latencyMs: Date.now() - startedAt,
      outcome: "bad_request",
      httpStatus: 400,
      errorMessage: "missing message",
      payload: { error: "message is required" },
      model,
    });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return finalize({
      ipHash,
      audience,
      message,
      latencyMs: Date.now() - startedAt,
      outcome: "bad_request",
      httpStatus: 400,
      errorMessage: "message too long",
      payload: {
        error: `message must be ${MAX_MESSAGE_LENGTH} characters or fewer`,
      },
      model,
    });
  }

  const rate = checkRate(ipHash, audience);
  if (!rate.allowed) {
    return finalize({
      ipHash,
      audience,
      message,
      latencyMs: Date.now() - startedAt,
      outcome: "rate_limited",
      httpStatus: 429,
      errorMessage: `over ${rate.limit}/hr`,
      payload: {
        error: `Rate limit exceeded (${rate.limit}/hour). Try again in ${rate.retryAfterSeconds} seconds.`,
        retryAfterSeconds: rate.retryAfterSeconds,
      },
      headers: {
        "Retry-After": String(rate.retryAfterSeconds),
        "X-RateLimit-Limit": String(rate.limit),
        "X-RateLimit-Remaining": "0",
      },
      model,
    });
  }

  if (!process.env.MINDROUTER_API_KEY) {
    return finalize({
      ipHash,
      audience,
      message,
      latencyMs: Date.now() - startedAt,
      outcome: "unconfigured",
      httpStatus: 503,
      errorMessage: "MINDROUTER_API_KEY not set",
      payload: {
        error:
          "The conversational agent is not configured on this environment.",
        unconfigured: true,
      },
      model,
    });
  }

  try {
    const result = await runAgent({ message, history, audience });
    const toolErrors = result.toolCalls.filter((t) => !t.ok);
    const outcome: AgentOutcome =
      toolErrors.length > 0 ? "tool_error" : "ok";
    const errorMessage =
      toolErrors.length > 0
        ? toolErrors.map((t) => `${t.name}: ${t.error}`).join("; ")
        : null;

    return finalize({
      ipHash,
      audience,
      message,
      latencyMs: Date.now() - startedAt,
      outcome,
      httpStatus: 200,
      response: result.response,
      toolCalls: result.toolCalls.map((t) => t.name),
      citationCount: result.citations.length,
      iterations: result.iterations,
      truncated: result.truncated,
      errorMessage,
      payload: result,
      model,
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : String(error);
    // Tool errors are caught inside the loop and turned into refusals,
    // so anything bubbling out of runAgent is a MindRouter-side failure
    // (network error, auth error, malformed response, etc.).
    console.error("POST /api/ask error:", error);
    return finalize({
      ipHash,
      audience,
      message,
      latencyMs: Date.now() - startedAt,
      outcome: "mindrouter_error",
      httpStatus: 200, // friendly fallback — don't 500 the chat widget
      response: MINDROUTER_OUTAGE_MESSAGE,
      payload: {
        response: MINDROUTER_OUTAGE_MESSAGE,
        citations: [],
        toolCalls: [],
        iterations: 0,
        truncated: false,
        fallback: true,
      },
      errorMessage: detail,
      model,
    });
  }
}

interface FinalizeArgs {
  ipHash: string;
  audience: "public" | "internal";
  message: string;
  latencyMs: number;
  outcome: AgentOutcome;
  httpStatus: number;
  response?: string | null;
  toolCalls?: string[];
  citationCount?: number;
  iterations?: number;
  truncated?: boolean;
  errorMessage?: string | null;
  payload: unknown;
  headers?: Record<string, string>;
  model: string;
}

async function finalize(args: FinalizeArgs): Promise<NextResponse> {
  // Log first; if logging fails it just no-ops (logAgentQuery never throws).
  await logAgentQuery({
    ipHash: args.ipHash,
    audience: args.audience,
    message: args.message,
    response: args.response ?? null,
    toolCalls: args.toolCalls ?? [],
    citationCount: args.citationCount ?? 0,
    iterations: args.iterations ?? 0,
    truncated: args.truncated ?? false,
    latencyMs: args.latencyMs,
    outcome: args.outcome,
    httpStatus: args.httpStatus,
    model: args.model,
    errorMessage: args.errorMessage ?? null,
  });
  return NextResponse.json(args.payload, {
    status: args.httpStatus,
    headers: args.headers,
  });
}
