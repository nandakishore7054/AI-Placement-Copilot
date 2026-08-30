// src/app/(recruiter)/recruiter/jobs/[id]/edit/page.tsx
// Edit an existing job listing.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { RecruiterJobForm } from "@/components/jobs/recruiter-job-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await db.job.findUnique({ where: { id }, select: { title: true } });
  return { title: job ? `Edit: ${job.title}` : "Edit Job" };
}

export default async function EditJobPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      onboardingDone: true,
      companyMemberships: {
        select: {
          company: { select: { id: true, name: true } },
          role: true,
        },
      },
    },
  });

  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding");
  if (user.role !== UserRole.RECRUITER && user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const membership = user.companyMemberships[0];
  if (!membership) redirect("/recruiter/company");

  // Fetch the job — verify it belongs to this recruiter's company
  const job = await db.job.findUnique({
    where: { id, companyId: membership.company.id },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      category: true,
      level: true,
      type: true,
      salary: true,
      applyLink: true,
      isVisible: true,
    },
  });

  if (!job) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back nav */}
      <Link
        href="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
        <p className="text-muted-foreground mt-1 text-sm truncate">
          {job.title}
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border bg-card p-6">
        <RecruiterJobForm
          companyId={membership.company.id}
          mode="edit"
          existingJob={{
            id: job.id,
            title: job.title,
            description: job.description,
            location: job.location,
            category: job.category as any,
            level: job.level,
            type: job.type,
            salary: job.salary ?? "",
            applyLink: job.applyLink ?? "",
            isVisible: job.isVisible,
          }}
        />
      </div>
    </div>
  );
}
