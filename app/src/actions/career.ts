"use server";

// Career server actions — full implementation in Phase 6

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { GenerateRoadmapSchema } from "@/schemas/career";
import type { GenerateRoadmapInput } from "@/schemas/career";

export async function generateCareerRoadmap(data: GenerateRoadmapInput) {
  const userId = await requireAuth();
  GenerateRoadmapSchema.parse(data);

  // Phase 6: full implementation
  // 1. Fetch SkillGap + StudentProfile for context
  // 2. Call generateCareerRoadmap() from lib/ai/career-roadmap-generator.ts
  // 3. Create CareerRoadmap record
  // 4. Log AI_GENERATE audit event
  throw new Error("generateCareerRoadmap: Not implemented yet. Implement in Phase 6.");
}

export async function getCareerRoadmaps() {
  const userId = await requireAuth();

  return db.careerRoadmap.findMany({
    where: { userId, isActive: true },
    orderBy: { generatedAt: "desc" },
  });
}

export async function updateRoadmapProgress(
  roadmapId: string,
  milestoneIndex: number,
  completed: boolean,
) {
  const userId = await requireAuth();

  const roadmap = await db.careerRoadmap.findUnique({
    where: { id: roadmapId },
    select: { userId: true, milestones: true, progress: true },
  });

  if (!roadmap) throw new Error("Roadmap not found.");
  if (roadmap.userId !== userId) throw new Error("Unauthorized.");

  const milestones = roadmap.milestones as Array<{
    title: string;
    completed: boolean;
    [key: string]: unknown;
  }>;

  if (milestoneIndex < 0 || milestoneIndex >= milestones.length) {
    throw new Error("Invalid milestone index.");
  }

  milestones[milestoneIndex].completed = completed;

  const completedCount = milestones.filter((m) => m.completed).length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  return db.careerRoadmap.update({
    where: { id: roadmapId },
    data: { milestones: milestones as unknown as import("@prisma/client").Prisma.InputJsonValue, progress },
  });
}

export async function getCareerInsights(limit = 10) {
  return db.careerInsight.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
  });
}
