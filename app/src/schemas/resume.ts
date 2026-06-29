import { z } from "zod";

export const ResumeAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  formatScore: z.number().min(0).max(100),
  contentScore: z.number().min(0).max(100),
  atsScore: z.number().min(0).max(100),
  keywordsFound: z.array(z.string()),
  keywordsMissing: z.array(z.string()),
  suggestions: z.array(z.string()).min(1).max(10),
  sectionScores: z.record(z.number().min(0).max(100)),
  strengths: z.array(z.string()).min(1).max(5),
  weaknesses: z.array(z.string()).min(1).max(5),
  rawAnalysis: z.unknown().optional(),
});

export const UploadResumeSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().max(10 * 1024 * 1024, "File must be under 10MB"),
  mimeType: z.literal("application/pdf", {
    errorMap: () => ({ message: "Only PDF files are supported" }),
  }),
});

export type ResumeAnalysisInput = z.infer<typeof ResumeAnalysisSchema>;
export type UploadResumeInput = z.infer<typeof UploadResumeSchema>;
