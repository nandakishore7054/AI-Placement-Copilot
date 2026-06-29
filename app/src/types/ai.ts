// ─── Resume Analysis AI Types ─────────────────────────────────────────────────

export interface ResumeAnalysisResult {
  overallScore: number;
  formatScore: number;
  contentScore: number;
  atsScore: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestions: string[];
  sectionScores: {
    experience?: number;
    education?: number;
    skills?: number;
    summary?: number;
    projects?: number;
    certifications?: number;
    [key: string]: number | undefined;
  };
  strengths: string[];
  weaknesses: string[];
  rawAnalysis?: unknown;
}

// ─── Interview Feedback AI Types ──────────────────────────────────────────────

export interface FeedbackCategoryScore {
  name: string;
  score: number;
  comment: string;
}

export interface QuestionAnalysis {
  questionId: string;
  response: string;
  score: number;
  suggestion: string;
}

export interface InterviewFeedbackResult {
  totalScore: number;
  categoryScores: FeedbackCategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  questionsAnalysis: QuestionAnalysis[];
}

// ─── Skill Gap AI Types ───────────────────────────────────────────────────────

export interface SkillGapResult {
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  proficiencyMap: Record<string, number>; // skill → 0-100
  matchPercentage: number;
  recommendations: string[];
}

// ─── Career Roadmap AI Types ──────────────────────────────────────────────────

export interface RoadmapMilestone {
  title: string;
  description: string;
  skills: string[];
  month: number;
  completed: boolean;
}

export interface RoadmapResource {
  title: string;
  url: string;
  type: "course" | "book" | "tutorial" | "project" | "certification";
}

export interface CareerRoadmapResult {
  timelineMonths: number;
  milestones: RoadmapMilestone[];
  skillsToAcquire: string[];
  resources: RoadmapResource[];
}

// ─── Recommendation AI Types ──────────────────────────────────────────────────

export interface RecommendationResult {
  type: "JOB" | "SKILL" | "INTERVIEW" | "COURSE" | "EXPERIENCE";
  title: string;
  description: string;
  relevanceScore: number; // 0-1
  metadata?: {
    jobId?: string;
    courseUrl?: string;
    skill?: string;
    [key: string]: unknown;
  };
}
