import { JobLevel, JobType, ApplicationStatus, InterviewType } from "@prisma/client";

// ─── Job Categories ───────────────────────────────────────────────────────────
export const JOB_CATEGORIES = [
  "Software Development",
  "Data Science & Analytics",
  "Product Management",
  "Design & UX",
  "DevOps & Infrastructure",
  "Cybersecurity",
  "Mobile Development",
  "Machine Learning & AI",
  "Quality Assurance",
  "Business Analysis",
  "Project Management",
  "Marketing & Growth",
  "Sales & Business Development",
  "Human Resources",
  "Finance & Accounting",
  "Legal & Compliance",
  "Customer Success",
  "Technical Writing",
  "Research & Development",
  "Consulting",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

// ─── Job Levels ───────────────────────────────────────────────────────────────
export const JOB_LEVEL_LABELS: Record<JobLevel, string> = {
  BEGINNER: "Entry Level",
  INTERMEDIATE: "Mid Level",
  SENIOR: "Senior Level",
};

// ─── Job Types ────────────────────────────────────────────────────────────────
export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  REMOTE: "Remote",
};

// ─── Application Status Labels ────────────────────────────────────────────────
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Applied",
  REVIEWED: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  ACCEPTED: "Accepted 🎉",
  REJECTED: "Not Selected",
  WITHDRAWN: "Withdrawn",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-purple-100 text-purple-700",
  INTERVIEW_SCHEDULED: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-600",
};

// ─── Interview Types ──────────────────────────────────────────────────────────
export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  TECHNICAL: "Technical",
  BEHAVIORAL: "Behavioral",
  MIXED: "Mixed",
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const POPULAR_LOCATIONS = [
  "Remote",
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Noida",
  "Gurgaon",
  "Jaipur",
  "Kochi",
  "Chandigarh",
  "Indore",
] as const;

// ─── Tech Stacks ──────────────────────────────────────────────────────────────
export const POPULAR_TECH_STACKS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "Go",
  "Rust",
  "Vue.js",
  "Angular",
  "Express",
  "FastAPI",
  "Django",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "GraphQL",
  "REST",
  "Prisma",
  "TailwindCSS",
  "Flutter",
  "React Native",
  "Swift",
  "Kotlin",
] as const;

// ─── Resume Cover Images ──────────────────────────────────────────────────────
export const INTERVIEW_COVER_IMAGES = [
  "/covers/interview-1.jpg",
  "/covers/interview-2.jpg",
  "/covers/interview-3.jpg",
  "/covers/interview-4.jpg",
  "/covers/interview-5.jpg",
] as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// ─── AI Feedback Categories ───────────────────────────────────────────────────
export const FEEDBACK_CATEGORIES = [
  "Communication",
  "Technical Knowledge",
  "Problem Solving",
  "Cultural Fit",
  "Confidence & Clarity",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

// ─── Company Sizes ────────────────────────────────────────────────────────────
export const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
] as const;

// ─── Industries ───────────────────────────────────────────────────────────────
export const INDUSTRIES = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "E-Commerce",
  "Consulting",
  "Manufacturing",
  "Media & Entertainment",
  "Real Estate",
  "Logistics & Supply Chain",
  "Gaming",
  "SaaS",
  "Fintech",
  "Edtech",
  "Healthtech",
  "Government & Public Sector",
  "Non-Profit",
] as const;
