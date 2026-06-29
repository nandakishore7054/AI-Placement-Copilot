"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompanyRole } from "@prisma/client";
import { UserPlus, Search, Loader2, X, CheckCircle } from "lucide-react";
import { InviteMemberSchema } from "@/schemas/company";
import type { InviteMemberInput } from "@/schemas/company";
import { searchUserByEmail, inviteMember } from "@/actions/company";
import { toast } from "sonner";
import { RoleBadge } from "@/components/company/role-badge";

interface UserResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
}

const INVITABLE_ROLES = [
  { value: CompanyRole.ADMIN, label: "Admin" },
  { value: CompanyRole.RECRUITER, label: "Recruiter" },
  { value: CompanyRole.HR, label: "HR" },
  { value: CompanyRole.INTERVIEWER, label: "Interviewer" },
] as const;

interface InviteMemberModalProps {
  companyId: string;
  onSuccess?: () => void;
}

export function InviteMemberModal({ companyId, onSuccess }: InviteMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emailQuery, setEmailQuery] = useState("");
  const [foundUser, setFoundUser] = useState<UserResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CompanyRole>(CompanyRole.RECRUITER);
  const [isPending, startTransition] = useTransition();

  async function handleSearch() {
    if (!emailQuery.trim() || emailQuery.length < 3) return;
    setIsSearching(true);
    setFoundUser(null);
    try {
      const user = await searchUserByEmail(emailQuery.trim());
      setFoundUser(user as UserResult | null);
      if (!user) toast.error("No user found with that email address.");
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleInvite() {
    if (!foundUser) return;
    startTransition(async () => {
      try {
        await inviteMember({
          companyId,
          userId: foundUser.id,
          role: selectedRole,
        });
        toast.success(`${foundUser.firstName} added to the team as ${selectedRole}`);
        setIsOpen(false);
        resetForm();
        onSuccess?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to invite member");
      }
    });
  }

  function resetForm() {
    setEmailQuery("");
    setFoundUser(null);
    setSelectedRole(CompanyRole.RECRUITER);
  }

  function handleClose() {
    setIsOpen(false);
    resetForm();
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Invite Member
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Invite Team Member</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Search by email address to add a registered user
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Email Search */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailQuery}
                  onChange={(e) => {
                    setEmailQuery(e.target.value);
                    setFoundUser(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="colleague@company.com"
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !emailQuery.trim()}
                  className="px-3 py-2 rounded-lg border bg-muted hover:bg-muted/80 disabled:opacity-50 transition-colors"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Found User Card */}
            {foundUser && (
              <div className="mt-4 p-3 rounded-xl border bg-muted/30 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700 font-semibold text-sm">
                  {foundUser.firstName[0]}{foundUser.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {foundUser.firstName} {foundUser.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {foundUser.email}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              </div>
            )}

            {/* Role Selection */}
            {foundUser && (
              <div className="mt-4 space-y-3">
                <label className="text-sm font-medium">Assign Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {INVITABLE_ROLES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedRole(value)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedRole === value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Admin:</strong> Manage members & settings ·{" "}
                  <strong>Recruiter:</strong> Post jobs ·{" "}
                  <strong>HR:</strong> Update application status ·{" "}
                  <strong>Interviewer:</strong> View applicants
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              {foundUser && (
                <button
                  onClick={handleInvite}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add to Team
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
