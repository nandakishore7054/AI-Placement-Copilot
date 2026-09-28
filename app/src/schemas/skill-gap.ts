import { z } from "zod";

export const AnalyzeSkillGapSchema = z.object({
  targetRole: z
    .string()
    .min(2, "Target role must be at least 2 characters")
    .max(100, "Target role is too long"),
});

export const SkillStatusEnum = z.enum(["ACQUIRED", "IMPROVING", "MISSING"]);
export const SkillPriorityEnum = z.enum(["CRITICAL", "IMPORTANT", "NICE_TO_HAVE"]);

export const SkillDetailSchema = z.object({
  skill: z.string().describe("Skill or technology name"),
  score: z.number().int().min(0).max(100).describe("Proficiency score 0-100"),
  status: SkillStatusEnum.describe("ACQUIRED (>=70), IMPROVING (35-69), or MISSING (<35)"),
  priority: SkillPriorityEnum.describe("Importance for the target role"),
  evidence: z.string().describe("Where this skill was verified or why it is needed"),
  recommendation: z.string().optional().describe("Specific tip or resource to bridge this gap"),
});

export const SkillGapResultSchema = z.object({
  targetRole: z.string(),
  matchPercentage: z.number().int().min(0).max(100),
  summary: z.string().min(20).describe("Concise evaluation of placement readiness"),
  currentSkills: z.array(z.string()).describe("Skills verified from candidate's profile/resume"),
  requiredSkills: z.array(z.string()).describe("Core skills expected by employers for this role"),
  missingSkills: z.array(z.string()).describe("Critical and important skills candidate lacks"),
  improvingSkills: z.array(z.string()).describe("Skills candidate possesses but needs deeper mastery"),
  proficiencyMap: z.record(z.number().int().min(0).max(100)),
  skillDetails: z.array(SkillDetailSchema).min(3).max(20),
  recommendations: z.array(z.string()).min(2).max(8),
});

export type AnalyzeSkillGapInput = z.infer<typeof AnalyzeSkillGapSchema>;
export type SkillDetail = z.infer<typeof SkillDetailSchema>;
export type SkillGapResult = z.infer<typeof SkillGapResultSchema>;
