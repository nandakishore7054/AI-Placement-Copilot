import { generateObject } from "ai";
import { geminiFlash } from "./gemini";
import { ResumeAnalysisSchema, type ResumeAnalysisInput } from "@/schemas/resume";

/**
 * Performs structured AI analysis on a candidate's resume using Gemini 3.6 Flash.
 * Evaluates ATS compatibility, content quality, formatting, keywords, strengths,
 * weaknesses, section-level scores, and actionable recommendations.
 */
export async function analyzeResumeWithAi(
  extractedText: string
): Promise<ResumeAnalysisInput> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Please set it in your environment."
    );
  }

  const cleanText = extractedText.slice(0, 15000).trim();
  if (cleanText.length < 20) {
    throw new Error("Resume content contains insufficient text for AI analysis.");
  }

  const result = await generateObject({
    model: geminiFlash,
    schema: ResumeAnalysisSchema,
    system: `You are an elite technical recruiter, hiring manager, and ATS (Applicant Tracking System) optimization engine for university placements and tech careers.

Analyze the student's resume thoroughly against contemporary industry placement standards.

Provide a comprehensive structured analysis:
1. overallScore (0-100): Balanced weighted score representing total hiring readiness.
2. formatScore (0-100): Visual structure, section organization, bullet point conciseness, and clarity.
3. contentScore (0-100): Impact of achievements, quantification (metrics/percentages/KPIs), technical depth, and action verbs.
4. atsScore (0-100): Machine parseability, keyword density, standard heading usage, and lack of ATS-breaking elements.
5. keywordsFound: Array of strong technical/functional skills, frameworks, tools, and domain competencies identified.
6. keywordsMissing: Array of recommended high-impact industry keywords relevant to their field that should be added.
7. suggestions: 3 to 6 high-impact, specific, actionable bullet points to improve the resume.
8. sectionScores: Dictionary containing scores (0-100) for standard sections: "Experience", "Education", "Skills", "Projects", "Summary".
9. strengths: Top 2 to 4 key strengths of this candidate's profile.
10. weaknesses: 2 to 4 specific gaps or areas needing immediate improvement.`,
    prompt: `Candidate Resume Text:\n\n${cleanText}`,
  });

  return result.object;
}
