"use server";

// Recommendations server actions — full implementation in Phase 6

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";

export async function getRecommendations() {
  const userId = await requireAuth();

  return db.recommendation.findMany({
    where: { userId, isActioned: false, isDismissed: false },
    orderBy: { relevanceScore: "desc" },
    take: 20,
  });
}

export async function actionRecommendation(recommendationId: string) {
  const userId = await requireAuth();

  const rec = await db.recommendation.findUnique({ where: { id: recommendationId } });
  if (!rec || rec.userId !== userId) throw new Error("Unauthorized.");

  return db.recommendation.update({
    where: { id: recommendationId },
    data: { isActioned: true },
  });
}

export async function dismissRecommendation(recommendationId: string) {
  const userId = await requireAuth();

  const rec = await db.recommendation.findUnique({ where: { id: recommendationId } });
  if (!rec || rec.userId !== userId) throw new Error("Unauthorized.");

  return db.recommendation.update({
    where: { id: recommendationId },
    data: { isDismissed: true },
  });
}

export async function refreshRecommendations() {
  // Phase 6: full implementation
  // 1. Fetch user context (profile, resume, applications, interviews, skillGaps)
  // 2. Call generateRecommendations() from lib/ai/recommendation-engine.ts
  // 3. UPSERT Recommendation[] records
  throw new Error("refreshRecommendations: Not implemented yet. Implement in Phase 6.");
}
