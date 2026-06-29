import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { Building2, Settings, ExternalLink } from "lucide-react";
import { CompanyHeader } from "@/components/company/company-header";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Company Profile",
};

export default async function CompanyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      onboardingDone: true,
      companyMemberships: {
        include: {
          company: {
            include: {
              _count: {
                select: { jobs: true, members: true, experiences: true },
              },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding");
  if (user.role !== UserRole.RECRUITER && user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const primaryMembership = user.companyMemberships[0];
  const company = primaryMembership?.company;

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="font-semibold text-lg mb-2">No Company Found</h2>
        <p className="text-muted-foreground text-sm mb-4">
          You are not associated with any company yet.
        </p>
        <Link
          href="/onboarding/recruiter"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Create Company
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your company information and settings.
          </p>
        </div>
        {primaryMembership.role === "OWNER" && (
          <Link
            href="/recruiter/company/settings"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Settings className="h-4 w-4" />
            Edit Profile
          </Link>
        )}
      </div>

      {/* Company Header Card */}
      <div className="p-6 rounded-2xl border bg-card">
        <CompanyHeader
          company={company}
          memberCount={company._count.members}
          jobCount={company._count.jobs}
        />

        {company.description && (
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed border-t pt-5">
            {company.description}
          </p>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Jobs", value: company._count.jobs, href: "/recruiter/jobs" },
          { label: "Team Members", value: company._count.members, href: "/recruiter/team" },
          { label: "Experiences", value: company._count.experiences, href: "/recruiter/experiences" },
        ].map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center p-4 rounded-xl border bg-muted/30 hover:bg-muted/60 transition-colors text-center"
          >
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground mt-1">{label}</span>
          </Link>
        ))}
      </div>

      {/* Company Details */}
      <div className="rounded-2xl border bg-card divide-y">
        <DetailRow label="Company Email" value={company.email} />
        <DetailRow label="Industry" value={company.industry ?? "—"} />
        <DetailRow label="Company Size" value={company.size ? `${company.size} employees` : "—"} />
        <DetailRow
          label="Website"
          value={
            company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
              >
                {company.website.replace(/^https?:\/\//, "")}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              "—"
            )
          }
        />
        <DetailRow
          label="Verification"
          value={
            company.verified ? (
              <span className="text-emerald-600 text-sm font-medium">✓ Verified</span>
            ) : (
              <span className="text-muted-foreground text-sm">Pending verification</span>
            )
          }
        />
        <DetailRow
          label="My Role"
          value={
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
              {primaryMembership.role}
            </span>
          }
        />
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {typeof value === "string" ? (
        <span className="text-sm font-medium">{value}</span>
      ) : (
        value
      )}
    </div>
  );
}
