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

export const CreateStudentExperienceSchema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters").max(100),
  companyId: z.string().optional(),
  role: z.string().trim().min(2, "Role title must be at least 2 characters").max(100),
  category: z.enum(JOB_CATEGORIES as unknown as [string, ...string[]]),
  level: z.nativeEnum(JobLevel),
  salary: z.string().trim().max(100).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  overallOutcome: z.enum([
    "Offered / Accepted",
    "Offered / Declined",
    "Rejected",
    "In Process",
    "Deferred",
  ]),
  rounds: z.string().trim().min(5, "Please describe the interview rounds (min 5 characters)"),
  questions: z.string().trim().min(10, "Please share key questions or topics asked (min 10 characters)"),
  preparationStrategy: z.string().trim().min(10, "Please share your preparation strategy (min 10 characters)"),
  tips: z.string().trim().min(10, "Please share advice for your peers (min 10 characters)"),
});

export type CreateExperienceInput = z.infer<typeof CreateExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof UpdateExperienceSchema>;
export type ExperienceFiltersInput = z.input<typeof ExperienceFiltersSchema>;
export type CreateStudentExperienceInput = z.infer<typeof CreateStudentExperienceSchema>;
