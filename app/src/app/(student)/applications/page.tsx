import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserApplications } from "@/actions/applications";
import { ApplicationsListClient } from "@/components/applications/applications-list-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Applications",
  description: "Track and manage your submitted job applications.",
};

export default async function ApplicationsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const applications = await getUserApplications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My Applications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {applications.length > 0
            ? `You have applied to ${applications.length} position${
                applications.length === 1 ? "" : "s"
              }.`
            : "Track your active job applications and interview schedules."}
        </p>
      </div>

      {/* Applications List with Search & Filtering */}
      <ApplicationsListClient initialApplications={applications} />
    </div>
  );
}
