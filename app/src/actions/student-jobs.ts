// src/actions/student-jobs.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { JobLevel, JobType } from "@prisma/client";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { saveResumeEmbedding } from "@/lib/ai/embeddings";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JobFilters {
  search?: string;
  category?: string;
  location?: string;
  level?: JobLevel | "";
  type?: JobType | "";
  page?: number;
  pageSize?: number;
}

export type JobWithCompany = NonNullable<
  Awaited<ReturnType<typeof db.job.findUnique>>
> & {
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    verified: boolean;
    industry: string | null;
    website: string | null;
    description: string | null;
    size: string | null;
  };
  _count: { applications: number };
};

export interface JobListResult {
  jobs: JobWithCompany[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RecommendedJobItem {
  job: JobWithCompany;
  similarity: number;
  matchScore: number;
  applicationStatus?: string;
}

export interface RecommendedJobsResult {
  status: "NO_RESUME" | "NO_EMBEDDING" | "NO_JOBS" | "SUCCESS";
  jobs: RecommendedJobItem[];
  message?: string;
}

// ─── Get paginated + filtered job listing ─────────────────────────────────────
// Architecture note: keyword search is handled here via SQL ILIKE.
// Semantic search (pgvector) is available at POST /api/jobs/search and
// is intentionally kept as a separate endpoint to swap in when needed.

export async function getJobs(filters: JobFilters): Promise<JobListResult> {
  const {
    search,
    category,
    location,
    level,
    type,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = filters;

  const where = {
    isVisible: true,
    ...(category && { category }),
    ...(location && {
      location: { contains: location, mode: "insensitive" as const },
    }),
    ...(level && { level: level as JobLevel }),
    ...(type && { type: type as JobType }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        {
          company: {
            name: { contains: search, mode: "insensitive" as const },
          },
        },
      ],
    }),
  };

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(pageSize, 50);

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            description: true,
            industry: true,
            size: true,
            verified: true,
          },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),
    db.job.count({ where }),
  ]);

  return {
    jobs: jobs as JobWithCompany[],
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

// ─── Get single job by ID ─────────────────────────────────────────────────────

export async function getJobById(jobId: string) {
  return db.job.findUnique({
    where: { id: jobId, isVisible: true },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          website: true,
          description: true,
          industry: true,
          size: true,
          verified: true,
        },
      },
      _count: { select: { applications: true } },
    },
  });
}

// ─── Apply to a job ───────────────────────────────────────────────────────────

export async function applyToJob(
  jobId: string
): Promise<{ success: boolean; error?: string; alreadyApplied?: boolean }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingDone: true },
  });
  if (!user?.onboardingDone)
    return { success: false, error: "Complete onboarding first" };

  const existing = await db.application.findUnique({
    where: { userId_jobId: { userId, jobId } },
    select: { id: true },
  });

  if (existing) {
    return { success: false, alreadyApplied: true, error: "Already applied" };
  }

  await db.application.create({ data: { userId, jobId } });
  revalidatePath("/applications");
  return { success: true };
}

// ─── Get application status for current user across a list of job IDs ─────────

export async function getUserApplicationStatuses(
  jobIds: string[]
): Promise<Record<string, string>> {
  const { userId } = await auth();
  if (!userId || jobIds.length === 0) return {};

  const applications = await db.application.findMany({
    where: { userId, jobId: { in: jobIds } },
    select: { jobId: true, status: true },
  });

  return Object.fromEntries(applications.map((a) => [a.jobId, a.status]));
}

// ─── Get Recommended Jobs via pgvector Cosine Similarity ─────────────────────

export async function getRecommendedJobs(
  limit: number = 6
): Promise<RecommendedJobsResult> {
  const { userId } = await auth();
  if (!userId) {
    return { status: "NO_RESUME", jobs: [], message: "Authentication required." };
  }

  // 1. Check if student has a resume
  const resume = await db.resume.findUnique({
    where: { userId },
  });

  if (!resume) {
    return {
      status: "NO_RESUME",
      jobs: [],
      message: "Upload your resume to unlock personalized AI job recommendations.",
    };
  }

  // 2. Check if resume has extracted text
  if (!resume.extractedText || resume.extractedText.trim().length < 10) {
    return {
      status: "NO_EMBEDDING",
      jobs: [],
      message: "Resume contains insufficient text for semantic matching.",
    };
  }

  // 3. Ensure resume has vector embedding (generate if missing)
  const resumeEmbeddingCheck = await db.$queryRaw<Array<{ hasEmbedding: boolean }>>`
    SELECT (embedding IS NOT NULL) AS "hasEmbedding"
    FROM "Resume"
    WHERE id = ${resume.id}
  `;

  if (!resumeEmbeddingCheck[0]?.hasEmbedding) {
    const embedded = await saveResumeEmbedding(resume.id, resume.extractedText);
    if (!embedded) {
      return {
        status: "NO_EMBEDDING",
        jobs: [],
        message: "Generating profile embeddings. Please refresh in a moment.",
      };
    }
  }

  // 4. Query pgvector cosine similarity directly in PostgreSQL
  const safeLimit = Math.min(Math.max(1, limit), 20);
  const results = await db.$queryRaw<
    Array<{ id: string; similarity: number }>
  >`
    SELECT 
      j.id,
      1 - (j.embedding <=> r.embedding) AS similarity
    FROM "Job" j, "Resume" r
    WHERE r."userId" = ${userId}
      AND r.embedding IS NOT NULL
      AND j."isVisible" = true
      AND j.embedding IS NOT NULL
    ORDER BY j.embedding <=> r.embedding
    LIMIT ${safeLimit}
  `;

  if (results.length === 0) {
    return {
      status: "NO_JOBS",
      jobs: [],
      message: "No matching job opportunities found matching your profile at this time.",
    };
  }

  // 5. Fetch full job records with company data
  const jobIds = results.map((r) => r.id);
  const similarityMap = new Map(results.map((r) => [r.id, Number(r.similarity)]));

  const [jobs, applications] = await Promise.all([
    db.job.findMany({
      where: { id: { in: jobIds }, isVisible: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            description: true,
            industry: true,
            size: true,
            verified: true,
          },
        },
        _count: { select: { applications: true } },
      },
    }),
    db.application.findMany({
      where: { userId, jobId: { in: jobIds } },
      select: { jobId: true, status: true },
    }),
  ]);

  const appStatusMap = new Map(applications.map((a) => [a.jobId, a.status]));

  // 6. Map and sort by similarity score
  const recommendedJobs: RecommendedJobItem[] = (jobs as JobWithCompany[])
    .map((job) => {
      const similarity = similarityMap.get(job.id) ?? 0;
      // Match percentage is bounded between 0% and 100%
      const matchScore = Math.round(Math.max(0, Math.min(1, similarity)) * 100);
      return {
        job,
        similarity,
        matchScore,
        applicationStatus: appStatusMap.get(job.id),
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  return {
    status: "SUCCESS",
    jobs: recommendedJobs,
  };
}
