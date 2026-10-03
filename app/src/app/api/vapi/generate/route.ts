import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateInterviewQuestions } from "@/lib/ai/interview-questions";
import { VapiGenerateQuestionsSchema } from "@/schemas/interview";
import {
  checkRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Called by Vapi AI platform during the interview workflow
// to dynamically generate interview questions via Gemini
export async function POST(req: Request) {
  try {
    const rateLimit = await checkRateLimit(req, "AI_GENERATE");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = VapiGenerateQuestionsSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid interview request payload" },
        { status: 400 },
      );
    }

    const { role, type, level, techStack, interviewId } = parsed.data;

    // Generate questions via Gemini (Phase 5 implementation)
    const questions = await generateInterviewQuestions(
      role,
      type,
      level,
      techStack ?? [],
    );

    // Persist to DB as InterviewQuestion records
    await db.interviewQuestion.createMany({
      data: questions.map((q) => ({
        ...q,
        interviewId,
      })),
    });

    // Return questions in Vapi-compatible format
    const response = NextResponse.json({
      questions: questions.map((q) => q.questionText),
    });
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[Vapi Generate] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 },
    );
  }
}
