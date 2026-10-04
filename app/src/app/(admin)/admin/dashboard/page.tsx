import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole, AuditAction } from "@prisma/client";
import Link from "next/link";
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Mic,
  Mail,
  ShieldAlert,
  FileText,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import { getAdminAnalytics, getModerationJobs } from "@/actions/admin";
import { JobModerationToggle } from "@/components/admin/job-moderation-toggle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard | AI Placement Copilot",
};

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Admin access check
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, firstName: true },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  // Fetch admin analytics, moderation jobs, and recent audit logs
  const [analytics, moderationData, recentAuditLogs] = await Promise.all([
    getAdminAnalytics(),
    getModerationJobs({ page: 1, pageSize: 6 }),
    db.auditLog.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-rose-500/5 p-6 sm:p-8 shadow-xs shadow-inner-glow">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider">
                System Admin
              </span>
              <span className="text-xs text-muted-foreground">Governance & Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-2">
              Platform Administration
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Real-time analytics, content moderation, and compliance audit trail across all colleges and recruiters.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/audit-log"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted/60 transition-colors shadow-2xs"
            >
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Audit Log Viewer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <AnalyticsCard
          label="Total Users"
          value={analytics.users.total}
          subtext={`${analytics.users.students} std · ${analytics.users.recruiters} rec`}
          color="indigo"
          icon={<Users className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Companies"
          value={analytics.companies.total}
          subtext="Verified recruiters"
          color="violet"
          icon={<Building2 className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Jobs"
          value={analytics.jobs.total}
          subtext={`${analytics.jobs.active} active · ${analytics.jobs.hidden} hidden`}
          color="emerald"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Applications"
          value={analytics.applications.total}
          subtext="Submitted placements"
          color="amber"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Mock Interviews"
          value={analytics.interviews.total}
          subtext={`${analytics.interviews.completed} completed`}
          color="purple"
          icon={<Mic className="h-4 w-4" />}
        />
        <AnalyticsCard
          label="Subscribers"
          value={analytics.subscriptions.active}
          subtext={`${analytics.subscriptions.total} total`}
          color="rose"
          icon={<Mail className="h-4 w-4" />}
        />
      </div>

      {/* AI Intelligence Metrics Row */}
      <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs shadow-inner-glow">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-indigo-400 border border-primary/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="font-bold text-sm text-foreground">AI Intelligence & Placement Throughput</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 shadow-2xs">
            <p className="text-xs text-muted-foreground font-semibold">Resumes Analyzed (ATS)</p>
            <p className="text-2xl font-black text-foreground mt-1 tabular-nums">{analytics.aiMetrics.resumesAnalyzed}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Parsed with Gemini 2.5 Flash</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 shadow-2xs">
            <p className="text-xs text-muted-foreground font-semibold">Skill Gaps Computed</p>
            <p className="text-2xl font-black text-foreground mt-1 tabular-nums">{analytics.aiMetrics.skillGapsCalculated}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Market readiness calibrations</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 shadow-2xs">
            <p className="text-xs text-muted-foreground font-semibold">Career Roadmaps Active</p>
            <p className="text-2xl font-black text-foreground mt-1 tabular-nums">{analytics.aiMetrics.roadmapsGenerated}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Structured milestone guides</p>
          </div>
        </div>
      </div>

      {/* Main Admin Section: Content Moderation & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Moderation Area (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs shadow-inner-glow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div>
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Job Listing Moderation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review postings, verify company listings, or toggle candidate visibility
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {moderationData.total} Total Listings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Job Title</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Applicants</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Visibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {moderationData.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3">
                      <Link
                        href={`/jobs/${job.id}`}
                        target="_blank"
                        className="font-semibold text-foreground hover:text-primary transition-colors block truncate max-w-[200px]"
                      >
                        {job.title}
                      </Link>
                      <span className="text-[11px] text-muted-foreground capitalize">
                        {job.level.toLowerCase()} · {job.location}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-foreground truncate max-w-[130px]">
                        {job.company.name}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {job.company.industry || "General"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium border border-border/80">
                        {job.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-foreground">
                      {job._count.applications}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <JobModerationToggle
                        jobId={job.id}
                        initialVisible={job.isVisible}
                        jobTitle={job.title}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Snippet & Recent Activity (1 Col) */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs shadow-inner-glow space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div>
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-500" />
                  Recent Audit Trail
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Platform operations log
                </p>
              </div>
              <Link
                href="/admin/audit-log"
                className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                Full Viewer →
              </Link>
            </div>

            <div className="divide-y divide-border/60">
              {recentAuditLogs.map((log) => {
                const userName = log.user
                  ? `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() || log.user.email
                  : "System Service";
                return (
                  <div key={log.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getAuditActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">
                      {log.entityType} · <span className="text-muted-foreground">{userName}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href="/admin/audit-log"
            className="w-full text-center py-2.5 px-3 rounded-xl border border-dashed border-border/80 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-colors block"
          >
            Inspect full audit trail
          </Link>
        </div>
      </div>

      {/* Recent User Signups */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs shadow-inner-glow space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-foreground">Recent Registrations</h2>
          <span className="text-xs text-muted-foreground">Latest registered platform members</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {analytics.recentSignups.map((su) => (
            <div
              key={su.id}
              className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {`${su.firstName || ""} ${su.lastName || ""}`.trim() || su.email}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{su.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${getUserRoleBadge(su.role)}`}>
                {su.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components & Helpers ───────────────────────────────────────────────────

function AnalyticsCard({
  label,
  value,
  subtext,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  subtext: string;
  color: "indigo" | "violet" | "emerald" | "amber" | "purple" | "rose";
  icon: React.ReactNode;
}) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  return (
    <div className="p-4 rounded-2xl border border-border bg-card shadow-xs shadow-inner-glow transition-all hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1.5 rounded-lg border shadow-2xs ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-foreground tabular-nums">{value}</p>
      <p className="text-xs font-bold text-foreground/80 mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{subtext}</p>
    </div>
  );
}

function getAuditActionBadge(action: AuditAction): string {
  switch (action) {
    case AuditAction.CREATE:
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
    case AuditAction.UPDATE:
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20";
    case AuditAction.DELETE:
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20";
    case AuditAction.STATUS_CHANGE:
      return "bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20";
    case AuditAction.APPLY:
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
    case AuditAction.EXPORT:
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

function getUserRoleBadge(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20";
    case UserRole.RECRUITER:
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20";
    case UserRole.STUDENT:
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}
