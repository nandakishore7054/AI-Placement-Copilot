import { generateObject } from "ai";
import { geminiFlash } from "./gemini";
import {
  GeneratedQuestionsListSchema,
  type GeneratedQuestion,
} from "@/schemas/interview";
import { QuestionDifficulty } from "@prisma/client";

/**
 * Generates structured interview questions for a mock interview using Gemini 3.6 Flash.
 *
 * Tailors questions based on:
 * - Target Role (e.g. Frontend Engineer, Full Stack Developer, Data Scientist)
 * - Interview Type (TECHNICAL, BEHAVIORAL, MIXED)
 * - Experience Level (BEGINNER, INTERMEDIATE, SENIOR)
 * - Tech Stack (e.g. React, TypeScript, Node.js, PostgreSQL)
 */
export async function generateInterviewQuestions(
  role: string,
  type: string,
  level: string,
  techStack: string[],
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Please check your environment variables.",
    );
  }

  const stackString = techStack.length > 0 ? techStack.join(", ") : "General Engineering";

  try {
    const result = await generateObject({
      model: geminiFlash,
      schema: GeneratedQuestionsListSchema,
      system: `You are an elite technical recruiter and interviewer conducting placement interviews for top software companies and startups.

Your task is to generate exactly 5 high-caliber, structured interview questions for a candidate.

Guidelines:
1. Target Role: "${role}"
2. Interview Type: "${type}" (TECHNICAL = in-depth coding/framework/system questions, BEHAVIORAL = STAR format situational/leadership/conflict questions, MIXED = 3 technical + 2 behavioral).
3. Candidate Level: "${level}" (BEGINNER = foundational concepts & problem solving, INTERMEDIATE = architectural patterns & real-world trade-offs, SENIOR = scalability, edge cases, system design & high-level architecture).
4. Tech Stack: "${stackString}"

For each question:
- questionText: Clear, conversational, realistic question as spoken by a senior interviewer.
- topic: The specific subject (e.g. "React State Management", "Database Indexing", "Handling Team Conflicts", "API Rate Limiting").
- difficulty: "EASY", "MEDIUM", or "HARD". Ensure a progressive difficulty curve (start with EASY/MEDIUM, ramp up to HARD).
- orderIndex: 0-indexed integer representing chronological question order (0, 1, 2, 3, 4).
- expectedAnswer: A concise 2-3 sentence summary of what a strong answer should cover (key concepts, metrics, frameworks).`,
      prompt: `Generate 5 structured interview questions for:
Role: ${role}
Type: ${type}
Level: ${level}
Technologies: ${stackString}`,
    });

    // Ensure sequential orderIndex and valid difficulty
    const cleanedQuestions = result.object.questions.map((q, index) => ({
      questionText: q.questionText.trim(),
      topic: q.topic.trim(),
      difficulty: Object.values(QuestionDifficulty).includes(q.difficulty as QuestionDifficulty)
        ? (q.difficulty as QuestionDifficulty)
        : QuestionDifficulty.MEDIUM,
      orderIndex: index,
      expectedAnswer: q.expectedAnswer?.trim() || undefined,
    }));

    return cleanedQuestions;
  } catch (error) {
    console.error("[generateInterviewQuestions] Gemini AI generation error:", error);
    throw new Error(
      `Failed to generate interview questions: ${
        error instanceof Error ? error.message : "AI service unavailable"
      }`,
    );
  }
}
