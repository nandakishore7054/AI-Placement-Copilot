import { z } from "zod";

export const FeedbackCategoryScoreSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  comment: z.string(),
});

export const QuestionAnalysisSchema = z.object({
  questionId: z.string(),
  response: z.string(),
  score: z.number().min(0).max(100),
  suggestion: z.string(),
});

export const FeedbackSchema = z.object({
  totalScore: z.number().min(0).max(100),
  categoryScores: z.array(FeedbackCategoryScoreSchema).length(5),
  strengths: z.array(z.string()).min(1).max(5),
  areasForImprovement: z.array(z.string()).min(1).max(5),
  finalAssessment: z.string().min(10),
  questionsAnalysis: z.array(QuestionAnalysisSchema),
});

export type FeedbackInput = z.infer<typeof FeedbackSchema>;
