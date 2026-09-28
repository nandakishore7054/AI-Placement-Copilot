import { generateObject } from "ai";
import { executeWithRetryAndFallback } from "./gemini";
import {
  RecommendationsResultSchema,
  type RecommendationItem,
} from "@/schemas/recommendations";

export interface RecommendationContext {
  profileSkills: string[];
  preferredCategories: string[];
  resumeKeywords: string[];
  resumeStrengths: string[];
  latestSkillGap?: {
    targetRole: string;
    missingSkills: string[];
    improvingSkills: string[];
    matchPercentage: number;
  } | null;
  activeRoadmap?: {
    targetRole: string;
    progress: number;
    skillsToAcquire: string[];
    nextMilestoneTitle?: string;
  } | null;
  recentApplications: Array<{
    jobTitle: string;
    status: string;
  }>;
  interviewScores: Array<{
    role: string;
    score?: number | null;
  }>;
  availableJobs: Array<{
    id: string;
    title: string;
    category?: string | null;
    level?: string | null;
  }>;
}

/**
 * AI Recommendation Engine that generates context-aware, hyper-personalized
 * recommendations across the 5 Architecture V2 types:
 * - JOB
 * - SKILL
 * - INTERVIEW
 * - COURSE
 * - EXPERIENCE
 */
export async function generateRecommendationsWithAi(
  userId: string,
  context: RecommendationContext,
): Promise<RecommendationItem[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Please check your environment variables.",
    );
  }

  const profileSkills = context.profileSkills.length > 0
    ? context.profileSkills.join(", ")
    : "None declared";

  const availableJobsList = context.availableJobs.length > 0
    ? context.availableJobs
        .map((j) => `- [Job ID: ${j.id}] ${j.title} (${j.category || "General"} | ${j.level || "Entry"})`)
        .join("\n")
    : "Standard tech opportunities";

  const skillGapSummary = context.latestSkillGap
    ? `Target Role: ${context.latestSkillGap.targetRole} (${context.latestSkillGap.matchPercentage}% match)
- Missing Skills: ${context.latestSkillGap.missingSkills.join(", ") || "None"}
- Improving Skills: ${context.latestSkillGap.improvingSkills.join(", ") || "None"}`
    : "No skill gap analysis on record";

  const roadmapSummary = context.activeRoadmap
    ? `Active Roadmap: ${context.activeRoadmap.targetRole} (${context.activeRoadmap.progress}% complete)
- Next Priority: ${context.activeRoadmap.nextMilestoneTitle || "Starting Phase"}
- Skills Needed: ${context.activeRoadmap.skillsToAcquire.join(", ")}`
    : "No active career roadmap";

  const interviewsSummary = context.interviewScores.length > 0
    ? context.interviewScores
        .map((i) => `${i.role}: ${i.score != null ? `${i.score}/100` : "Completed"}`)
        .join(", ")
    : "No mock interviews completed";

  try {
    const result = await executeWithRetryAndFallback(
      async (model) => {
        return await generateObject({
          model,
          schema: RecommendationsResultSchema,
          maxRetries: 0,
          system: `You are the Lead Career Intelligence Architect for AI Placement Copilot.
Your mission is to generate 4 to 6 hyper-personalized, high-value, actionable recommendations for this student.

Rules & Guidelines:
1. Every recommendation MUST strictly use one of the 5 canonical RecommendationTypes:
   - "JOB": Connect student to a relevant platform opening or suggest role search. If a matching job exists in the available jobs list, mention it and set actionUrl to "/jobs" or "/jobs/[jobId]".
   - "SKILL": Urgent gap to bridge, derived from their Skill Gap analysis or Career Roadmap. Set actionUrl to "/skill-gap".
   - "INTERVIEW": Specific mock voice interview practice on a weak topic or target role. Set actionUrl to "/interviews/new".
   - "COURSE": Practical tutorial, book, or technical documentation to master a missing concept. Set actionUrl to "/career".
   - "EXPERIENCE": Concrete portfolio project, open source contribution, or internship milestone to build undeniable proof of work. Set actionUrl to "/experiences".
2. Prioritize high-impact, realistic next steps that immediately elevate the student's chances in campus placements.
3. Assign realistic relevanceScores between 0.70 and 0.98 based on urgency and relevance.
4. Keep titles concise (under 80 chars) and descriptions clear and punchy (1-2 sentences).`,
          prompt: `STUDENT CONTEXT:
- Profile Skills: ${profileSkills}
- Preferred Categories: ${context.preferredCategories.join(", ") || "Software Development"}
- Resume Keywords: ${context.resumeKeywords.slice(0, 15).join(", ") || "None"}
- Skill Gap Diagnostics:
${skillGapSummary}
- Career Roadmap Status:
${roadmapSummary}
- Mock Interview History:
${interviewsSummary}

CURRENT PLATFORM OPENINGS:
${availableJobsList}

Generate the personalized recommendation set now.`,
        });
      },
      {
        operationName: `generateRecommendations(${userId})`,
        maxRetriesPerModel: 2,
        baseDelayMs: 1200,
        maxDelayMs: 4000,
      },
    );

    return result.object.recommendations;
  } catch (error) {
    console.error("[generateRecommendationsWithAi] Failed:", error);
    throw error;
  }
}
