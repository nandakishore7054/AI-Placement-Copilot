import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { Plus, Award, Clock, ArrowRight } from "lucide-react";
import { JobBadge } from "@/components/jobs/job-badge";
import { ExperienceStatusToggle } from "@/components/experiences/experience-status-toggle";
import { DeleteExperienceDialog } from "@/components/experiences/delete-experience-dialog";
import { getRecruiterExperiences } from "@/actions/experiences";
import { timeAgo, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Experiences — Recruiter",
  description: "Share and manage company interview and placement experiences.",
};

export default async function RecruiterExperiencesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      onboardingDone: true,
      companyMemberships: {
        include: { company: true },
      },
    },
  });

  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding");
  if (user.role !== UserRole.RECRUITER && user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const membership = user.companyMemberships[0];
  if (!membership) {
    redirect("/onboarding/recruiter");
  }

  const company = membership.company;
  const experiences = await getRecruiterExperiences(company.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Placement & Interview Experiences
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {experiences.length > 0
              ? `${experiences.length} experience${
                  experiences.length !== 1 ? "s" : ""
                } published for ${company.name}`
              : `Share verified interview tips and experiences for ${company.name}`}
          </p>
        </div>

        <Link
          href="/recruiter/experiences/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Share Experience
        </Link>
      </div>

      {/* Empty State */}
      {experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 py-16 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
            <Award className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-1.5">
            No experiences shared yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
            Publish interview rounds, technical questions, and candidate advice to help prospective students prepare for roles at {company.name}.
          </p>
          <Link
            href="/recruiter/experiences/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Share First Experience
          </Link>
        </div>
      ) : (
        /* Experience List */
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="rounded-2xl border bg-card p-5 space-y-4 hover:shadow-xs transition-shadow"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-base text-foreground truncate">
                    {exp.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exp.category}
                  </p>
                </div>

                <ExperienceStatusToggle
                  experienceId={exp.id}
                  companyId={company.id}
                  isVisible={exp.isVisible}
                />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <JobBadge type="level" value={exp.level} />
                {exp.salary && (
                  <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {exp.salary}
                  </span>
                )}
              </div>

              {/* Excerpt */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {truncate(exp.description.replace(/<[^>]*>?/gm, ""), 180)}
              </p>

              {/* Meta + Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Posted {timeAgo(exp.createdAt)}</span>
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/experiences/${exp.id}`}
                    target="_blank"
                    className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    Preview ↗
                  </Link>
                  <Link
                    href={`/recruiter/experiences/${exp.id}/edit`}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteExperienceDialog
                    experienceId={exp.id}
                    companyId={company.id}
                    experienceTitle={exp.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
