"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { generateInterviewFeedback } from "@/lib/ai/interview-feedback";

// ─── Generate Interview Feedback (Idempotent) ─────────────────────────────────

/**
 * Generates and persists AI evaluation for a completed interview session.
 *
 * Requirements:
 * - Student must be the owner of the interview.
 * - Interview must have a non-empty transcript.
 * - Idempotent: returns existing feedback if already generated (unless forceRegenerate = true).
 * - Saves structured dimensions, question-by-question analysis, strengths, weaknesses.
 */
export async function generateFeedback(
  interviewId: string,
  forceRegenerate: boolean = false,
) {
  const userId = await requireAuth();

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
      feedback: true,
    },
  });

  if (!interview) {
    throw new Error("Interview session not found.");
  }

  if (interview.userId !== userId) {
    throw new Error(
      "Unauthorized: You do not have permission to evaluate this interview.",
    );
  }

  // Idempotent guard: return existing feedback if not forcing regeneration
  if (interview.feedback && !forceRegenerate) {
    return interview.feedback;
  }

  if (!interview.transcript || interview.transcript.trim().length === 0) {
    throw new Error(
      "Cannot generate feedback: No interview transcript is available. Please conduct the voice interview session first.",
    );
  }

  if (interview.transcript.trim().length < 20) {
    throw new Error(
      "The recorded transcript is too short to evaluate. Please participate actively in the interview to receive a detailed evaluation.",
    );
  }

  if (!interview.questions || interview.questions.length === 0) {
    throw new Error(
      "No interview questions found for this session to evaluate against.",
    );
  }

  // Call Gemini structured feedback generator
  const aiFeedback = await generateInterviewFeedback(
    interviewId,
    interview.transcript,
    interview.questions,
    {
      role: interview.role,
      level: interview.level,
      techStack: interview.techStack,
    },
  );

  // Persist using upsert to guarantee idempotency and avoid duplicates
  const feedback = await db.feedback.upsert({
    where: { interviewId },
    create: {
      interviewId,
      userId,
      totalScore: aiFeedback.totalScore,
      categoryScores: aiFeedback.categoryScores,
      strengths: aiFeedback.strengths,
      areasForImprovement: aiFeedback.areasForImprovement,
      finalAssessment: aiFeedback.finalAssessment,
      questionsAnalysis: aiFeedback.questionsAnalysis,
    },
    update: {
      totalScore: aiFeedback.totalScore,
      categoryScores: aiFeedback.categoryScores,
      strengths: aiFeedback.strengths,
      areasForImprovement: aiFeedback.areasForImprovement,
      finalAssessment: aiFeedback.finalAssessment,
      questionsAnalysis: aiFeedback.questionsAnalysis,
    },
  });

  // Audit logging
  await createAuditLog({
    action: AuditAction.AI_GENERATE,
    entityType: AuditEntity.FEEDBACK,
    entityId: feedback.id,
    userId,
    metadata: {
      interviewId,
      totalScore: feedback.totalScore,
      regenerated: Boolean(forceRegenerate && interview.feedback),
    },
  });

  revalidatePath(`/interviews/${interviewId}`);
  revalidatePath(`/interviews/${interviewId}/feedback`);
  revalidatePath("/interviews");

  return feedback;
}

// ─── Get Feedback by Interview ID ─────────────────────────────────────────────

export async function getFeedback(interviewId: string) {
  const userId = await requireAuth();

  const feedback = await db.feedback.findUnique({
    where: { interviewId },
    include: {
      interview: {
        include: {
          questions: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });

  if (!feedback) return null;

  if (feedback.userId !== userId && feedback.interview.userId !== userId) {
    throw new Error(
      "Unauthorized: You do not have permission to view this feedback.",
    );
  }

  return feedback;
}

// ─── Get User's Complete Feedback History ────────────────────────────────────

export async function getUserFeedbackHistory() {
  const userId = await requireAuth();

  return db.feedback.findMany({
    where: { userId },
    include: {
      interview: {
        select: {
          id: true,
          role: true,
          type: true,
          level: true,
          techStack: true,
          duration: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
