"use server";

// Resume server actions — full implementation in Phase 4

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog, logUpload, logAiGeneration } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getResume() {
  const userId = await requireAuth();

  return db.resume.findUnique({
    where: { userId },
    include: { analysis: true },
  });
}

export async function deleteResume() {
  const userId = await requireAuth();

  const resume = await db.resume.findUnique({ where: { userId } });
  if (!resume) throw new Error("No resume found.");

  // Phase 4: delete from Cloudinary before DB record
  // await deleteFromCloudinary(publicId, "raw");

  await db.resume.delete({ where: { userId } });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.RESUME,
    entityId: resume.id,
    userId,
  });

  revalidatePath("/resume");
}

export async function uploadResume(_formData: FormData) {
  // Phase 4: full implementation
  // 1. Extract PDF from formData
  // 2. Upload to Cloudinary (uploadResumePdf)
  // 3. Extract text client-side, save extractedText
  // 4. Generate pgvector embedding (generateResumeEmbedding)
  // 5. Upsert Resume record
  throw new Error("uploadResume: Not implemented yet. Implement in Phase 4.");
}

export async function analyzeResume() {
  // Phase 4: full implementation
  // 1. Get resume by userId
  // 2. Call analyzeResume() from lib/ai/resume-analyzer.ts
  // 3. Create/update ResumeAnalysis record
  // 4. Log AI_GENERATE audit event
  throw new Error("analyzeResume: Not implemented yet. Implement in Phase 4.");
}

export { logUpload, logAiGeneration };
