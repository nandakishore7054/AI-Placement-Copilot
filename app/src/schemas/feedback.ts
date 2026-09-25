import { z } from "zod";

// ─── Feedback AI Generation Schemas ──────────────────────────────────────────

export const CategoryScoreSchema = z.object({
  name: z.string().describe("Dimension name: e.g. Technical Correctness, Communication & Articulation, Problem Solving, Confidence & Composure, Clarity & Structured Delivery"),
  score: z.number().int().min(0).max(100).describe("Score out of 100"),
  comment: z.string().describe("Specific feedback explaining the score for this category based on transcript evidence"),
});

export const QuestionAnalysisSchema = z.object({
  questionId: z.string().describe("The exact ID of the InterviewQuestion being analyzed"),
  response: z.string().describe("Summary or direct excerpt of how the candidate answered this question"),
  score: z.number().int().min(0).max(100).describe("Score out of 100 for this specific answer"),
  suggestion: z.string().describe("Actionable advice on how the candidate could improve their answer to this question"),
});

export const InterviewFeedbackAiResponseSchema = z.object({
  totalScore: z.number().int().min(0).max(100).describe("Overall interview performance score out of 100"),
  categoryScores: z
    .array(CategoryScoreSchema)
    .length(5)
    .describe("Exactly 5 core assessment dimensions"),
  strengths: z
    .array(z.string())
    .min(2)
    .max(8)
    .describe("Key candidate strengths demonstrated in the interview"),
  areasForImprovement: z
    .array(z.string())
    .min(2)
    .max(8)
    .describe("Specific areas where the candidate needs improvement"),
  finalAssessment: z
    .string()
    .min(30)
    .describe("Comprehensive evaluation summary, hiring recommendation rationale, and overall feedback"),
  questionsAnalysis: z
    .array(QuestionAnalysisSchema)
    .describe("Per-question analysis matching every interview question"),
});

export type CategoryScore = z.infer<typeof CategoryScoreSchema>;
export type QuestionAnalysis = z.infer<typeof QuestionAnalysisSchema>;
export type InterviewFeedbackAiResponse = z.infer<
  typeof InterviewFeedbackAiResponseSchema
>;
