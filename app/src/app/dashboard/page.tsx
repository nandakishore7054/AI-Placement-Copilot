import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole, ApplicationStatus, InterviewStatus } from "@prisma/client";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Mic,
  Map,
  ArrowRight,
  Star,
  Target,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
} from "lucide-react";
import type { Metadata } from "next";
import { RecommendedJobsSection } from "@/components/jobs/recommended-jobs-section";
import { getRecommendations } from "@/actions/recommendations";
import { getActiveCareerRoadmap } from "@/actions/career";
import { RecommendationsSection } from "@/components/career";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | AI Placement Copilot",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let user = await db.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      _count: {
        select: {
          applications: true,
          interviews: true,
          careerRoadmaps: true,
          skillGaps: true,
        },
      },
    },
  });

  // If user doesn't exist yet (webhook race condition), create them synchronously
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    const primaryEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "";

    user = await db.user.upsert({
      where: { id: userId },
      update: {}, // Do nothing if webhook just beat us to it
      create: {
        id: userId,
        email: primaryEmail,
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        imageUrl: clerkUser.imageUrl ?? null,
        role: UserRole.STUDENT,
        onboardingDone: false,
      },
      include: {
        studentProfile: true,
        _count: {
          select: {
            applications: true,
            interviews: true,
            careerRoadmaps: true,
            skillGaps: true,
          },
        },
      },
    });
  }

  if (!user.onboardingDone) redirect("/onboarding");

  // Smart Routing Logic: Redirect recruiters and admins to their specific dashboards
  if (user.role === UserRole.ADMIN) redirect("/admin/dashboard");
  if (user.role === UserRole.RECRUITER) redirect("/recruiter/dashboard");

  // Fallback / Student Dashboard Implementation
  const profile = user.studentProfile;
  const profileComplete = profile && profile.skills.length > 0 && !!profile.bio;

  // Fetch unified dashboard intelligence in parallel
  const [recommendations, activeRoadmap, latestResume, latestSkillGap, recentApplications, recentInterviews] =
    await Promise.all([
      getRecommendations(),
      getActiveCareerRoadmap(),
      db.resume.findUnique({
        where: { userId },
        include: { analysis: { select: { overallScore: true } } },
      }),
      db.skillGap.findFirst({
        where: { userId },
        orderBy: { analyzedAt: "desc" },
        select: { matchPercentage: true, targetRole: true },
      }),
      db.application.findMany({
        where: { userId },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              type: true,
              company: { select: { name: true } },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
        take: 3,
      }),
      db.interview.findMany({
        where: { userId },
        include: {
          feedback: { select: { totalScore: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const resumeScore = latestResume?.analysis?.overallScore;
  const skillMatch = latestSkillGap?.matchPercentage;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hello, {user.firstName || "Student"} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your AI-powered career companion is ready to elevate your placement preparation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Browse Jobs</span>
          </Link>
          <Link
            href="/interviews/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors shadow-2xs"
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {!profileComplete && (
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50/70">
          <Star className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Complete your student profile to unlock maximum AI accuracy
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Add your bio, skills, and target career preferences to get precision job matches and personalized roadmaps.
            </p>
          </div>
          <Link
            href="/profile"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors shrink-0 shadow-2xs"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* 4 Unified Architecture Overview Cards: Applications, Interviews, Resume Score, Skill Match % */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewStatCard
          label="Applications"
          value={user._count.applications}
          description="Active job submissions"
          href="/applications"
          color="indigo"
          icon={<Briefcase className="h-4 w-4 text-indigo-600" />}
        />
        <OverviewStatCard
          label="Mock Interviews"
          value={user._count.interviews}
          description="AI voice practice sessions"
          href="/interviews"
          color="violet"
          icon={<Mic className="h-4 w-4 text-violet-600" />}
        />
        <OverviewStatCard
          label="Resume ATS Score"
          value={resumeScore !== undefined ? `${resumeScore}%` : "—"}
          description={latestResume ? "From latest CV audit" : "No resume uploaded"}
          href="/resume"
          color="emerald"
          icon={<FileText className="h-4 w-4 text-emerald-600" />}
        />
        <OverviewStatCard
          label="Skill Match"
          value={skillMatch !== undefined ? `${skillMatch}%` : "—"}
          description={latestSkillGap ? latestSkillGap.targetRole : "No gap analysis yet"}
          href="/skill-gap"
          color="amber"
          icon={<Target className="h-4 w-4 text-amber-600" />}
        />
      </div>

      {/* Active Career Roadmap Progress */}
      {activeRoadmap && (
        <div className="p-5 sm:p-6 rounded-3xl border bg-gradient-to-r from-indigo-50/70 via-card to-card flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xs">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                Active Career Roadmap
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {activeRoadmap.currentLevel} → {activeRoadmap.targetLevel}
              </span>
            </div>
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              {activeRoadmap.targetRole}
            </h3>
            <p className="text-xs text-muted-foreground">
              Current focus:{" "}
              <strong className="text-foreground">
                {Array.isArray(activeRoadmap.milestones)
                  ? (activeRoadmap.milestones as any[]).find((m) => !m.completed)?.title || "All milestones achieved"
                  : "Milestones in progress"}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-4 sm:shrink-0">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-foreground">
                  {activeRoadmap.progress}%
                </span>
                <span className="text-xs text-muted-foreground font-medium">complete</span>
              </div>
              <div className="h-2.5 w-32 rounded-full bg-muted overflow-hidden mt-1.5">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${Math.max(activeRoadmap.progress, 5)}%` }}
                />
              </div>
            </div>

            <Link
              href="/career"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <span>Roadmap Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Recommended Jobs via pgvector semantic matching */}
      <RecommendedJobsSection limit={6} />

      {/* AI Recommendations Section */}
      <RecommendationsSection
        recommendations={recommendations}
        title="AI Placement Recommendations"
        description="Context-aware next steps derived from your resume, verified skills, and mock interview performance."
      />

      {/* Recent Applications & Recent Mock Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Card */}
        <div className="rounded-3xl border bg-card p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  Recent Applications
                </h3>
              </div>
              <Link
                href="/applications"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View All ({user._count.applications}) →
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Briefcase className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm font-medium text-foreground">No applications yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Browse open placements and submit your profile with AI resume matching.
                </p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline pt-1"
                >
                  Explore Jobs →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentApplications.map((app) => (
                  <div key={app.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-semibold text-sm text-foreground hover:text-indigo-600 transition-colors truncate block"
                      >
                        {app.job.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">{app.job.company.name}</span>
                        <span>•</span>
                        <span>{app.job.location}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getApplicationStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {new Date(app.appliedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/jobs"
            className="w-full text-center py-2 px-3 rounded-xl border border-dashed text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-colors block"
          >
            Find more openings
          </Link>
        </div>

        {/* Recent Mock Interviews Card */}
        <div className="rounded-3xl border bg-card p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-violet-600" />
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  Recent Mock Interviews
                </h3>
              </div>
              <Link
                href="/interviews"
                className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
              >
                View All ({user._count.interviews}) →
              </Link>
            </div>

            {recentInterviews.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Mic className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm font-medium text-foreground">No interview sessions yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Practice realistic technical and behavioral interviews with real-time AI speech feedback.
                </p>
                <Link
                  href="/interviews/new"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline pt-1"
                >
                  Start First Interview →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentInterviews.map((interview) => (
                  <div key={interview.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={interview.feedback ? `/interviews/${interview.id}/feedback` : `/interviews/${interview.id}`}
                        className="font-semibold text-sm text-foreground hover:text-violet-600 transition-colors truncate block"
                      >
                        {interview.role}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span className="font-medium capitalize">{interview.level.toLowerCase()}</span>
                        <span>•</span>
                        <span className="capitalize">{interview.type.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {interview.feedback ? (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                          Score: {interview.feedback.totalScore}%
                        </span>
                      ) : (
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getInterviewStatusBadge(interview.status)}`}>
                          {interview.status}
                        </span>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {new Date(interview.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/interviews/new"
            className="w-full text-center py-2 px-3 rounded-xl border border-dashed text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-colors block"
          >
            Practice new interview
          </Link>
        </div>
      </div>

      {/* Quick Actions / Explore Features */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Career Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FeatureCard
            icon={<Briefcase className="h-5 w-5 text-indigo-500" />}
            title="Browse Verified Jobs"
            description="Semantically matched to your technical profile"
            href="/jobs"
          />
          <FeatureCard
            icon={<Mic className="h-5 w-5 text-violet-500" />}
            title="AI Voice Interview"
            description="Realistic mock interviews powered by Vapi & Gemini"
            href="/interviews/new"
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5 text-emerald-500" />}
            title="Resume ATS Intelligence"
            description="Get section scores and ATS improvement tips"
            href="/resume"
          />
          <FeatureCard
            icon={<Target className="h-5 w-5 text-amber-500" />}
            title="Skill Gap Analysis"
            description="Calibrate market readiness against target roles"
            href="/skill-gap"
          />
          <FeatureCard
            icon={<Map className="h-5 w-5 text-indigo-500" />}
            title="Career Roadmap Hub"
            description="AI-generated milestones from entry to senior"
            href="/career"
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5 text-purple-500" />}
            title="Career Insights Feed"
            description="Salary benchmarks, market trends, and in-demand skills"
            href="/career/insights"
          />
        </div>
      </div>

      {/* Profile Summary Card */}
      {profile && (
        <div className="p-5 sm:p-6 rounded-3xl border bg-card shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-foreground">Verified Student Profile</h2>
            <Link
              href="/profile"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Edit Profile →
            </Link>
          </div>

          {profile.bio && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          )}

          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.skills.slice(0, 12).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {profile.skills.length > 12 && (
                <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  +{profile.skills.length - 12} more
                </span>
              )}
            </div>
          )}

          {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
            <div className="flex items-center gap-4 pt-2 text-xs font-semibold">
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  LinkedIn ↗
                </a>
              )}
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  GitHub ↗
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Portfolio ↗
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components & Helpers ───────────────────────────────────────────────────

function OverviewStatCard({
  label,
  value,
  description,
  href,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  description: string;
  href: string;
  color: "indigo" | "violet" | "emerald" | "amber";
  icon: React.ReactNode;
}) {
  const colorMap = {
    indigo: "bg-indigo-50/70 border-indigo-100 hover:border-indigo-200",
    violet: "bg-violet-50/70 border-violet-100 hover:border-violet-200",
    emerald: "bg-emerald-50/70 border-emerald-100 hover:border-emerald-200",
    amber: "bg-amber-50/70 border-amber-100 hover:border-amber-200",
  };

  return (
    <Link
      href={href}
      className={`p-4 sm:p-5 rounded-2xl border ${colorMap[color]} transition-all hover:shadow-xs group`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="p-1.5 rounded-lg bg-white/80 shadow-2xs">{icon}</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
      <p className="text-2xl sm:text-3xl font-black text-foreground">{value}</p>
      <p className="text-xs font-bold text-foreground/80 mt-1">{label}</p>
      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{description}</p>
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border bg-card hover:bg-muted/40 transition-colors group shadow-2xs"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {description}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
    </Link>
  );
}

function getApplicationStatusBadge(status: ApplicationStatus): string {
  switch (status) {
    case ApplicationStatus.PENDING:
      return "bg-blue-100 text-blue-800";
    case ApplicationStatus.REVIEWED:
      return "bg-amber-100 text-amber-800";
    case ApplicationStatus.SHORTLISTED:
      return "bg-indigo-100 text-indigo-800";
    case ApplicationStatus.INTERVIEW_SCHEDULED:
      return "bg-purple-100 text-purple-800";
    case ApplicationStatus.ACCEPTED:
      return "bg-emerald-100 text-emerald-800";
    case ApplicationStatus.REJECTED:
      return "bg-rose-100 text-rose-800";
    case ApplicationStatus.WITHDRAWN:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getInterviewStatusBadge(status: InterviewStatus): string {
  switch (status) {
    case InterviewStatus.COMPLETED:
      return "bg-emerald-100 text-emerald-800";
    case InterviewStatus.IN_PROGRESS:
      return "bg-amber-100 text-amber-800";
    case InterviewStatus.DRAFT:
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}
