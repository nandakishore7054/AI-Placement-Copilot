"use server";

// Skill Gap server actions — full implementation in Phase 6

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import { AnalyzeSkillGapSchema } from "@/schemas/skill-gap";

export async function analyzeSkillGap(targetRole: string) {
  const userId = await requireAuth();
  AnalyzeSkillGapSchema.parse({ targetRole });

  // Phase 6: full implementation
  // 1. Fetch StudentProfile (skills) + Resume (extractedText)
  // 2. Call analyzeSkillGap() from lib/ai/skill-gap-analyzer.ts
  // 3. Create SkillGap record
  // 4. Log AI_GENERATE audit event
  throw new Error("analyzeSkillGap: Not implemented yet. Implement in Phase 6.");
}

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
