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
    throw new Error(`MindRouter ${res.status}: ${text}`);
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
  jsonMode?: boolean
): Promise<string> {
  const messages: ChatMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: userMessage });

  const response = await chatCompletion({
    messages,
    json_mode: jsonMode,
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
 * Analyze a free-text application idea via MindRouter and return structured
 * suggestions for the wizard.
 */
export async function analyzeIdea(ideaText: string): Promise<IdeaAnalysis> {
  const raw = await ask(ideaText, ANALYSIS_SYSTEM_PROMPT, true);

  try {
    return JSON.parse(raw) as IdeaAnalysis;
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
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content ?? "";
}
