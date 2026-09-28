import { z } from "zod";
import { RecommendationType } from "@prisma/client";

export const RecommendationMetadataSchema = z.object({
  actionUrl: z.string().optional().describe("Internal application URL to take action, e.g. /jobs, /interviews/new, /skill-gap"),
  actionLabel: z.string().optional().describe("Button label, e.g. View Matching Job, Practice Mock Interview, Bridge Skill"),
  jobId: z.string().optional(),
  skill: z.string().optional(),
  tag: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
});

export const RecommendationItemSchema = z.object({
  type: z.nativeEnum(RecommendationType),
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(400),
  relevanceScore: z.number().min(0.0).max(1.0),
  metadata: RecommendationMetadataSchema.optional(),
});

export const RecommendationsResultSchema = z.object({
  recommendations: z.array(RecommendationItemSchema).min(3).max(8),
});

export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;
export type RecommendationsResult = z.infer<typeof RecommendationsResultSchema>;
