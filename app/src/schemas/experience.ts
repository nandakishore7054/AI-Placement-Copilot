import { z } from "zod";
import { JobLevel } from "@prisma/client";
import { JOB_CATEGORIES, DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const CreateExperienceSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  category: z.enum(JOB_CATEGORIES as unknown as [string, ...string[]]),
  level: z.nativeEnum(JobLevel),
  salary: z.string().trim().max(100).optional(),
  imageUrl: z.string().trim().url("Must be a valid image URL").optional().or(z.literal("")),
});

export const UpdateExperienceSchema = CreateExperienceSchema.partial().extend({
  isVisible: z.boolean().optional(),
});

export const ExperienceFiltersSchema = z.object({
  search: z.string().trim().max(200).optional(),
  category: z.string().trim().optional(),
  level: z.nativeEnum(JobLevel).or(z.literal("")).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(DEFAULT_PAGE_SIZE),
});

export type CreateExperienceInput = z.infer<typeof CreateExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof UpdateExperienceSchema>;
export type ExperienceFiltersInput = z.input<typeof ExperienceFiltersSchema>;
