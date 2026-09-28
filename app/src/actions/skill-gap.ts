"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { AnalyzeSkillGapSchema } from "@/schemas/skill-gap";
import { analyzeSkillGapWithAi } from "@/lib/ai/skill-gap-analyzer";
import { isTransientGeminiError } from "@/lib/ai/gemini";

export interface SkillGapActionResult {
  success: boolean;
  skillGap?: any;
  error?: string;
  isTransient?: boolean;
}

// ─── Analyze Skill Gap ────────────────────────────────────────────────────────

/**
 * Performs a comprehensive AI-driven Skill Gap Analysis for the authenticated student.
 * Aggregates existing Profile, Resume, and Interview history without manual re-entry.
 */
export async function analyzeSkillGap(
  targetRole: string,
): Promise<SkillGapActionResult> {
  try {
    const userId = await requireAuth();

    const parsed = AnalyzeSkillGapSchema.safeParse({ targetRole: targetRole?.trim() });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid target role.",
      };
    }

    const cleanRole = parsed.data.targetRole;

    // 1. Aggregate existing student profile data
    const profile = await db.studentProfile.findUnique({
      where: { userId },
    });

    // 2. Aggregate existing resume & parsed ATS analysis
    const resume = await db.resume.findUnique({
      where: { userId },
      include: { analysis: true },
    });

    // 3. Aggregate recent interview feedback & performance
    const interviews = await db.interview.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      include: {
        feedback: { select: { totalScore: true, strengths: true, areasForImprovement: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    // 4. Sample real platform market requirements for this or related roles
    const marketJobs = await db.job.findMany({
      where: {
        isVisible: true,
        OR: [
          { title: { contains: cleanRole, mode: "insensitive" } },
          { category: { contains: cleanRole, mode: "insensitive" } },
        ],
      },
      select: {
        title: true,
        description: true,
      },
      take: 3,
    });

    // Assemble context payload
    const candidateContext = {
      profileSkills: profile?.skills || [],
      bio: profile?.bio,
      education: profile?.education,
      yearsOfExperience: profile?.yearsOfExperience,
      resumeText: resume?.extractedText,
      resumeKeywords: resume?.analysis?.keywordsFound || [],
      resumeStrengths: resume?.analysis?.strengths || [],
      interviewPerformance: interviews.map((i) => ({
        role: i.role,
        techStack: i.techStack,
        score: i.feedback?.totalScore,
      })),
      marketJobSamples: marketJobs,
    };

    // 5. Execute AI analysis with tiered failover and backoff
    const aiResult = await analyzeSkillGapWithAi(cleanRole, candidateContext);

    // 6. Persist to Prisma SkillGap model
    const skillGap = await db.skillGap.create({
      data: {
        userId,
        targetRole: aiResult.targetRole,
        currentSkills: aiResult.currentSkills,
        requiredSkills: aiResult.requiredSkills,
        missingSkills: aiResult.missingSkills,
        matchPercentage: aiResult.matchPercentage,
        recommendations: aiResult.recommendations,
        proficiencyMap: {
          scores: aiResult.proficiencyMap,
          details: aiResult.skillDetails,
          improvingSkills: aiResult.improvingSkills,
          summary: aiResult.summary,
        },
      },
    });

    // 7. Audit log creation
    await createAuditLog({
      action: AuditAction.AI_GENERATE,
      entityType: AuditEntity.SKILL_GAP,
      entityId: skillGap.id,
      userId,
      metadata: {
        targetRole: cleanRole,
        matchPercentage: skillGap.matchPercentage,
        missingSkillsCount: skillGap.missingSkills.length,
      },
    });

    revalidatePath("/skill-gap");
    revalidatePath("/dashboard");
    revalidatePath("/career");

    return {
      success: true,
      skillGap,
    };
  } catch (error: any) {
    console.error("[analyzeSkillGap] Action error:", error);

    if (isTransientGeminiError(error)) {
      return {
        success: false,
        error: "AI skill gap analysis is temporarily unavailable due to high demand. Please try again in a moment.",
        isTransient: true,
      };
    }

    return {
      success: false,
      error: error?.message || "Failed to analyze skill gap. Please try again.",
    };
  }
}

// ─── Query Past Analyses ─────────────────────────────────────────────────────

export async function getSkillGaps() {
  const userId = await requireAuth();

  return db.skillGap.findMany({
    where: { userId },
    orderBy: { analyzedAt: "desc" },
  });
}

export async function getLatestSkillGap() {
  const userId = await requireAuth();

  return db.skillGap.findFirst({
    where: { userId },
    orderBy: { analyzedAt: "desc" },
  });
}

export async function getSkillGapById(id: string) {
  const userId = await requireAuth();

  const skillGap = await db.skillGap.findUnique({
    where: { id },
  });

  if (!skillGap) return null;

  if (skillGap.userId !== userId) {
    throw new Error("Unauthorized: You do not have permission to view this analysis.");
  }

  return skillGap;
}

export async function deleteSkillGap(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();

    const existing = await db.skillGap.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) return { success: false, error: "Analysis not found." };
    if (existing.userId !== userId) return { success: false, error: "Unauthorized." };

    await db.skillGap.delete({
      where: { id },
    });

    revalidatePath("/skill-gap");
    revalidatePath("/dashboard");
    revalidatePath("/career");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteSkillGap] Action error:", err);
    return { success: false, error: err?.message || "Failed to delete analysis" };
  }
}
