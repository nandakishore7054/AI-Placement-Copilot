import { z } from "zod";
import { POPULAR_LOCATIONS, JOB_CATEGORIES } from "@/lib/constants";

export const StudentProfileSchema = z.object({
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  skills: z
    .array(z.string().min(1))
    .min(1, "Add at least one skill")
    .max(30, "Maximum 30 skills"),
  education: z.string().max(2000).optional(),
  preferredLocations: z
    .array(z.enum(POPULAR_LOCATIONS as unknown as [string, ...string[]]))
    .max(5, "Maximum 5 preferred locations"),
  preferredCategories: z
    .array(z.enum(JOB_CATEGORIES as unknown as [string, ...string[]]))
    .max(5, "Maximum 5 preferred categories"),
  expectedSalary: z.string().max(50).optional(),
  linkedinUrl: z
    .string()
    .url("Must be a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url("Must be a valid GitHub URL")
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
});

export const UpdateStudentProfileSchema = StudentProfileSchema.partial();

export type StudentProfileInput = z.infer<typeof StudentProfileSchema>;
export type UpdateStudentProfileInput = z.infer<
  typeof UpdateStudentProfileSchema
>;
