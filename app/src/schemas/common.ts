import { z } from "zod";

/**
 * Reusable ID schema for cuids, uuids, or non-empty identifier strings.
 */
export const IdSchema = z.string().trim().min(1, "Identifier is required");

/**
 * Reusable email schema with lowercasing and trimming.
 */
export const EmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")
  .toLowerCase();

/**
 * Reusable pagination schema for query params or server actions.
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * General string search schema.
 */
export const SearchFilterSchema = z.object({
  search: z.string().trim().max(200).optional(),
});
