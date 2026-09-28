"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { generateRecommendationsWithAi } from "@/lib/ai/recommendation-engine";
import { isTransientGeminiError } from "@/lib/ai/gemini";

export interface RecommendationActionResult {
  success: boolean;
  count?: number;
  error?: string;
  isTransient?: boolean;
}

// ─── Query Recommendations ───────────────────────────────────────────────────

export async function getRecommendations() {
  const userId = await requireAuth();

  return db.recommendation.findMany({
    where: {
      userId,
      isDismissed: false,
    },
    orderBy: [
      { isActioned: "asc" },
      { relevanceScore: "desc" },
    ],
    take: 12,
  });
}

// ─── Action & Dismiss Tracking ───────────────────────────────────────────────

export async function actionRecommendation(recommendationId: string) {
  try {
    const userId = await requireAuth();

    const rec = await db.recommendation.findUnique({
      where: { id: recommendationId },
      select: { userId: true },
    });

    if (!rec) return { success: false, error: "Recommendation not found." };
    if (rec.userId !== userId) return { success: false, error: "Unauthorized." };

    await db.recommendation.update({
      where: { id: recommendationId },
      data: { isActioned: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/career");

    return { success: true };
  } catch (error: any) {
    console.error("[actionRecommendation] Error:", error);
    return { success: false, error: error?.message || "Failed to action recommendation." };
  }
}

export async function dismissRecommendation(recommendationId: string) {
  try {
    const userId = await requireAuth();

    const rec = await db.recommendation.findUnique({
      where: { id: recommendationId },
      select: { userId: true },
    });

    if (!rec) return { success: false, error: "Recommendation not found." };
    if (rec.userId !== userId) return { success: false, error: "Unauthorized." };

    await db.recommendation.update({
      where: { id: recommendationId },
      data: { isDismissed: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/career");

    return { success: true };
  } catch (error: any) {
    console.error("[dismissRecommendation] Error:", error);
    return { success: false, error: error?.message || "Failed to dismiss recommendation." };
  }
}

// ─── AI Recommendation Refresh Engine ─────────────────────────────────────────

export async function refreshRecommendations(): Promise<RecommendationActionResult> {
  try {
    const userId = await requireAuth();

    // 1. Fetch profile
    const profile = await db.studentProfile.findUnique({
      where: { userId },
      select: {
        skills: true,
        preferredCategories: true,
      },
    });

    // 2. Fetch resume & ATS analysis
    const resume = await db.resume.findUnique({
      where: { userId },
      include: { analysis: true },
    });

    // 3. Fetch latest Skill Gap analysis
    const skillGap = await db.skillGap.findFirst({
      where: { userId },
      orderBy: { analyzedAt: "desc" },
    });

    // 4. Fetch active Career Roadmap
    const activeRoadmap = await db.careerRoadmap.findFirst({
      where: { userId, isActive: true },
      orderBy: { generatedAt: "desc" },
    });

    // 5. Fetch recent applications
    const applications = await db.application.findMany({
      where: { userId },
      include: { job: { select: { title: true } } },
      take: 4,
    });

    // 6. Fetch recent interview scores
    const interviews = await db.interview.findMany({
      where: { userId, status: "COMPLETED" },
      include: { feedback: { select: { totalScore: true } } },
      take: 4,
    });

    // 7. Fetch active platform jobs for cross-referencing
    const availableJobs = await db.job.findMany({
      where: { isVisible: true },
      select: {
        id: true,
        title: true,
        category: true,
        level: true,
      },
      take: 5,
    });

    const mapData = (skillGap?.proficiencyMap as any) || {};
    const roadmapMilestones = Array.isArray(activeRoadmap?.milestones)
      ? (activeRoadmap?.milestones as any[])
      : [];
    const nextPendingMilestone = roadmapMilestones.find((m) => !m.completed);

    const context = {
      profileSkills: profile?.skills || [],
      preferredCategories: profile?.preferredCategories || [],
      resumeKeywords: resume?.analysis?.keywordsFound || [],
      resumeStrengths: resume?.analysis?.strengths || [],
      latestSkillGap: skillGap
        ? {
            targetRole: skillGap.targetRole,
            missingSkills: skillGap.missingSkills,
            improvingSkills: mapData.improvingSkills || [],
            matchPercentage: skillGap.matchPercentage,
          }
        : null,
      activeRoadmap: activeRoadmap
        ? {
            targetRole: activeRoadmap.targetRole,
            progress: activeRoadmap.progress,
            skillsToAcquire: activeRoadmap.skillsToAcquire,
            nextMilestoneTitle: nextPendingMilestone?.title,
          }
        : null,
      recentApplications: applications.map((a) => ({
        jobTitle: a.job.title,
        status: a.status,
      })),
      interviewScores: interviews.map((i) => ({
        role: i.role,
        score: i.feedback?.totalScore,
      })),
      availableJobs: availableJobs.map((j) => ({
        id: j.id,
        title: j.title,
        category: j.category,
        level: j.level,
      })),
    };

    // 8. Generate recommendations via AI
    const recs = await generateRecommendationsWithAi(userId, context);

    // 9. Remove stale un-actioned recommendations
    await db.recommendation.deleteMany({
      where: {
        userId,
        isActioned: false,
      },
    });

    // 10. Persist new recommendations
    if (recs.length > 0) {
      await db.recommendation.createMany({
        data: recs.map((item) => ({
          userId,
          type: item.type,
          title: item.title,
          description: item.description,
          relevanceScore: item.relevanceScore,
          metadata: (item.metadata || {}) as any,
          isActioned: false,
          isDismissed: false,
        })),
      });
    }

    // 11. Audit log
    await createAuditLog({
      action: AuditAction.AI_GENERATE,
      entityType: AuditEntity.RECOMMENDATION,
      entityId: userId,
      userId,
      metadata: { generatedCount: recs.length },
    });

    revalidatePath("/dashboard");
    revalidatePath("/career");

    return {
      success: true,
      count: recs.length,
    };
  } catch (error: any) {
    console.error("[refreshRecommendations] Action error:", error);

    if (isTransientGeminiError(error)) {
      return {
        success: false,
        error: "AI recommendations are temporarily experiencing high demand. Please try again in a moment.",
        isTransient: true,
      };
    }

    return {
      success: false,
      error: error?.message || "Failed to refresh recommendations. Please try again.",
    };
  }
}
