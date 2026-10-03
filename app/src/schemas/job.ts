import { z } from "zod";
import { JobLevel, JobType } from "@prisma/client";
import { JOB_CATEGORIES, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { IdSchema } from "./common";

export const CreateJobSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().trim().min(50, "Description must be at least 50 characters"),
  location: z.string().trim().min(2, "Location is required").max(100),
  category: z.enum(JOB_CATEGORIES as unknown as [string, ...string[]]),
  level: z.nativeEnum(JobLevel),
  type: z.nativeEnum(JobType),
  salary: z.string().trim().max(100).optional(),
  applyLink: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
});

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  isVisible: z.boolean().optional(),
});

export const JobFiltersSchema = z.object({
  search: z.string().trim().max(200).optional(),
  category: z.string().trim().optional(),
  location: z.string().trim().optional(),
  level: z.nativeEnum(JobLevel).or(z.literal("")).optional(),
  type: z.nativeEnum(JobType).or(z.literal("")).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(DEFAULT_PAGE_SIZE),
});

export const SemanticSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters long")
    .max(500, "Search query cannot exceed 500 characters"),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;
export type JobFiltersInput = z.input<typeof JobFiltersSchema>;
export type SemanticSearchInput = z.input<typeof SemanticSearchSchema>;
