import { z } from "zod";
import { InterviewType, JobLevel, QuestionDifficulty, InterviewStatus } from "@prisma/client";
import { IdSchema } from "./common";

export const CreateInterviewSchema = z.object({
  role: z.string().trim().min(2, "Role is required (min 2 chars)").max(100, "Role name is too long"),
  type: z.nativeEnum(InterviewType),
  level: z.nativeEnum(JobLevel),
  techStack: z
    .array(z.string().trim().min(1))
    .min(1, "Select at least one technology")
    .max(10, "Maximum 10 technologies"),
});

export const UpdateInterviewStatusSchema = z.object({
  interviewId: IdSchema,
  status: z.nativeEnum(InterviewStatus),
});

export const GeneratedQuestionSchema = z.object({
  questionText: z.string().trim().min(5, "Question text is required"),
  topic: z.string().trim().min(2, "Topic is required"),
  difficulty: z.nativeEnum(QuestionDifficulty),
  orderIndex: z.number().int().nonnegative(),
  expectedAnswer: z.string().trim().optional(),
});

export const GeneratedQuestionsListSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).min(3).max(10),
});

export const SaveTranscriptSchema = z.object({
  interviewId: IdSchema,
  transcript: z.string().trim().min(1, "Transcript cannot be empty"),
  duration: z.coerce.number().int().nonnegative().optional(),
});

export const VapiGenerateQuestionsSchema = z.object({
  role: z.string().trim().min(2, "Role is required").max(100),
  type: z.nativeEnum(InterviewType),
  level: z.nativeEnum(JobLevel),
  techStack: z.array(z.string().trim()).default([]),
  interviewId: IdSchema,
});

export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
export type UpdateInterviewStatusInput = z.infer<typeof UpdateInterviewStatusSchema>;
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type SaveTranscriptInput = z.infer<typeof SaveTranscriptSchema>;
export type VapiGenerateQuestionsInput = z.infer<typeof VapiGenerateQuestionsSchema>;
