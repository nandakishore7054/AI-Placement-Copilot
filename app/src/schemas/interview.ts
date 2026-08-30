import { z } from "zod";
import { InterviewType, JobLevel, QuestionDifficulty } from "@prisma/client";

export const CreateInterviewSchema = z.object({
  role: z.string().min(2, "Role is required (min 2 chars)").max(100, "Role name is too long"),
  type: z.nativeEnum(InterviewType),
  level: z.nativeEnum(JobLevel),
  techStack: z
    .array(z.string().min(1))
    .min(1, "Select at least one technology")
    .max(10, "Maximum 10 technologies"),
});

export const GeneratedQuestionSchema = z.object({
  questionText: z.string().min(5, "Question text is required"),
  topic: z.string().min(2, "Topic is required"),
  difficulty: z.nativeEnum(QuestionDifficulty),
  orderIndex: z.number().int().nonnegative(),
  expectedAnswer: z.string().optional(),
});

export const GeneratedQuestionsListSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).min(3).max(10),
});

export const SaveTranscriptSchema = z.object({
  interviewId: z.string().cuid(),
  transcript: z.string().min(1),
  duration: z.number().int().positive().optional(),
});

export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type SaveTranscriptInput = z.infer<typeof SaveTranscriptSchema>;
