import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateInterviewQuestions } from "@/lib/ai/interview-questions";


export const dynamic = "force-dynamic";

// Called by Vapi AI platform during the interview workflow
// to dynamically generate interview questions via Gemini
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Vapi sends assistant data and call context
    const { role, type, level, techStack, interviewId } = body;

    if (!role || !type || !level || !interviewId) {
      return NextResponse.json(
        { error: "Missing required fields: role, type, level, interviewId" },
        { status: 400 },
      );
    }

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
    return NextResponse.json({
      questions: questions.map((q) => q.questionText),
    });
  } catch (error) {
    console.error("[Vapi Generate] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 },
    );
  }
}
