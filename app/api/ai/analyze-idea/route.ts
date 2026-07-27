import { NextRequest, NextResponse } from "next/server";
import { analyzeIdea, MindRouterError } from "@/lib/mindrouter";

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

    // Upstream detail belongs in the server log, not on a submitter's
    // screen — before this, a raw `MindRouter 422: {"detail":...}` was
    // rendered verbatim in the wizard (#249).
    if (error instanceof MindRouterError) {
      return NextResponse.json(
        {
          error:
            "The AI assistant couldn't analyze that idea just now. You can " +
            "try again, or continue filling out the form without it — " +
            "nothing about your submission depends on this step.",
          upstream: true,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
