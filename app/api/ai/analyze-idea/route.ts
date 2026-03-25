import { NextRequest, NextResponse } from "next/server";
import { analyzeIdea } from "@/lib/mindrouter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea } = body;

    if (!idea || typeof idea !== "string" || idea.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide an idea description (at least 10 characters)" },
        { status: 400 }
      );
    }

    // Check if MindRouter is configured
    if (!process.env.MINDROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI analysis is not yet configured", unconfigured: true },
        { status: 503 }
      );
    }

    const analysis = await analyzeIdea(idea.trim());
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("POST /api/ai/analyze-idea error:", error);
    const message =
      error instanceof Error ? error.message : "AI analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
