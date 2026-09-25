import { generateObject } from "ai";
import { geminiFlash } from "./gemini";
import {
  InterviewFeedbackAiResponseSchema,
  type InterviewFeedbackAiResponse,
} from "@/schemas/feedback";

export interface InterviewQuestionEvaluationContext {
  id: string;
  questionText: string;
  topic?: string | null;
  difficulty?: string | null;
  expectedAnswer?: string | null;
}

/**
 * Generates comprehensive structured interview feedback using Gemini 3.6 Flash.
 *
 * Evaluates:
 * - 5 core assessment dimensions: Technical Correctness, Communication & Articulation,
 *   Problem Solving, Confidence & Composure, Clarity & Structured Delivery.
 * - Per-question evaluation linked directly by questionId.
 * - Strengths and actionable areas for improvement.
 * - Overall hiring-style final assessment.
 */
export async function generateInterviewFeedback(
  interviewId: string,
  transcript: string,
  questions: InterviewQuestionEvaluationContext[],
  context?: {
    role?: string;
    level?: string;
    techStack?: string[];
  },
): Promise<InterviewFeedbackAiResponse> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Please check your environment variables.",
    );
  }

  if (!transcript || transcript.trim().length === 0) {
    throw new Error(
      "Cannot generate feedback: Transcript is empty. Please complete an interview with spoken answers first.",
    );
  }

  if (!questions || questions.length === 0) {
    throw new Error(
      "Cannot generate feedback: No questions found for this interview session.",
    );
  }

  const roleTitle = context?.role || "Software Engineer";
  const levelTitle = context?.level || "INTERMEDIATE";
  const stackString =
    context?.techStack && context.techStack.length > 0
      ? context.techStack.join(", ")
      : "General Engineering";

  // Format questions into prompt
  const formattedQuestions = questions
    .map(
      (q, index) =>
        `Question ${index + 1} [ID: ${q.id}]:
- Topic: ${q.topic || "Core Concept"}
- Difficulty: ${q.difficulty || "MEDIUM"}
- Question: ${q.questionText}
- Ideal Answer Benchmark: ${q.expectedAnswer || "Clear explanation with relevant technical terms and practical considerations"}`,
    )
    .join("\n\n");

  try {
    const result = await generateObject({
      model: geminiFlash,
      schema: InterviewFeedbackAiResponseSchema,
      system: `You are a Principal Engineering Interviewer and Staff Placement Evaluator at a premier technology company.

Your job is to thoroughly and objectively evaluate a candidate's completed mock interview session based on the provided questions and the recorded conversation transcript.

Evaluation Guidelines:
1. Target Role: "${roleTitle}" (${levelTitle} level, Stack: ${stackString}).
2. The transcript contains turns labeled "[AI Interviewer]: ..." and "[Candidate]: ...".
3. Evaluate the candidate's actual answers against each question's expected answer benchmark.
4. If the candidate skipped a question, gave an incomplete answer, or answered off-topic, assign an appropriate lower score for that question and note what was missing.
5. Provide exactly 5 Category Scores:
   - "Technical Correctness": Accuracy of technical facts, depth of concepts, syntax/framework knowledge.
   - "Communication & Articulation": Fluency, conciseness, ability to explain complex ideas simply.
   - "Problem Solving": Logical reasoning, handling edge cases, structured approach (e.g. trade-offs).
   - "Confidence & Composure": Tone, conviction, pace, handling difficult questions without freezing.
   - "Clarity & Structured Delivery": Organization of answers, use of STAR method for behavioral/situational questions, systematic walkthroughs.
6. In questionsAnalysis, EVERY question in the list must be evaluated. You MUST use the exact "questionId" provided for each question.
7. Be encouraging yet rigorous and constructive. Provide specific suggestions for how to level up.`,
      prompt: `Candidate Interview Evaluation:
Role: ${roleTitle}
Seniority Level: ${levelTitle}
Key Technologies: ${stackString}

---
CURATED QUESTIONS LIST:
${formattedQuestions}

---
INTERVIEW TRANSCRIPT:
${transcript}

---
Generate the structured interview evaluation now.`,
    });

    // Ensure all questionIds from the original question list exist in questionsAnalysis
    const evaluatedQuestionIds = new Set(
      result.object.questionsAnalysis.map((qa) => qa.questionId),
    );

    const questionsAnalysisWithFallback = [...result.object.questionsAnalysis];

    for (const q of questions) {
      if (!evaluatedQuestionIds.has(q.id)) {
        questionsAnalysisWithFallback.push({
          questionId: q.id,
          response: "Not addressed or unrecorded in transcript.",
          score: 0,
          suggestion: `Make sure to explicitly address ${q.topic || "this question"} covering: ${
            q.expectedAnswer || "the core concepts requested"
          }.`,
        });
      }
    }

    return {
      totalScore: Math.min(100, Math.max(0, Math.round(result.object.totalScore))),
      categoryScores: result.object.categoryScores.map((cs) => ({
        name: cs.name,
        score: Math.min(100, Math.max(0, Math.round(cs.score))),
        comment: cs.comment,
      })),
      strengths: result.object.strengths,
      areasForImprovement: result.object.areasForImprovement,
      finalAssessment: result.object.finalAssessment,
      questionsAnalysis: questionsAnalysisWithFallback,
    };
  } catch (error) {
    console.error("[generateInterviewFeedback] Gemini generation failed:", error);
    throw new Error(
      `Failed to generate interview feedback: ${
        error instanceof Error ? error.message : "AI service unavailable"
      }`,
    );
  }
}
