import { z } from "zod";
import { UserRole } from "@prisma/client";
import { IdSchema } from "./common";

export const ModerationJobsFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
});

export const AdminUsersFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().trim().max(200).optional(),
});

export const UpdateUserRoleSchema = z.object({
  targetUserId: IdSchema,
  newRole: z.nativeEnum(UserRole),
});

export type ModerationJobsFilterInput = z.input<typeof ModerationJobsFilterSchema>;
export type AdminUsersFilterInput = z.input<typeof AdminUsersFilterSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
