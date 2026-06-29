import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole, CompanyRole } from "@prisma/client";
import { TeamMemberCard } from "@/components/company/team-member-card";
import { InviteMemberModal } from "@/components/company/invite-member-modal";
import { RoleBadge } from "@/components/company/role-badge";
import { Users, Shield } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team Management",
};

export default async function TeamPage() {
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
              members: {
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
  const currentUserRole = primaryMembership?.role ?? CompanyRole.INTERVIEWER;
  const canInvite =
    currentUserRole === CompanyRole.OWNER ||
    currentUserRole === CompanyRole.ADMIN;

  if (!company) redirect("/recruiter/dashboard");

  // Group members by role for display
  const owners = company.members.filter((m) => m.role === CompanyRole.OWNER);
  const admins = company.members.filter((m) => m.role === CompanyRole.ADMIN);
  const recruiters = company.members.filter(
    (m) => m.role === CompanyRole.RECRUITER,
  );
  const hrMembers = company.members.filter((m) => m.role === CompanyRole.HR);
  const interviewers = company.members.filter(
    (m) => m.role === CompanyRole.INTERVIEWER,
  );

  const roleGroups = [
    { label: "Owner", members: owners },
    { label: "Admins", members: admins },
    { label: "Recruiters", members: recruiters },
    { label: "HR", members: hrMembers },
    { label: "Interviewers", members: interviewers },
  ].filter((g) => g.members.length > 0);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {company.name} · {company.members.length} member
            {company.members.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canInvite && (
          <InviteMemberModal companyId={company.id} />
        )}
      </div>

      {/* RBAC Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border bg-muted/30">
        <Shield className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium mb-1">Role-based Access Control</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
            <span><strong className="text-foreground">Owner</strong> — Full control</span>
            <span><strong className="text-foreground">Admin</strong> — Manage members & settings</span>
            <span><strong className="text-foreground">Recruiter</strong> — Post & manage jobs</span>
            <span><strong className="text-foreground">HR</strong> — Update application status</span>
            <span><strong className="text-foreground">Interviewer</strong> — View applicants</span>
          </div>
        </div>
      </div>

      {/* Member Groups */}
      {roleGroups.map(({ label, members }) => (
        <div key={label}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
            <span className="text-xs text-muted-foreground">
              ({members.length})
            </span>
          </div>
          <div className="space-y-2">
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                companyId={company.id}
                currentUserId={userId}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Empty */}
      {company.members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-muted/20">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold">No team members yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Invite your colleagues to collaborate.
          </p>
        </div>
      )}
    </div>
  );
}
