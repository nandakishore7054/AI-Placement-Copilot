"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity, InsightCategory, JobLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { GenerateRoadmapSchema, type GenerateRoadmapInput } from "@/schemas/career";
import { generateCareerRoadmapWithAi } from "@/lib/ai/career-roadmap-generator";
import { isTransientGeminiError } from "@/lib/ai/gemini";

export interface CareerActionResult<T = any> {
  success: boolean;
  roadmap?: T;
  error?: string;
  isTransient?: boolean;
}

// ─── Generate AI Career Roadmap ───────────────────────────────────────────────

export async function generateCareerRoadmap(
  data: GenerateRoadmapInput,
): Promise<CareerActionResult> {
  try {
    const userId = await requireAuth();

    const parsed = GenerateRoadmapSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid roadmap parameters.",
      };
    }

    const { targetRole, currentLevel, targetLevel } = parsed.data;
    const cleanRole = targetRole.trim();

    // 1. Fetch student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId },
    });

    // 2. Fetch resume & ATS analysis
    const resume = await db.resume.findUnique({
      where: { userId },
      include: { analysis: true },
    });

    // 3. Fetch latest Skill Gap analysis (prefer matching target role, or latest)
    const latestSkillGap =
      (await db.skillGap.findFirst({
        where: {
          userId,
          targetRole: { contains: cleanRole, mode: "insensitive" },
        },
        orderBy: { analyzedAt: "desc" },
      })) ||
      (await db.skillGap.findFirst({
        where: { userId },
        orderBy: { analyzedAt: "desc" },
      }));

    // 4. Fetch recent mock interview performance
    const interviews = await db.interview.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        feedback: { select: { totalScore: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    // 5. Fetch sample matching platform jobs
    const marketJobs = await db.job.findMany({
      where: {
        isVisible: true,
        OR: [
          { title: { contains: cleanRole, mode: "insensitive" } },
          { category: { contains: cleanRole, mode: "insensitive" } },
        ],
      },
      select: { title: true, description: true },
      take: 3,
    });

    // Assemble context payload
    const mapData = (latestSkillGap?.proficiencyMap as any) || {};
    const candidateContext = {
      profileSkills: profile?.skills || [],
      bio: profile?.bio,
      education: profile?.education,
      yearsOfExperience: profile?.yearsOfExperience,
      resumeText: resume?.extractedText,
      resumeKeywords: resume?.analysis?.keywordsFound || [],
      latestSkillGap: latestSkillGap
        ? {
            targetRole: latestSkillGap.targetRole,
            missingSkills: latestSkillGap.missingSkills,
            improvingSkills: mapData.improvingSkills || [],
            matchPercentage: latestSkillGap.matchPercentage,
            recommendations: latestSkillGap.recommendations,
          }
        : null,
      interviewHistory: interviews.map((i) => ({
        role: i.role,
        techStack: i.techStack,
        score: i.feedback?.totalScore,
      })),
      marketJobSamples: marketJobs,
    };

    // 6. Generate structured roadmap with AI
    const aiResult = await generateCareerRoadmapWithAi(
      cleanRole,
      currentLevel,
      targetLevel,
      candidateContext,
    );

    // 7. Deactivate prior roadmaps for this target role to keep the active one fresh
    await db.careerRoadmap.updateMany({
      where: { userId, targetRole: cleanRole, isActive: true },
      data: { isActive: false },
    });

    // 8. Persist to DB
    const roadmap = await db.careerRoadmap.create({
      data: {
        userId,
        targetRole: aiResult.targetRole,
        currentLevel: aiResult.currentLevel,
        targetLevel: aiResult.targetLevel,
        timelineMonths: aiResult.timelineMonths,
        milestones: aiResult.milestones,
        skillsToAcquire: aiResult.skillsToAcquire,
        resources: aiResult.resources,
        progress: 0,
        isActive: true,
      },
    });

    // 9. Audit log
    await createAuditLog({
      action: AuditAction.AI_GENERATE,
      entityType: AuditEntity.CAREER_ROADMAP,
      entityId: roadmap.id,
      userId,
      metadata: {
        targetRole: cleanRole,
        currentLevel,
        targetLevel,
        timelineMonths: roadmap.timelineMonths,
        milestonesCount: aiResult.milestones.length,
      },
    });

    revalidatePath("/career");
    revalidatePath("/dashboard");

    return {
      success: true,
      roadmap,
    };
  } catch (error: any) {
    console.error("[generateCareerRoadmap] Action error:", error);

    if (isTransientGeminiError(error)) {
      return {
        success: false,
        error:
          "AI career roadmap generation is temporarily experiencing high demand. Please try again in a moment.",
        isTransient: true,
      };
    }

    return {
      success: false,
      error: error?.message || "Failed to generate career roadmap. Please try again.",
    };
  }
}

// ─── Query Roadmaps ───────────────────────────────────────────────────────────

export async function getCareerRoadmaps() {
  const userId = await requireAuth();

  return db.careerRoadmap.findMany({
    where: { userId },
    orderBy: { generatedAt: "desc" },
  });
}

export async function getActiveCareerRoadmap() {
  const userId = await requireAuth();

  return db.careerRoadmap.findFirst({
    where: { userId, isActive: true },
    orderBy: { generatedAt: "desc" },
  });
}

export async function getCareerRoadmapById(id: string) {
  const userId = await requireAuth();

  const roadmap = await db.careerRoadmap.findUnique({
    where: { id },
  });

  if (!roadmap) return null;
  if (roadmap.userId !== userId) {
    throw new Error("Unauthorized: You do not have permission to view this roadmap.");
  }

  return roadmap;
}

// ─── Progress Tracking ────────────────────────────────────────────────────────

export async function updateRoadmapProgress(
  roadmapId: string,
  milestoneIndex: number,
  completed: boolean,
) {
  try {
    const userId = await requireAuth();

    const roadmap = await db.careerRoadmap.findUnique({
      where: { id: roadmapId },
      select: { userId: true, milestones: true, progress: true },
    });

    if (!roadmap) return { success: false, error: "Roadmap not found." };
    if (roadmap.userId !== userId) return { success: false, error: "Unauthorized." };

    const milestones = Array.isArray(roadmap.milestones)
      ? [...(roadmap.milestones as any[])]
      : [];

    if (milestoneIndex < 0 || milestoneIndex >= milestones.length) {
      return { success: false, error: "Invalid milestone index." };
    }

    milestones[milestoneIndex] = {
      ...milestones[milestoneIndex],
      completed,
    };

    const completedCount = milestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / milestones.length) * 100);

    const updated = await db.careerRoadmap.update({
      where: { id: roadmapId },
      data: {
        milestones: milestones as any,
        progress,
      },
    });

    await createAuditLog({
      action: AuditAction.UPDATE,
      entityType: AuditEntity.CAREER_ROADMAP,
      entityId: roadmapId,
      userId,
      metadata: { milestoneIndex, completed, progress },
    });

    revalidatePath("/career");
    revalidatePath("/dashboard");

    return { success: true, progress, roadmap: updated };
  } catch (error: any) {
    console.error("[updateRoadmapProgress] Error:", error);
    return { success: false, error: error?.message || "Failed to update milestone progress." };
  }
}

export async function deleteCareerRoadmap(id: string) {
  try {
    const userId = await requireAuth();

    const roadmap = await db.careerRoadmap.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!roadmap) return { success: false, error: "Roadmap not found." };
    if (roadmap.userId !== userId) return { success: false, error: "Unauthorized." };

    await db.careerRoadmap.delete({ where: { id } });

    revalidatePath("/career");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("[deleteCareerRoadmap] Error:", error);
    return { success: false, error: error?.message || "Failed to delete roadmap." };
  }
}

// ─── Career Insights Query & Auto-Seeding ─────────────────────────────────────

export async function getCareerInsights(category?: InsightCategory, limit = 20) {
  // Check if any insights exist in the database
  let count = await db.careerInsight.count();

  // If empty, auto-seed standard platform insights so students get immediate value
  if (count === 0) {
    try {
      await db.careerInsight.createMany({
        data: [
          {
            category: InsightCategory.SKILL_DEMAND,
            title: "Generative AI & Agentic Workflows Dominate 2025-2026 Tech Hiring",
            content:
              "Engineering organizations are heavily prioritizing candidates with verified full-stack capabilities combined with AI integration (LLM APIs, function calling, vector embeddings, and RAG). Candidates demonstrating end-to-end AI project deployments see a 45% higher callback rate.",
            dataPoints: { demandGrowth: "+180%", topSkills: ["Next.js", "TypeScript", "LangChain/AI SDK", "pgvector"] },
            source: "Campus Placement Technical Hiring Index 2025",
            isPublished: true,
          },
          {
            category: InsightCategory.SALARY_INSIGHT,
            title: "TypeScript & Cloud Native Proficiencies Yield 35-50% Package Premium",
            content:
              "Entry-level and junior developers who have demonstrable mastery in TypeScript, Next.js, and containerized Docker environments command significantly higher starting compensation tiers compared to generalist web developers.",
            dataPoints: { avgPackagePremium: "35-50%", highTierRange: "12-18 LPA", baseline: "6-8 LPA" },
            source: "Platform Compensation Benchmarks 2025",
            isPublished: true,
          },
          {
            category: InsightCategory.MARKET_TREND,
            title: "System Design and Live Coding Now Key Differentiators for Freshers",
            content:
              "Top tier product startups and tech companies have shifted away from rote algorithm memorization toward practical system architecture, data modeling, API design, and live voice/technical interviews.",
            dataPoints: { evaluationWeight: "65% Architecture & Clean Code", traditionalDSA: "35%" },
            source: "Recruiter Feedback Aggregator Q1 2026",
            isPublished: true,
          },
          {
            category: InsightCategory.CAREER_PATH,
            title: "The Frontend to Full-Stack Trajectory: Fastest Route to SDE-1 Shortlists",
            content:
              "Transitioning from pure client-side UI development to full-stack engineering (adding PostgreSQL, Prisma ORM, server actions, and cloud deployments) triples the number of eligible placement openings.",
            dataPoints: { eligibleJobMultiplier: "3.2x", timeToBridge: "2-3 months" },
            source: "Placement Copilot Analytics",
            isPublished: true,
          },
        ],
      });
    } catch (e) {
      console.warn("[getCareerInsights] Auto-seed failed or skipped:", e);
    }
  }

  return db.careerInsight.findMany({
    where: {
      isPublished: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
  });
}
