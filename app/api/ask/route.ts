import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agent/loop";
import type { ChatMessage } from "@/lib/mindrouter";

const ALLOWED_HISTORY_ROLES = new Set(["user", "assistant"]);
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (message.length === 0) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `message must be ${MAX_MESSAGE_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    if (!process.env.MINDROUTER_API_KEY) {
      return NextResponse.json(
        {
          error:
            "The conversational agent is not configured on this environment.",
          unconfigured: true,
        },
        { status: 503 }
      );
    }

    const result = await runAgent({
      message,
      history: sanitizeHistory(body?.history),
      audience: "public",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/ask error:", error);
    const message =
      error instanceof Error ? error.message : "agent request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
