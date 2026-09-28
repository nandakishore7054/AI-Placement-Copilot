import { generateObject } from "ai";
import { executeWithRetryAndFallback } from "./gemini";
import {
  SkillGapResultSchema,
  type SkillGapResult,
} from "@/schemas/skill-gap";

export interface CandidateContext {
  profileSkills?: string[];
  bio?: string | null;
  education?: string | null;
  yearsOfExperience?: number | null;
  resumeText?: string | null;
  resumeKeywords?: string[];
  resumeStrengths?: string[];
  interviewPerformance?: Array<{
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
 * Performs comprehensive AI-driven Skill Gap Analysis for a student targeting a specific career role.
 *
 * Automatically inspects:
 * - Student Profile skills and background
 * - Extracted Resume text and ATS keywords
 * - Recent AI Mock Interview performance
 * - Platform Job market requirements
 *
 * Uses Gemini AI with tiered failover and bounded backoff.
 */
export async function analyzeSkillGapWithAi(
  targetRole: string,
  context: CandidateContext,
): Promise<SkillGapResult> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Please check your environment variables.",
    );
  }

  // Format student evidence
  const profileSkillsList =
    context.profileSkills && context.profileSkills.length > 0
      ? context.profileSkills.join(", ")
      : "None explicitly declared in profile";

  const resumeKeywordsList =
    context.resumeKeywords && context.resumeKeywords.length > 0
      ? context.resumeKeywords.join(", ")
      : "No parsed resume keywords available";

  const resumeSnippet = context.resumeText
    ? context.resumeText.slice(0, 6000).trim()
    : "No resume document uploaded";

  const interviewNotes =
    context.interviewPerformance && context.interviewPerformance.length > 0
      ? context.interviewPerformance
          .map(
            (i, idx) =>
              `Session ${idx + 1}: ${i.role} (${i.techStack.join(", ")})${
                i.score != null ? ` - Placement Score: ${i.score}/100` : ""
              }`,
          )
          .join("\n")
      : "No mock interview sessions conducted yet";

  const jobMarketContext =
    context.marketJobSamples && context.marketJobSamples.length > 0
      ? context.marketJobSamples
          .map((j, idx) => `Sample ${idx + 1}: ${j.title}\n${j.description?.slice(0, 300)}...`)
          .join("\n\n")
      : "Standard contemporary tech industry hiring benchmarks apply.";

  try {
    const result = await executeWithRetryAndFallback(
      async (model) => {
        return await generateObject({
          model,
          schema: SkillGapResultSchema,
          maxRetries: 0,
          system: `You are a Principal Engineering Career Architect and Technical Hiring Director specializing in tech placements and campus hiring.

Your task is to conduct an authoritative, rigorous, and constructive Skill Gap Analysis for a student aiming for the target role: "${targetRole}".

Calibration Rules:
1. Examine the candidate's existing evidence:
   - Self-declared Profile Skills
   - Uploaded Resume text and ATS parsed keywords
   - Verified performance in AI Mock Interviews
2. Compare objectively against the real-world hiring requirements for "${targetRole}".
3. Categorize each evaluated skill into one of 3 statuses:
   - "ACQUIRED" (score >= 70): Clear evidence that the candidate knows and has used this skill.
   - "IMPROVING" (score 35-69): Candidate has foundational knowledge, but lacks demonstrated depth or production experience.
   - "MISSING" (score < 35): Essential/expected industry skill with zero or negligible evidence.
4. Assign an actionable Priority:
   - "CRITICAL": Absolute must-have for passing technical screening for this role.
   - "IMPORTANT": Commonly asked in interviews and expected by top recruiters.
   - "NICE_TO_HAVE": Differentiator skill that sets the candidate ahead of peers.
5. In "evidence", explicitly cite where the skill was found or why it is required (e.g. "Verified in Profile & Resume projects", "Practiced in Mock Interview with 85% score", "Core industry requirement for Frontend roles, not detected in candidate background").
6. Provide a realistic matchPercentage (0-100) reflecting overall readiness to crack placement for this specific role today.
7. Give 3 to 6 high-impact, specific, actionable learning recommendations with concrete projects or tools to bridge the identified gaps.`,
          prompt: `TARGET ROLE TO EVALUATE:
"${targetRole}"

CANDIDATE BACKGROUND & EVIDENCE:
- Profile Skills: ${profileSkillsList}
- Bio & Background: ${context.bio || "Not specified"}
- Education: ${context.education || "Not specified"}
- Years of Experience: ${context.yearsOfExperience ?? 0} years
- Verified Resume Keywords: ${resumeKeywordsList}
- Mock Interview History:
${interviewNotes}

- Resume Excerpt:
${resumeSnippet}

LIVE PLATFORM MARKET SAMPLES:
${jobMarketContext}

Generate the comprehensive structured Skill Gap Analysis now.`,
        });
      },
      {
        operationName: `analyzeSkillGap(${targetRole})`,
        maxRetriesPerModel: 2,
        baseDelayMs: 1200,
        maxDelayMs: 4000,
      },
    );

    return result.object;
  } catch (error) {
    console.error("[analyzeSkillGapWithAi] Generation failed:", error);
    throw error;
  }
}
