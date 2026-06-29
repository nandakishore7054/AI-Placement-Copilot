"use server";

// Interview server actions — full implementation in Phase 5

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity, InterviewStatus } from "@prisma/client";
import { CreateInterviewSchema } from "@/schemas/interview";
import type { CreateInterviewInput } from "@/schemas/interview";
import { revalidatePath } from "next/cache";

export async function createInterview(data: CreateInterviewInput) {
  const userId = await requireAuth();
  const parsed = CreateInterviewSchema.parse(data);

  const interview = await db.interview.create({
    data: { ...parsed, userId, status: InterviewStatus.DRAFT },
  });

  // Phase 5: generate InterviewQuestion[] via Gemini
  // const questions = await generateInterviewQuestions(...);
  // await db.interviewQuestion.createMany({ data: questions.map(q => ({ ...q, interviewId: interview.id })) });

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.INTERVIEW,
    entityId: interview.id,
    userId,
  });

  revalidatePath("/interviews");
  return interview;
}

export async function getUserInterviews() {
  const userId = await requireAuth();

  return db.interview.findMany({
    where: { userId },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
      feedback: { select: { totalScore: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInterview(interviewId: string) {
  const userId = await requireAuth();

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
      feedback: true,
    },
  });

  if (!interview) throw new Error("Interview not found.");
  if (interview.userId !== userId) throw new Error("Unauthorized.");

  return interview;
}

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

  if (!interview || interview.userId !== userId) throw new Error("Unauthorized.");

  return db.interview.update({
    where: { id: interviewId },
    data: {
      transcript,
      duration,
      status: InterviewStatus.COMPLETED,
    },
  });
}

export async function getLatestInterviews(limit = 10) {
  return db.interview.findMany({
    where: { status: InterviewStatus.COMPLETED },
    include: {
      user: { select: { firstName: true, lastName: true, imageUrl: true } },
      feedback: { select: { totalScore: true } },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
  });
}
