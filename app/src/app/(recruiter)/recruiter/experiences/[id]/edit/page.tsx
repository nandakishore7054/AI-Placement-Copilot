import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { ExperienceForm } from "@/components/experiences/experience-form";
import { getRecruiterExperienceById } from "@/actions/experiences";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Experience — Recruiter",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id: experienceId } = await params;

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

  const experience = await getRecruiterExperienceById(
    experienceId,
    membership.companyId
  );

  if (!experience) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/recruiter/experiences"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Experiences
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Edit Placement Experience
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update the interview guidelines or details for this experience listing.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs">
        <ExperienceForm
          companyId={membership.companyId}
          mode="edit"
          existingExperience={{
            id: experience.id,
            title: experience.title,
            description: experience.description,
            category: experience.category,
            level: experience.level,
            salary: experience.salary ?? "",
            imageUrl: experience.imageUrl ?? "",
            isVisible: experience.isVisible,
          }}
        />
      </div>
    </div>
  );
}
