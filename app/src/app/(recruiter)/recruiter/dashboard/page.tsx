import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole, ApplicationStatus, CompanyRole } from "@prisma/client";
import Link from "next/link";
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle,
  Clock,
  UserCheck,
  Eye,
  Mail,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recruiter Dashboard | AI Placement Copilot",
};

export default async function RecruiterDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Verify recruiter role
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      firstName: true,
      onboardingDone: true,
      companyMemberships: {
        include: {
          company: {
            include: {
              _count: { select: { jobs: true, members: true } },
            },
          },
        },
      },
    },
  });

  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding");
  if (user.role !== UserRole.RECRUITER && user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const memberships = user.companyMemberships;
  const primaryCompany = memberships[0]?.company ?? null;

  let totalJobs = 0;
  let activeListings = 0;
  let totalApplications = 0;
  let recentApplicants: any[] = [];
  let teamMembers: any[] = [];

  if (primaryCompany) {
    const [jobsCount, activeJobsCount, appsCount, recentApps, members] = await Promise.all([
      db.job.count({ where: { companyId: primaryCompany.id } }),
      db.job.count({ where: { companyId: primaryCompany.id, isVisible: true } }),
      db.application.count({ where: { job: { companyId: primaryCompany.id } } }),
      db.application.findMany({
        where: { job: { companyId: primaryCompany.id } },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { appliedAt: "desc" },
        take: 5,
      }),
      db.companyMember.findMany({
        where: { companyId: primaryCompany.id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
        take: 6,
      }),
    ]);

    totalJobs = jobsCount;
    activeListings = activeJobsCount;
    totalApplications = appsCount;
    recentApplicants = recentApps;
    teamMembers = members;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {user.firstName || "Recruiter"} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {primaryCompany
              ? `Hiring portal & applicant tracking for ${primaryCompany.name}.`
              : "Manage your company hiring pipeline and team."}
          </p>
        </div>
        {primaryCompany && (
          <div className="flex items-center gap-2">
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post New Job</span>
            </Link>
            <Link
              href="/recruiter/applicants"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border bg-card text-foreground text-xs font-semibold hover:bg-muted/40 transition-colors shadow-2xs"
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>View All Applicants</span>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards (jobs, applicants, active listings, team size) */}
      {primaryCompany && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Briefcase className="h-4 w-4 text-indigo-600" />}
            label="Total Jobs"
            value={totalJobs}
            description="All job postings"
            href="/recruiter/jobs"
            cta="Manage Jobs"
            color="indigo"
          />
          <StatCard
            icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
            label="Active Listings"
            value={activeListings}
            description="Live on candidate portal"
            href="/recruiter/jobs"
            cta="View Active"
            color="emerald"
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4 text-violet-600" />}
            label="Total Applicants"
            value={totalApplications}
            description="Across all postings"
            href="/recruiter/applicants"
            cta="Review Pipeline"
            color="violet"
          />
          <StatCard
            icon={<Users className="h-4 w-4 text-amber-600" />}
            label="Team Size"
            value={primaryCompany._count.members}
            description="Recruiters & hiring managers"
            href="/recruiter/team"
            cta="Manage Team"
            color="amber"
          />
        </div>
      )}

      {/* Main Content Grid: Recent Applicants + Team Members */}
      {primaryCompany && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applicants Section (2 Cols) */}
          <div className="lg:col-span-2 rounded-3xl border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  Recent Candidate Applications
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Latest candidates who applied to your open listings
                </p>
              </div>
              <Link
                href="/recruiter/applicants"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View Pipeline ({totalApplications}) →
              </Link>
            </div>

            {recentApplicants.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Users className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm font-semibold text-foreground">No applications yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  As students discover your job listings and apply, their profiles and resume intelligence will appear here.
                </p>
                <div className="pt-2">
                  <Link
                    href="/recruiter/jobs/new"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Post another listing
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentApplicants.map((app) => {
                  const candidateName =
                    `${app.user.firstName || ""} ${app.user.lastName || ""}`.trim() ||
                    app.user.email;
                  return (
                    <div
                      key={app.id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-muted/20 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {app.user.firstName?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/recruiter/applicants`}
                            className="font-semibold text-sm text-foreground hover:text-indigo-600 transition-colors truncate block"
                          >
                            {candidateName}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">
                            Applied for <span className="font-medium text-foreground/80">{app.job.title}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getApplicationStatusBadge(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {new Date(app.appliedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team Members Section (1 Col) */}
          <div className="rounded-3xl border bg-card p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-600" />
                    Team Members
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hiring team at {primaryCompany.name}
                  </p>
                </div>
                <Link
                  href="/recruiter/team"
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                >
                  Manage ({teamMembers.length}) →
                </Link>
              </div>

              <div className="divide-y divide-border/60">
                {teamMembers.map((member) => {
                  const memberName =
                    `${member.user.firstName || ""} ${member.user.lastName || ""}`.trim() ||
                    member.user.email;
                  return (
                    <div key={member.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {member.user.firstName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {memberName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              href="/recruiter/team"
              className="w-full text-center py-2 px-3 rounded-xl border border-dashed text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-colors block"
            >
              + Invite Team Member
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Recruiter Operations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            icon={<Plus className="h-4 w-4 text-indigo-600" />}
            title="Post a New Job"
            description="Create listings with automatic vector embeddings"
            href="/recruiter/jobs/new"
          />
          <QuickAction
            icon={<Briefcase className="h-4 w-4 text-emerald-600" />}
            title="Manage Job Listings"
            description="Edit, close, or toggle visibility of postings"
            href="/recruiter/jobs"
          />
          <QuickAction
            icon={<TrendingUp className="h-4 w-4 text-violet-600" />}
            title="Applicant Review"
            description="Evaluate ATS scores and change statuses"
            href="/recruiter/applicants"
          />
          <QuickAction
            icon={<Building2 className="h-4 w-4 text-amber-600" />}
            title="Company Profile"
            description="Update company brand, logo, and website"
            href="/recruiter/company"
          />
        </div>
      </div>

      {/* My Companies Overview */}
      {memberships.length > 0 && (
        <div className="rounded-3xl border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-foreground">Registered Companies</h2>
              <p className="text-xs text-muted-foreground">Companies you are authorized to recruit for</p>
            </div>
            <Link
              href="/recruiter/company"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Company Settings →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {memberships.map(({ company, role }) => (
              <div
                key={company.id}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{company.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {company.industry || "Technology"} · {company._count.members} members
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(role)}`}>
                  {role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State If No Company Membership */}
      {memberships.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-3xl bg-muted/20 space-y-4">
          <Building2 className="h-12 w-12 text-muted-foreground opacity-60" />
          <div className="max-w-md space-y-1">
            <h3 className="font-bold text-lg text-foreground">No Company Affiliation Yet</h3>
            <p className="text-muted-foreground text-sm">
              To post jobs and review student candidates, create or join a verified company profile.
            </p>
          </div>
          <Link
            href="/onboarding/recruiter"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
          >
            <Building2 className="h-4 w-4" />
            Create Company Profile
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components & Helpers ───────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  description,
  href,
  cta,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  description: string;
  href: string;
  cta: string;
  color: "indigo" | "violet" | "emerald" | "amber";
}) {
  const colorClasses = {
    indigo: "bg-indigo-50/70 border-indigo-100 hover:border-indigo-200",
    violet: "bg-violet-50/70 border-violet-100 hover:border-violet-200",
    emerald: "bg-emerald-50/70 border-emerald-100 hover:border-emerald-200",
    amber: "bg-amber-50/70 border-amber-100 hover:border-amber-200",
  };

  return (
    <Link
      href={href}
      className={`p-4 sm:p-5 rounded-2xl border ${colorClasses[color]} hover:shadow-xs transition-all group`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="p-1.5 rounded-lg bg-white/80 shadow-2xs">{icon}</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
      <p className="text-2xl sm:text-3xl font-black text-foreground">{value}</p>
      <p className="text-xs font-bold text-foreground/80 mt-1">{label}</p>
      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{description}</p>
      <p className="text-[11px] text-indigo-600 font-semibold mt-2 group-hover:underline">{cta} →</p>
    </Link>
  );
}

function QuickAction({
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
      className="flex items-start gap-3.5 p-3.5 rounded-2xl border bg-card hover:bg-muted/40 transition-colors group shadow-2xs"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/80 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
      </div>
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

function getRoleBadge(role: CompanyRole): string {
  switch (role) {
    case CompanyRole.ADMIN:
      return "bg-rose-100 text-rose-800";
    case CompanyRole.RECRUITER:
      return "bg-indigo-100 text-indigo-800";
    case CompanyRole.HR:
      return "bg-emerald-100 text-emerald-800";
    case CompanyRole.INTERVIEWER:
      return "bg-violet-100 text-violet-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}
