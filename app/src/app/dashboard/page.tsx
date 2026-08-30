import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Mic,
  Map,
  ArrowRight,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import { RecommendedJobsSection } from "@/components/jobs/recommended-jobs-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
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
  const profileComplete =
    profile && profile.skills.length > 0 && !!profile.bio;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hello, {user.firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Your AI-powered career companion is ready.
        </p>
      </div>

      {/* Profile Completion Banner */}
      {!profileComplete && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <Star className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Complete your profile to get better job matches
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Add your skills, bio, and preferences to unlock AI recommendations.
            </p>
          </div>
          <Link
            href="/profile"
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors shrink-0"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Applications"
          value={user._count.applications}
          href="/applications"
          color="indigo"
        />
        <StatCard
          label="Interviews"
          value={user._count.interviews}
          href="/interviews"
          color="violet"
        />
        <StatCard
          label="Roadmaps"
          value={user._count.careerRoadmaps}
          href="/career"
          color="emerald"
        />
      </div>

      {/* Recommended Jobs via pgvector semantic matching */}
      <RecommendedJobsSection limit={6} />

      {/* Profile Summary */}
      {profile && (
        <div className="p-5 rounded-2xl border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your Profile</h2>
            <Link
              href="/profile"
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Edit →
            </Link>
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {profile.skills.slice(0, 12).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {profile.skills.length > 12 && (
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                  +{profile.skills.length - 12} more
                </span>
              )}
            </div>
          )}

          {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
            <div className="flex items-center gap-3 text-xs">
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  LinkedIn ↗
                </a>
              )}
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  GitHub ↗
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Portfolio ↗
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feature Navigation */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Explore Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FeatureCard
            icon={<Briefcase className="h-5 w-5 text-indigo-500" />}
            title="Browse Jobs"
            description="Semantically matched to your skills"
            href="/jobs"
            color="indigo"
          />
          <FeatureCard
            icon={<Mic className="h-5 w-5 text-violet-500" />}
            title="AI Mock Interview"
            description="Practice with voice-based AI"
            href="/interviews"
            color="violet"
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5 text-emerald-500" />}
            title="Resume Analysis"
            description="Get ATS score and improvement tips"
            href="/resume"
            color="emerald"
          />
          <FeatureCard
            icon={<Map className="h-5 w-5 text-amber-500" />}
            title="Career Roadmap"
            description="AI-generated milestone plan"
            href="/career"
            color="amber"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  href,
  color,
}: {
  label: string;
  value: number;
  href: string;
  color: "indigo" | "violet" | "emerald";
}) {
  const colorClass = {
    indigo: "bg-indigo-50 border-indigo-100",
    violet: "bg-violet-50 border-violet-100",
    emerald: "bg-emerald-50 border-emerald-100",
  }[color];

  return (
    <Link
      href={href}
      className={`p-4 rounded-xl border ${colorClass} text-center hover:shadow-md transition-all`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </Link>
  );
}

function FeatureCard({
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
  color: "indigo" | "violet" | "emerald" | "amber";
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {description}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
    </Link>
  );
}
