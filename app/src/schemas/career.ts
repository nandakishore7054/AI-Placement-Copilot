import { z } from "zod";
import { JobLevel } from "@prisma/client";

export const GenerateRoadmapSchema = z.object({
  targetRole: z
    .string()
    .min(2, "Target role must be at least 2 characters")
    .max(100, "Target role is too long"),
  currentLevel: z.nativeEnum(JobLevel).default(JobLevel.BEGINNER),
  targetLevel: z.nativeEnum(JobLevel).default(JobLevel.INTERMEDIATE),
});

export const RoadmapMilestoneSchema = z.object({
  id: z.string().optional(),
  title: z.string().describe("Milestone title, e.g. Core Fundamentals & Advanced State"),
  description: z.string().describe("Detailed description of this milestone objectives"),
  skills: z.array(z.string()).describe("Specific skills and technologies covered"),
  month: z.number().int().min(1).describe("Target sequence month (1, 2, 3...)"),
  completed: z.boolean().default(false),
  actionItems: z.array(z.string()).min(1).max(5).describe("Actionable tasks to complete"),
  projects: z.array(z.string()).min(1).max(3).describe("Concrete portfolio project to build"),
  interviewPrep: z.array(z.string()).min(1).max(4).describe("Key interview topics to master"),
});

export const RoadmapResourceSchema = z.object({
  title: z.string().describe("Name of the resource or platform"),
  url: z.string().optional().describe("URL link or reference doc"),
  type: z.enum([
    "course",
    "book",
    "tutorial",
    "project",
    "certification",
    "documentation",
    "practice",
  ]),
  description: z.string().optional().describe("Why this resource is recommended"),
});

export const CareerRoadmapResultSchema = z.object({
  targetRole: z.string(),
  currentLevel: z.nativeEnum(JobLevel),
  targetLevel: z.nativeEnum(JobLevel),
  timelineMonths: z.number().int().min(1).max(24),
  overview: z.string().min(20).describe("Executive summary of the career transition strategy"),
  milestones: z.array(RoadmapMilestoneSchema).min(3).max(8),
  skillsToAcquire: z.array(z.string()).min(2).max(20),
  resources: z.array(RoadmapResourceSchema).min(2).max(10),
});

export const UpdateMilestoneSchema = z.object({
  roadmapId: z.string(),
  milestoneIndex: z.number().int().min(0),
  completed: z.boolean(),
});

export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapSchema>;
export type RoadmapMilestone = z.infer<typeof RoadmapMilestoneSchema>;
export type RoadmapResource = z.infer<typeof RoadmapResourceSchema>;
export type CareerRoadmapResult = z.infer<typeof CareerRoadmapResultSchema>;
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>;
