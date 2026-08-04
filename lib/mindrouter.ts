/**
 * MindRouter client — University of Idaho on-prem LLM inference.
 *
 * Uses the OpenAI-compatible /v1/chat/completions endpoint so we can leverage
 * structured JSON output mode for converting free-text ideas into structured
 * application metadata.
 */

const MINDROUTER_BASE =
  process.env.MINDROUTER_BASE_URL || "https://mindrouter.uidaho.edu";
const MINDROUTER_KEY = process.env.MINDROUTER_API_KEY || "";
// Default model. Bumped 2026-05-04 to qwen3.6-27b on Luke Sheneman's
// (IIDS / MindRouter operator) recommendation — qwen2.5 is "old school";
// qwen3.6-27b is the current "better" pick on the institutional
// deployment. Sibling option: qwen/qwen3.6-35b ("faster"); set
// MINDROUTER_MODEL to override per environment when latency outweighs
// accuracy.
const MINDROUTER_MODEL = process.env.MINDROUTER_MODEL || "qwen/qwen3.6-27b";

/** The model identifier requests will be sent to. Used by the agent log. */
export function currentMindRouterModel(): string {
  return MINDROUTER_MODEL;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON-encoded
  };
}

export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: ToolCall[];
    }
  | {
      role: "tool";
      content: string;
      tool_call_id: string;
    };

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>; // JSON Schema
  };
}

/**
 * How much of the token budget the model may spend on hidden reasoning
 * before it starts emitting content. The institutional default model is a
 * thinking model, so on structured-output calls this is the difference
 * between an answer and a 422 — see `analyzeIdea` below.
 */
export type ReasoningEffort = "none" | "low" | "medium" | "high";

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  /** When true, asks MindRouter to return valid JSON */
  json_mode?: boolean;
  /** OpenAI-compatible tool definitions */
  tools?: ToolDefinition[];
  tool_choice?: "auto" | "none" | "required";
  /**
   * Caps hidden reasoning so it can't consume the whole `max_tokens`
   * budget. Sent only when set; silently dropped if this MindRouter
   * deployment doesn't recognise it.
   */
  reasoning_effort?: ReasoningEffort;
}

/**
 * Upstream MindRouter failure. Carries the status and raw body so route
 * handlers can log the detail while showing users something human.
 */
export class MindRouterError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(`MindRouter ${status}: ${detail}`);
    this.name = "MindRouterError";
    this.status = status;
    this.detail = detail;
  }

  /**
   * True when the model burned its whole budget on reasoning before
   * producing content. Retryable with more headroom or less reasoning.
   */
  get isReasoningBudgetExhausted(): boolean {
    return (
      this.status === 422 &&
      /reasoning|thinking/i.test(this.detail) &&
      /token budget|max_tokens/i.test(this.detail)
    );
  }
}

/**
 * Set once we learn this deployment rejects `reasoning_effort`, so we stop
 * sending it for the rest of the process rather than paying a failed
 * request per call.
 */
let reasoningEffortUnsupported = false;

/** Does this look like "you sent a parameter I don't know about"? */
function isUnknownParameterError(status: number, body: string): boolean {
  if (status !== 400 && status !== 422) return false;
  return (
    /reasoning_effort/i.test(body) &&
    /unknown|unsupported|unexpected|not permitted|extra_forbidden|invalid|no such/i.test(
      body
    )
  );
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call MindRouter chat completions endpoint.
 * Throws on network / auth errors.
 */
export async function chatCompletion(
  opts: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  if (!MINDROUTER_KEY) {
    throw new Error("MINDROUTER_API_KEY is not configured");
  }

  const body: Record<string, unknown> = {
    model: MINDROUTER_MODEL,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.max_tokens ?? 2048,
    stream: false,
  };

  if (opts.json_mode) {
    body.response_format = { type: "json_object" };
  }

  if (opts.tools && opts.tools.length > 0) {
    body.tools = opts.tools;
    body.tool_choice = opts.tool_choice ?? "auto";
  }

  const wantsReasoningEffort =
    opts.reasoning_effort !== undefined && !reasoningEffortUnsupported;
  if (wantsReasoningEffort) {
    body.reasoning_effort = opts.reasoning_effort;
  }

  const res = await fetch(`${MINDROUTER_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MINDROUTER_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const failure = new MindRouterError(res.status, text);

    // `reasoning_effort` is OpenAI-compatible but not guaranteed on every
    // MindRouter build. If this deployment doesn't take it, drop it for the
    // rest of the process and retry once — a call that worked before this
    // parameter existed must not start failing because of it.
    //
    // Order matters: the budget-exhaustion message names `reasoning_effort`
    // in its remediation advice, so it must be ruled out first or we'd
    // permanently disable a parameter that is in fact supported.
    if (
      wantsReasoningEffort &&
      !failure.isReasoningBudgetExhausted &&
      isUnknownParameterError(res.status, text)
    ) {
      reasoningEffortUnsupported = true;
      console.warn(
        "MindRouter rejected reasoning_effort; retrying without it and " +
          "omitting it for the remainder of this process."
      );
      return chatCompletion(opts);
    }

    throw failure;
  }

  return res.json();
}

/**
 * Convenience: send a single user message, optionally with a system prompt,
 * and return just the text content.
 */
export async function ask(
  userMessage: string,
  systemPrompt?: string,
  jsonMode?: boolean,
  opts?: Pick<
    ChatCompletionOptions,
    "max_tokens" | "temperature" | "reasoning_effort"
  >
): Promise<string> {
  const messages: ChatMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: userMessage });

  const response = await chatCompletion({
    messages,
    json_mode: jsonMode,
    ...opts,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ── Structured analysis types ────────────────────────────────

export interface IdeaAnalysis {
  summary: string;
  suggested_sensitivity: string[];
  suggested_complexity: string;
  suggested_userbase: string;
  suggested_auth: string;
  suggested_integrations: string[];
  suggested_data_sources: string[];
  suggested_university_systems: string[];
  suggested_output_types: string[];
  clarifying_questions: string[];
  similar_existing_tools: string[];
  risks_and_considerations: string[];
}

const ANALYSIS_SYSTEM_PROMPT = `You are an expert university IT architect at the University of Idaho. A user is describing an application idea they want to build. Analyze their idea and return structured JSON with these fields:

{
  "summary": "A clear 1-2 sentence summary of what they want to build",
  "suggested_sensitivity": ["array of applicable data sensitivity categories from: FERPA, HIPAA, PII, CUI, Public, Internal Only"],
  "suggested_complexity": "one of: Static content, Simple CRUD, Multi-source integration, Real-time / streaming",
  "suggested_userbase": "one of: Just me / my team, My department, College-wide, University-wide, External / public",
  "suggested_auth": "one of: No login needed, Simple shared password, University SSO, Role-based access, Multi-tenant / delegated admin",
  "suggested_integrations": ["array from: None / standalone, University APIs, External SaaS APIs, AI / LLM integration, File storage, Email / notifications"],
  "suggested_data_sources": ["array from: None / generates its own data, Banner / SIS, Canvas LMS, LDAP / Active Directory, Slate CRM, Research databases, Google Workspace, Flat files / spreadsheets, Custom / internal APIs"],
  "suggested_university_systems": ["array from: None, VandalWeb, Banner Student, Banner Finance, Banner HR, Canvas, Slate, DUO / MFA, CAS / SSO, Perceptive Content"],
  "suggested_output_types": ["array from: Read-only reporting, Creates / modifies records, Sends notifications, Generates documents, Triggers workflows, Exposes an API"],
  "clarifying_questions": ["2-4 questions that would help refine the requirements"],
  "similar_existing_tools": ["any existing university or commercial tools that do something similar"],
  "risks_and_considerations": ["key risks or compliance considerations to be aware of"]
}

Be conservative with sensitivity classifications — if student data is involved, include FERPA. If health data, include HIPAA. If personal identifiers, include PII.

Return ONLY valid JSON, no markdown fences.`;

/**
 * Token budget for idea analysis. The schema above is large and the default
 * model is a thinking model, so the 2048 default left no room for content
 * after reasoning — the failure reported in #249.
 */
const ANALYSIS_MAX_TOKENS = 4096;
/** Retry headroom when the first attempt still starves on reasoning. */
const ANALYSIS_RETRY_MAX_TOKENS = 8192;

/**
 * Strip markdown fences before parsing. The system prompt asks for bare
 * JSON, but thinking models fence their output often enough that treating
 * a fenced object as unparseable would throw away a good answer.
 *
 * Exported for other structured-output callers (scripts/infer-idea-requests.ts).
 */
export function parseJsonLoose(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) return JSON.parse(fenced[1].trim());

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("No JSON object found in response");
  }
}

/**
 * Analyze a free-text application idea via MindRouter and return structured
 * suggestions for the wizard.
 *
 * Throws `MindRouterError` when the upstream call fails — the caller is
 * responsible for turning that into something a submitter should read.
 */
export async function analyzeIdea(ideaText: string): Promise<IdeaAnalysis> {
  let raw: string;
  try {
    raw = await ask(ideaText, ANALYSIS_SYSTEM_PROMPT, true, {
      max_tokens: ANALYSIS_MAX_TOKENS,
      reasoning_effort: "low",
    });
  } catch (error) {
    // If reasoning still ate the budget — because this deployment ignores
    // reasoning_effort, or the idea is unusually involved — give it real
    // headroom once before surfacing a failure to the submitter.
    if (
      error instanceof MindRouterError &&
      error.isReasoningBudgetExhausted
    ) {
      console.warn(
        `analyzeIdea: reasoning exhausted ${ANALYSIS_MAX_TOKENS}-token budget; ` +
          `retrying at ${ANALYSIS_RETRY_MAX_TOKENS}.`
      );
      raw = await ask(ideaText, ANALYSIS_SYSTEM_PROMPT, true, {
        max_tokens: ANALYSIS_RETRY_MAX_TOKENS,
        reasoning_effort: "none",
      });
    } else {
      throw error;
    }
  }

  try {
    return parseJsonLoose(raw) as IdeaAnalysis;
  } catch {
    // If the model returned something that isn't valid JSON, wrap it
    return {
      summary: raw.slice(0, 300),
      suggested_sensitivity: [],
      suggested_complexity: "",
      suggested_userbase: "",
      suggested_auth: "",
      suggested_integrations: [],
      suggested_data_sources: [],
      suggested_university_systems: [],
      suggested_output_types: [],
      clarifying_questions: [],
      similar_existing_tools: [],
      risks_and_considerations: [],
    };
  }
}

// ── Conversational refinement ────────────────────────────────

const REFINEMENT_SYSTEM_PROMPT = `You are a friendly, knowledgeable IT consultant at the University of Idaho helping someone refine their application idea. You understand university systems (Banner, Canvas, Slate, CAS/SSO, VandalWeb), data governance (FERPA, HIPAA, PII, CUI), and modern web development.

Your goal is to help the user think through their idea by:
1. Asking clarifying questions about scope, users, and data
2. Pointing out compliance considerations they may not have thought of
3. Suggesting simpler alternatives when appropriate
4. Helping them articulate technical requirements in plain language

Be conversational, concise, and encouraging. Use short paragraphs. If you reference university systems, briefly explain what they are.`;

/**
 * Send a multi-turn conversation to MindRouter for refinement assistance.
 */
export async function refinementChat(
  messages: ChatMessage[]
): Promise<string> {
  const allMessages: ChatMessage[] = [
    { role: "system", content: REFINEMENT_SYSTEM_PROMPT },
    ...messages,
  ];

  const response = await chatCompletion({
    messages: allMessages,
    temperature: 0.5,
    // Same exposure as analyzeIdea: on a thinking model a 1024 budget can
    // be spent entirely on reasoning, returning empty content.
    max_tokens: 2048,
    reasoning_effort: "low",
  });

  return response.choices[0]?.message?.content ?? "";
}
