"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { uploadResumePdf, deleteFromCloudinary } from "@/lib/cloudinary";
import { extractTextFromPdf } from "@/lib/pdf";
import { analyzeResumeWithAi } from "@/lib/ai/resume-analyzer";
import { saveResumeEmbedding } from "@/lib/ai/embeddings";
import { AuditAction, AuditEntity, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB

export async function getResume() {
  const userId = await requireAuth();

  return db.resume.findUnique({
    where: { userId },
    include: { analysis: true },
  });
}

export async function getResumeAnalysis(targetUserId?: string) {
  const callerId = await requireAuth();
  const userId = targetUserId || callerId;

  return db.resumeAnalysis.findFirst({
    where: {
      resume: {
        userId,
      },
    },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          userId: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function uploadResume(formData: FormData) {
  const userId = await requireAuth();

  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file provided. Please select a PDF file.");
  }

  // 1. Validate file size (Max 5MB)
  if (file.size > MAX_RESUME_SIZE) {
    throw new Error("File size exceeds 5MB limit. Please upload a smaller PDF.");
  }

  // 2. Validate file name and extension
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Invalid file format. Only PDF files are supported.");
  }

  // 3. Convert to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 4. Validate PDF header & extract raw text
  const extractResult = await extractTextFromPdf(buffer);

  // 5. Upload PDF file to Cloudinary (with resilient data URL fallback if storage is misconfigured)
  let fileUrl = "";
  try {
    const uploadResult = await uploadResumePdf(buffer, userId);
    fileUrl = uploadResult.url;
  } catch (error) {
    console.error(
      "[uploadResume] Cloudinary upload error/notice (falling back to data URL):",
      error instanceof Error ? error.message : error
    );
    const base64Data = buffer.toString("base64");
    fileUrl = `data:application/pdf;base64,${base64Data}`;
  }

  // 6. Upsert Resume in Prisma
  const resume = await db.resume.upsert({
    where: { userId },
    create: {
      userId,
      fileUrl,
      fileName: file.name,
      extractedText: extractResult.text || "",
    },
    update: {
      fileUrl,
      fileName: file.name,
      extractedText: extractResult.text || "",
    },
  });

  // 7. Generate vector embedding for semantic matching (non-blocking fallback)
  if (extractResult.text) {
    await saveResumeEmbedding(resume.id, extractResult.text);
  }

  // 8. Audit log event
  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.RESUME,
    entityId: resume.id,
    userId,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      pageCount: extractResult.numPages,
      charCount: extractResult.text.length,
    },
  });

  revalidatePath("/resume");
  revalidatePath("/profile");

  return {
    success: true,
    resume: {
      id: resume.id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      charCount: extractResult.text.length,
      pageCount: extractResult.numPages,
      updatedAt: resume.updatedAt,
    },
  };
}

export async function analyzeResume() {
  const userId = await requireAuth();

  const resume = await db.resume.findUnique({
    where: { userId },
    include: { analysis: true },
  });

  if (!resume) {
    throw new Error("No resume found. Please upload your resume PDF first.");
  }

  if (!resume.extractedText || resume.extractedText.trim().length < 20) {
    throw new Error(
      "Your resume contains insufficient text for AI analysis. Please upload a clear, text-based PDF."
    );
  }

  // 1. Run Gemini structured analysis
  const analysisResult = await analyzeResumeWithAi(resume.extractedText);

  // 2. Upsert structured ResumeAnalysis in Prisma
  const analysis = await db.resumeAnalysis.upsert({
    where: { resumeId: resume.id },
    create: {
      resumeId: resume.id,
      overallScore: analysisResult.overallScore,
      formatScore: analysisResult.formatScore,
      contentScore: analysisResult.contentScore,
      atsScore: analysisResult.atsScore,
      keywordsFound: analysisResult.keywordsFound,
      keywordsMissing: analysisResult.keywordsMissing,
      suggestions: analysisResult.suggestions,
      sectionScores: analysisResult.sectionScores,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
      rawAnalysis: (analysisResult.rawAnalysis ?? analysisResult) as Prisma.InputJsonValue,
    },
    update: {
      overallScore: analysisResult.overallScore,
      formatScore: analysisResult.formatScore,
      contentScore: analysisResult.contentScore,
      atsScore: analysisResult.atsScore,
      keywordsFound: analysisResult.keywordsFound,
      keywordsMissing: analysisResult.keywordsMissing,
      suggestions: analysisResult.suggestions,
      sectionScores: analysisResult.sectionScores,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
      rawAnalysis: (analysisResult.rawAnalysis ?? analysisResult) as Prisma.InputJsonValue,
      analyzedAt: new Date(),
    },
  });

  // 3. Ensure vector embedding is generated
  await saveResumeEmbedding(resume.id, resume.extractedText);

  // 4. Log AI_GENERATE audit log
  await createAuditLog({
    action: AuditAction.AI_GENERATE,
    entityType: AuditEntity.RESUME,
    entityId: resume.id,
    userId,
    metadata: {
      overallScore: analysis.overallScore,
      atsScore: analysis.atsScore,
      formatScore: analysis.formatScore,
      contentScore: analysis.contentScore,
    },
  });

  revalidatePath("/resume");
  revalidatePath("/dashboard");

  return { success: true, analysis };
}

export async function deleteResume() {
  const userId = await requireAuth();

  const resume = await db.resume.findUnique({ where: { userId } });
  if (!resume) throw new Error("No resume found.");

  // Delete from Cloudinary
  try {
    await deleteFromCloudinary(`ai-placement-copilot/resumes/resume-${userId}`, "raw");
  } catch (error) {
    console.error("[deleteResume] Cloudinary cleanup error:", error);
  }

  // Delete from DB (cascades to ResumeAnalysis)
  await db.resume.delete({ where: { userId } });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.RESUME,
    entityId: resume.id,
    userId,
    metadata: { fileName: resume.fileName },
  });

  revalidatePath("/resume");
  revalidatePath("/profile");

  return { success: true };
}
