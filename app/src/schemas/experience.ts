import { z } from "zod";
import { JobLevel } from "@prisma/client";
import { JOB_CATEGORIES } from "@/lib/constants";

export const CreateExperienceSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(20),
  category: z.enum(JOB_CATEGORIES as unknown as [string, ...string[]]),
  level: z.nativeEnum(JobLevel),
  salary: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const UpdateExperienceSchema = CreateExperienceSchema.partial().extend({
  isVisible: z.boolean().optional(),
});

export type CreateExperienceInput = z.infer<typeof CreateExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof UpdateExperienceSchema>;
