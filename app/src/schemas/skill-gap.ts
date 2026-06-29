import { z } from "zod";

export const AnalyzeSkillGapSchema = z.object({
  targetRole: z.string().min(2, "Target role is required").max(100),
});

export const SkillGapResultSchema = z.object({
  currentSkills: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  proficiencyMap: z.record(z.number().min(0).max(100)),
  matchPercentage: z.number().min(0).max(100),
  recommendations: z.array(z.string()),
});

export type AnalyzeSkillGapInput = z.infer<typeof AnalyzeSkillGapSchema>;
export type SkillGapResultInput = z.infer<typeof SkillGapResultSchema>;
