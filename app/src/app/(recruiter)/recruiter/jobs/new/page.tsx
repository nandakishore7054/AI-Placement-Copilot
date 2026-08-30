// src/app/(recruiter)/recruiter/jobs/new/page.tsx
// Post a new job listing.

import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { RecruiterJobForm } from "@/components/jobs/recruiter-job-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Post a Job — Recruiter",
};

export default async function NewJobPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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
        <h1 className="text-2xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Posting on behalf of{" "}
          <span className="font-medium text-foreground">{membership.company.name}</span>
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border bg-card p-6">
        <RecruiterJobForm companyId={membership.company.id} mode="create" />
      </div>
    </div>
  );
}
