import { z } from "zod";
import { AuditAction, AuditEntity } from "@prisma/client";
import { IdSchema } from "./common";

export const AuditLogFiltersSchema = z.object({
  userId: IdSchema.optional(),
  action: z.nativeEnum(AuditAction).optional(),
  entityType: z.nativeEnum(AuditEntity).optional(),
  entityId: IdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export type AuditLogFiltersInput = z.input<typeof AuditLogFiltersSchema>;
export type AuditLogFiltersOutput = z.output<typeof AuditLogFiltersSchema>;
