import { z } from "zod";
import { JobLevel, JobType } from "@prisma/client";
import { JOB_CATEGORIES } from "@/lib/constants";

export const CreateJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(50, "Description must be at least 50 characters"),
  location: z.string().min(2, "Location is required"),
  category: z.enum(JOB_CATEGORIES as unknown as [string, ...string[]]),
  level: z.nativeEnum(JobLevel),
  type: z.nativeEnum(JobType),
  salary: z.string().optional(),
  applyLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  isVisible: z.boolean().optional(),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;
