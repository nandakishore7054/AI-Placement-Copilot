import { generateObject } from "ai";
import { executeWithRetryAndFallback } from "./gemini";
import { JobLevel } from "@prisma/client";
import {
  CareerRoadmapResultSchema,
  type CareerRoadmapResult,
} from "@/schemas/career";

export interface RoadmapCandidateContext {
  profileSkills?: string[];
  bio?: string | null;
  education?: string | null;
  yearsOfExperience?: number | null;
  resumeText?: string | null;
  resumeKeywords?: string[];
  latestSkillGap?: {
    targetRole: string;
    missingSkills: string[];
    improvingSkills?: string[];
    matchPercentage: number;
    recommendations: string[];
  } | null;
  interviewHistory?: Array<{
    role: string;
    techStack: string[];
    score?: number | null;
  }>;
  marketJobSamples?: Array<{
    title: string;
    description?: string;
  }>;
}

/**
 * Generates an authoritative, structured, and personalized Career Roadmap.
 *
 * Automatically synthesizes:
 * - Candidate's current verified profile skills & education
 * - Uploaded resume & ATS strengths
 * - Phase 6 Step 1 Skill Gap Analysis results (missing & improving skills)
 * - AI Mock Interview performance
 * - Platform job postings matching the target role
 *
 * Utilizes Gemini with tiered failover and backoff.
 */
export async function generateCareerRoadmapWithAi(
  targetRole: string,
  currentLevel: JobLevel,
  targetLevel: JobLevel,
  context: RoadmapCandidateContext,
): Promise<CareerRoadmapResult> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Please check your environment variables.",
    );
  }

  // Format existing evidence
  const profileSkills =
    context.profileSkills && context.profileSkills.length > 0
      ? context.profileSkills.join(", ")
      : "None explicitly declared";

  const resumeKeywords =
    context.resumeKeywords && context.resumeKeywords.length > 0
      ? context.resumeKeywords.join(", ")
      : "None parsed";

  const skillGapSummary = context.latestSkillGap
    ? `Target Role Analyzed: ${context.latestSkillGap.targetRole}
- Overall Placement Readiness Match: ${context.latestSkillGap.matchPercentage}%
- Identified Missing Skills: ${context.latestSkillGap.missingSkills.join(", ") || "None"}
- Identified Improving Skills: ${context.latestSkillGap.improvingSkills?.join(", ") || "None"}
- Key Gap Recommendations: ${context.latestSkillGap.recommendations.join(" | ")}`
    : "No prior skill gap analysis performed yet. Calibrate baseline from profile and market standards.";

  const interviewNotes =
    context.interviewHistory && context.interviewHistory.length > 0
      ? context.interviewHistory
          .map(
            (i, idx) =>
              `Interview ${idx + 1}: ${i.role} (${i.techStack.join(", ")})${
                i.score != null ? ` - Placement Score: ${i.score}/100` : ""
              }`,
          )
          .join("\n")
      : "No mock interview sessions conducted yet.";

  const jobMarketContext =
    context.marketJobSamples && context.marketJobSamples.length > 0
      ? context.marketJobSamples
          .map((j, idx) => `Market Role ${idx + 1}: ${j.title}\n${j.description?.slice(0, 300)}...`)
          .join("\n\n")
      : "Standard contemporary engineering benchmarks apply.";

  try {
    const result = await executeWithRetryAndFallback(
      async (model) => {
        return await generateObject({
          model,
          schema: CareerRoadmapResultSchema,
          maxRetries: 0,
          system: `You are a Principal Engineering Career Mentor and Staff Technical Recruiter.
Your objective is to craft an authoritative, rigorous, step-by-step personalized Career Roadmap for a student preparing for tech placements and campus hiring.

Core Principles:
1. NO GENERIC MOTIVATION: Every milestone must contain concrete technical skills, specific production-grade portfolio projects, actionable tasks, and interview prep topics.
2. SEQUENTIAL & REALISTIC: Structure the roadmap logically across sequential months (e.g. Month 1: Core Foundation, Month 2: Advanced Systems & Projects, Month 3: Placement Prep & Mock Interviews).
3. TARGETED TRANSITION: Map the transition from "${currentLevel}" to "${targetLevel}" specifically for the role "${targetRole}".
4. GROUNDED IN EVIDENCE: Actively address the student's identified missing skills from their Skill Gap analysis and reinforce areas flagged during mock interviews.
5. PORTFOLIO & RECRUITER APPEAL: Recommend projects with real-world architecture (auth, databases, caching, deployment, tests) that stand out to technical interviewers.
6. INTERVIEW READINESS: Include explicit data structures, algorithms, system design, or domain-specific interview topics for each milestone.`,
          prompt: `TARGET ROLE: "${targetRole}"
LEVEL TRANSITION: From ${currentLevel} to ${targetLevel}

CANDIDATE PROFILE & EVIDENCE:
- Current Verified Skills: ${profileSkills}
- Background & Education: ${context.education || "Undergraduate Engineering"} | Bio: ${context.bio || "Student"}
- Years of Experience: ${context.yearsOfExperience ?? 0}
- Resume ATS Keywords: ${resumeKeywords}

SKILL GAP ANALYSIS CONTEXT:
${skillGapSummary}

MOCK INTERVIEW PERFORMANCE:
${interviewNotes}

LIVE PLATFORM MARKET SAMPLE REQUIREMENTS:
${jobMarketContext}

Generate the comprehensive structured Career Roadmap now.`,
        });
      },
      {
        operationName: `generateCareerRoadmap(${targetRole})`,
        maxRetriesPerModel: 2,
        baseDelayMs: 1200,
        maxDelayMs: 4000,
      },
    );

    return result.object;
  } catch (error) {
    console.error("[generateCareerRoadmapWithAi] Failed:", error);
    throw error;
  }
}
