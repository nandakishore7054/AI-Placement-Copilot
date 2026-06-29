import { z } from "zod";
import { JobLevel } from "@prisma/client";

export const GenerateRoadmapSchema = z.object({
  targetRole: z.string().min(2).max(100),
  currentLevel: z.nativeEnum(JobLevel),
  targetLevel: z.nativeEnum(JobLevel),
});

export const RoadmapMilestoneSchema = z.object({
  title: z.string(),
  description: z.string(),
  skills: z.array(z.string()),
  month: z.number().int().positive(),
  completed: z.boolean().default(false),
});

export const CareerRoadmapResultSchema = z.object({
  timelineMonths: z.number().int().positive(),
  milestones: z.array(RoadmapMilestoneSchema),
  skillsToAcquire: z.array(z.string()),
  resources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      type: z.enum(["course", "book", "tutorial", "project", "certification"]),
    }),
  ),
});

export const UpdateMilestoneSchema = z.object({
  roadmapId: z.string().cuid(),
  milestoneIndex: z.number().int().min(0),
  completed: z.boolean(),
});

export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapSchema>;
export type CareerRoadmapResultInput = z.infer<typeof CareerRoadmapResultSchema>;
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>;
