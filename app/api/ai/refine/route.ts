import { NextRequest, NextResponse } from "next/server";
import { refinementChat, ChatMessage } from "@/lib/mindrouter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Validate message format
    const valid = messages.every(
      (m: ChatMessage) =>
        typeof m.role === "string" &&
        typeof m.content === "string" &&
        ["user", "assistant"].includes(m.role)
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    if (!process.env.MINDROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI refinement is not yet configured", unconfigured: true },
        { status: 503 }
      );
    }

    const reply = await refinementChat(messages);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("POST /api/ai/refine error:", error);
    const message =
      error instanceof Error ? error.message : "AI refinement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
