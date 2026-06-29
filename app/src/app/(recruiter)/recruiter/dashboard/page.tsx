import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recruiter Dashboard",
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your hiring pipeline and team from one place.
        </p>
      </div>

      {/* Stats Cards */}
      {primaryCompany && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={<Briefcase className="h-5 w-5 text-indigo-500" />}
            label="Active Jobs"
            value={primaryCompany._count.jobs}
            href="/recruiter/jobs"
            cta="View Jobs"
            color="indigo"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-violet-500" />}
            label="Team Members"
            value={primaryCompany._count.members}
            href="/recruiter/team"
            cta="Manage Team"
            color="violet"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            label="Total Applications"
            value="—"
            href="/recruiter/applicants"
            cta="View Applicants"
            color="emerald"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickAction
            icon={<Plus className="h-4 w-4" />}
            title="Post a New Job"
            description="Create a job listing for your company"
            href="/recruiter/jobs/new"
            color="indigo"
          />
          <QuickAction
            icon={<Users className="h-4 w-4" />}
            title="Invite Team Member"
            description="Add recruiters, HR, or interviewers to your team"
            href="/recruiter/team"
            color="violet"
          />
        </div>
      </div>

      {/* My Companies */}
      {memberships.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              My Companies
            </h2>
            <Link
              href="/recruiter/company"
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {memberships.map(({ company, role }) => (
              <Link
                key={company.id}
                href="/recruiter/company"
                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 shrink-0">
                  <Building2 className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{company.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {company.industry ?? "—"} · {company._count.members} members
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                  {role.toLowerCase()}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state if no company */}
      {memberships.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-muted/20">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-1">No company yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your company profile to start posting jobs.
          </p>
          <Link
            href="/onboarding/recruiter"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Building2 className="h-4 w-4" />
            Create Company
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  href,
  cta,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  href: string;
  cta: string;
  color: "indigo" | "violet" | "emerald";
}) {
  const colorClasses = {
    indigo: "bg-indigo-50 border-indigo-100",
    violet: "bg-violet-50 border-violet-100",
    emerald: "bg-emerald-50 border-emerald-100",
  };

  return (
    <Link
      href={href}
      className={`p-5 rounded-xl border ${colorClasses[color]} hover:shadow-md transition-all group`}
    >
      <div className="flex items-center justify-between mb-3">
        {icon}
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      <p className="text-xs text-indigo-600 font-medium mt-2">{cta} →</p>
    </Link>
  );
}

function QuickAction({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: "indigo" | "violet";
}) {
  const colorClasses = {
    indigo:
      "border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 [&>div]:bg-indigo-100 [&>div]:text-indigo-600",
    violet:
      "border-violet-100 hover:border-violet-300 hover:bg-violet-50/50 [&>div]:bg-violet-100 [&>div]:text-violet-600",
  };

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 p-4 rounded-xl border bg-card transition-all group ${colorClasses[color]}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </Link>
  );
}
