import type {
  User,
  StudentProfile,
  Company,
  CompanyMember,
  Resume,
  ResumeAnalysis,
  Job,
  Application,
  Interview,
  InterviewQuestion,
  Feedback,
  Experience,
  Subscription,
  AuditLog,
  SkillGap,
  Recommendation,
  CareerInsight,
  CareerRoadmap,
  UserRole,
  CompanyRole,
  JobLevel,
  JobType,
  ApplicationStatus,
  InterviewType,
  InterviewStatus,
  QuestionDifficulty,
  RecommendationType,
  AuditAction,
  AuditEntity,
  InsightCategory,
} from "@prisma/client";

// ─── Re-export Prisma types ───────────────────────────────────────────────────
export type {
  User,
  StudentProfile,
  Company,
  CompanyMember,
  Resume,
  ResumeAnalysis,
  Job,
  Application,
  Interview,
  InterviewQuestion,
  Feedback,
  Experience,
  Subscription,
  AuditLog,
  SkillGap,
  Recommendation,
  CareerInsight,
  CareerRoadmap,
  UserRole,
  CompanyRole,
  JobLevel,
  JobType,
  ApplicationStatus,
  InterviewType,
  InterviewStatus,
  QuestionDifficulty,
  RecommendationType,
  AuditAction,
  AuditEntity,
  InsightCategory,
};

// ─── Extended / Joined Types ──────────────────────────────────────────────────

/** User with their student profile and active company memberships */
export type UserWithProfile = User & {
  studentProfile: StudentProfile | null;
  companyMemberships: (CompanyMember & { company: Company })[];
};

/** Company with owner + member list */
export type CompanyWithMembers = Company & {
  members: (CompanyMember & { user: User })[];
};

/** CompanyMember with user info — for team management UI */
export type CompanyMemberWithUser = CompanyMember & {
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "imageUrl">;
};

/** Job with company info — for job listing cards */
export type JobWithCompany = Job & {
  company: Pick<Company, "id" | "name" | "logoUrl" | "verified">;
  _count: { applications: number };
};

/** Application with job and company — for student application tracking */
export type ApplicationWithJob = Application & {
  job: Job & { company: Pick<Company, "id" | "name" | "logoUrl"> };
};

/** Application with student info — for recruiter applicant view */
export type ApplicationWithStudent = Application & {
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "imageUrl"> & {
    resume: Pick<Resume, "fileUrl" | "fileName"> | null;
    studentProfile: Pick<StudentProfile, "skills" | "yearsOfExperience"> | null;
  };
  job: Pick<Job, "id" | "title">;
};

/** Interview with questions ordered by index */
export type InterviewWithQuestions = Interview & {
  questions: InterviewQuestion[];
};

/** Interview with feedback — for display pages */
export type InterviewWithFeedback = Interview & {
  questions: InterviewQuestion[];
  feedback: Feedback | null;
};

/** Resume with analysis */
export type ResumeWithAnalysis = Resume & {
  analysis: ResumeAnalysis | null;
};

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Search / Filter Types ────────────────────────────────────────────────────

export interface JobFilters {
  query?: string;
  category?: string;
  location?: string;
  level?: JobLevel;
  type?: JobType;
  page?: number;
  pageSize?: number;
}

export interface SemanticSearchResult {
  job: JobWithCompany;
  similarity: number; // 0-1 cosine similarity
}
