"use server";

// Feedback server actions — full implementation in Phase 5

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function generateFeedback(interviewId: string) {
  const userId = await requireAuth();

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  });

  if (!interview) throw new Error("Interview not found.");
  if (interview.userId !== userId) throw new Error("Unauthorized.");
  if (!interview.transcript) throw new Error("No transcript available yet.");

  // Phase 5: call generateInterviewFeedback() from lib/ai/interview-feedback.ts
  throw new Error("generateFeedback: Not implemented yet. Implement in Phase 5.");
}

export async function getFeedback(interviewId: string) {
  const userId = await requireAuth();

  const feedback = await db.feedback.findUnique({
    where: { interviewId },
    include: {
      interview: { select: { userId: true, role: true, type: true, level: true } },
    },
  });

  if (!feedback) return null;
  if (feedback.interview.userId !== userId) throw new Error("Unauthorized.");

  return feedback;
}

export async function getUserFeedbackHistory() {
  const userId = await requireAuth();

  return db.feedback.findMany({
    where: { userId },
    include: {
      interview: { select: { id: true, role: true, type: true, level: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export { AuditAction, AuditEntity };
