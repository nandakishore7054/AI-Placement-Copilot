import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";
import { IdSchema } from "./common";

export const ApplyJobSchema = z.object({
  jobId: IdSchema,
});

export const UpdateApplicationStatusSchema = z.object({
  applicationId: IdSchema,
  companyId: IdSchema,
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().trim().max(2000, "Notes cannot exceed 2000 characters").optional(),
});

export const WithdrawApplicationSchema = z.object({
  applicationId: IdSchema,
});

export const GetRecruiterApplicationsFilterSchema = z.object({
  companyId: IdSchema.optional(),
  jobId: IdSchema.optional(),
});

export type ApplyJobInput = z.infer<typeof ApplyJobSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof UpdateApplicationStatusSchema>;
export type WithdrawApplicationInput = z.infer<typeof WithdrawApplicationSchema>;
export type GetRecruiterApplicationsFilterInput = z.input<typeof GetRecruiterApplicationsFilterSchema>;
