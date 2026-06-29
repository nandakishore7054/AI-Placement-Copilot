"use client";

import Image from "next/image";
import { useState } from "react";
import { User, MoreVertical, Shield, UserX, ChevronDown } from "lucide-react";
import { CompanyRole } from "@prisma/client";
import type { CompanyMemberWithUser } from "@/types";
import { RoleBadge } from "@/components/company/role-badge";
import { useCompanyRole } from "@/hooks/use-company-role";
import { updateMemberRole, removeMember } from "@/actions/company";
import { toast } from "sonner";

const ASSIGNABLE_ROLES = [
  CompanyRole.ADMIN,
  CompanyRole.RECRUITER,
  CompanyRole.HR,
  CompanyRole.INTERVIEWER,
] as const;

interface TeamMemberCardProps {
  member: CompanyMemberWithUser;
  companyId: string;
  currentUserId: string;
  currentUserRole: CompanyRole;
  onUpdate?: () => void;
}

export function TeamMemberCard({
  member,
  companyId,
  currentUserId,
  currentUserRole,
  onUpdate,
}: TeamMemberCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const { can } = useCompanyRole(companyId, currentUserRole);
  const isCurrentUser = member.user.id === currentUserId;
  const isOwner = member.role === CompanyRole.OWNER;
  const canManage = can(CompanyRole.ADMIN) && !isCurrentUser && !isOwner;

  async function handleRoleChange(newRole: CompanyRole) {
    if (!canManage) return;
    setIsChangingRole(true);
    try {
      await updateMemberRole(companyId, { memberId: member.id, role: newRole as any });
      toast.success(`Role updated to ${newRole}`);
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsChangingRole(false);
      setIsMenuOpen(false);
    }
  }

  async function handleRemove() {
    if (!canManage) return;
    setIsRemoving(true);
    try {
      await removeMember(member.id, companyId);
      toast.success("Member removed from team");
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setIsRemoving(false);
      setIsMenuOpen(false);
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors group">
      {/* Avatar */}
      <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted">
        {member.user.imageUrl ? (
          <Image
            src={member.user.imageUrl}
            alt={`${member.user.firstName} ${member.user.lastName}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {member.user.firstName} {member.user.lastName}
          </span>
          {isCurrentUser && (
            <span className="text-xs text-muted-foreground">(you)</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {member.user.email}
        </p>
      </div>

      {/* Role Badge */}
      <RoleBadge role={member.role} />

      {/* Actions Menu */}
      {canManage && (
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((o) => !o)}
            className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
            aria-label="Member options"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-52 rounded-xl border bg-popover shadow-lg overflow-hidden">
                {/* Change Role */}
                <div className="p-1.5">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Change Role
                  </p>
                  {ASSIGNABLE_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      disabled={isChangingRole || member.role === role}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted disabled:opacity-40 transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                      {member.role === role && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Current
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t p-1.5">
                  <button
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Remove from team
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
