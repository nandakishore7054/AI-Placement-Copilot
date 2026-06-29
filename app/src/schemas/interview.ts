import { z } from "zod";
import { InterviewType, JobLevel } from "@prisma/client";

export const CreateInterviewSchema = z.object({
  role: z.string().min(2, "Role is required").max(100),
  type: z.nativeEnum(InterviewType),
  level: z.nativeEnum(JobLevel),
  techStack: z
    .array(z.string().min(1))
    .min(1, "Select at least one technology")
    .max(10, "Maximum 10 technologies"),
});

export const SaveTranscriptSchema = z.object({
  interviewId: z.string().cuid(),
  transcript: z.string().min(1),
  duration: z.number().int().positive().optional(),
});

export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
export type SaveTranscriptInput = z.infer<typeof SaveTranscriptSchema>;
