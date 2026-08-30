"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity, InterviewStatus } from "@prisma/client";
import { CreateInterviewSchema } from "@/schemas/interview";
import type { CreateInterviewInput } from "@/schemas/interview";
import { generateInterviewQuestions } from "@/lib/ai/interview-questions";
import { revalidatePath } from "next/cache";

// ─── Create Interview with AI Generated Questions ────────────────────────────

export async function createInterview(data: CreateInterviewInput) {
  const userId = await requireAuth();
  const parsed = CreateInterviewSchema.parse(data);

  // 1. Generate structured interview questions with Gemini
  const questions = await generateInterviewQuestions(
    parsed.role,
    parsed.type,
    parsed.level,
    parsed.techStack,
  );

  if (!questions || questions.length === 0) {
    throw new Error("Failed to generate interview questions. Please try again.");
  }

  // 2. Persist Interview and InterviewQuestions in a transactional write
  const interview = await db.$transaction(async (tx) => {
    return tx.interview.create({
      data: {
        role: parsed.role,
        type: parsed.type,
        level: parsed.level,
        techStack: parsed.techStack,
        status: InterviewStatus.READY,
        userId,
        questions: {
          create: questions.map((q) => ({
            questionText: q.questionText,
            topic: q.topic,
            difficulty: q.difficulty,
            orderIndex: q.orderIndex,
            expectedAnswer: q.expectedAnswer,
          })),
        },
      },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
      },
    });
  });

  // 3. Create Audit Trail Log
  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.INTERVIEW,
    entityId: interview.id,
    userId,
    metadata: {
      role: interview.role,
      type: interview.type,
      level: interview.level,
      techStack: interview.techStack,
      questionCount: questions.length,
    },
  });

  revalidatePath("/interviews");
  revalidatePath("/dashboard");

  return {
    success: true,
    interviewId: interview.id,
    role: interview.role,
    questionCount: questions.length,
  };
}

// ─── Update Interview Status (Lifecycle Transition) ──────────────────────────

export async function updateInterviewStatus(
  interviewId: string,
  status: InterviewStatus,
) {
  const userId = await requireAuth();

  const existing = await db.interview.findUnique({
    where: { id: interviewId },
    select: { userId: true },
  });

  if (!existing) throw new Error("Interview not found.");
  if (existing.userId !== userId) throw new Error("Unauthorized.");

  const updated = await db.interview.update({
    where: { id: interviewId },
    data: { status },
  });

  revalidatePath(`/interviews/${interviewId}`);
  revalidatePath("/interviews");
  return updated;
}

// ─── Get Current Student's Interviews ─────────────────────────────────────────

export async function getUserInterviews() {
  const userId = await requireAuth();

  return db.interview.findMany({
    where: { userId },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
      feedback: { select: { totalScore: true, id: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Get Single Interview by ID (Ownership Enforced) ──────────────────────────

export async function getInterview(interviewId: string) {
  const userId = await requireAuth();

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
      feedback: true,
      _count: { select: { questions: true } },
    },
  });

  if (!interview) {
    throw new Error("Interview session not found.");
  }

  if (interview.userId !== userId) {
    throw new Error("Unauthorized: You do not have permission to view this interview.");
  }

  return interview;
}

// ─── Save Interview Transcript ────────────────────────────────────────────────

export async function saveTranscript(
  interviewId: string,
  transcript: string,
  duration?: number,
) {
  const userId = await requireAuth();

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    select: { userId: true },
  });

  if (!interview) throw new Error("Interview not found.");
  if (interview.userId !== userId) throw new Error("Unauthorized.");

  const updated = await db.interview.update({
    where: { id: interviewId },
    data: {
      transcript,
      duration,
      status: InterviewStatus.COMPLETED,
    },
  });

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.INTERVIEW,
    entityId: interviewId,
    userId,
    metadata: { action: "save_transcript", duration },
  });

  revalidatePath(`/interviews/${interviewId}`);
  revalidatePath("/interviews");
  return updated;
}

// ─── Delete Interview ─────────────────────────────────────────────────────────

export async function deleteInterview(interviewId: string) {
  const userId = await requireAuth();

  const existing = await db.interview.findUnique({
    where: { id: interviewId },
    select: { userId: true, role: true },
  });

  if (!existing) throw new Error("Interview not found.");
  if (existing.userId !== userId) throw new Error("Unauthorized.");

  await db.interview.delete({
    where: { id: interviewId },
  });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.INTERVIEW,
    entityId: interviewId,
    userId,
    metadata: { role: existing.role },
  });

  revalidatePath("/interviews");
  revalidatePath("/dashboard");

  return { success: true };
}

// ─── Get Public/Community Interviews ──────────────────────────────────────────

export async function getLatestInterviews(limit = 10) {
  return db.interview.findMany({
    where: { status: InterviewStatus.COMPLETED },
    include: {
      user: { select: { firstName: true, lastName: true, imageUrl: true } },
      feedback: { select: { totalScore: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
  });
}
