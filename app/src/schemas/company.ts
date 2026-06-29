import { z } from "zod";
import { CompanyRole } from "@prisma/client";
import { COMPANY_SIZES, INDUSTRIES } from "@/lib/constants";

// ─── Company CRUD Schemas ─────────────────────────────────────────────────────

export const CreateCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(100),
  email: z.string().email("Must be a valid email address"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(1000).optional(),
  industry: z.enum(INDUSTRIES as unknown as [string, ...string[]]).optional(),
  size: z.enum(COMPANY_SIZES as unknown as [string, ...string[]]).optional(),
});

export const UpdateCompanySchema = CreateCompanySchema.partial();

// ─── Member Management Schemas ────────────────────────────────────────────────

export const InviteMemberSchema = z.object({
  companyId: z.string().cuid(),
  userId: z.string().min(1, "User ID is required"),
  role: z.nativeEnum(CompanyRole),
});

export const InviteByEmailSchema = z.object({
  companyId: z.string().cuid(),
  email: z.string().email("Must be a valid email address"),
  role: z.nativeEnum(CompanyRole).refine(
    (r) => r !== CompanyRole.OWNER,
    "Cannot invite someone as OWNER. Use transfer ownership.",
  ),
});

export const UpdateMemberRoleSchema = z.object({
  memberId: z.string().cuid(),
  role: z.nativeEnum(CompanyRole).refine(
    (r) => r !== CompanyRole.OWNER,
    "Cannot directly assign OWNER role. Transfer ownership instead.",
  ),
});

export const TransferOwnershipSchema = z.object({
  companyId: z.string().cuid(),
  newOwnerMemberId: z.string().cuid("Must be a valid member ID"),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
export type InviteByEmailInput = z.infer<typeof InviteByEmailSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;
export type TransferOwnershipInput = z.infer<typeof TransferOwnershipSchema>;
