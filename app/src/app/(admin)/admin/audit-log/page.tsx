import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole, AuditAction, AuditEntity } from "@prisma/client";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Shield,
  Search,
} from "lucide-react";
import type { Metadata } from "next";
import { getAuditLogs } from "@/actions/audit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Log Viewer | Admin Panel",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    action?: string;
    entityType?: string;
  }>;
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Admin role assertion
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10) || 1;
  const action = (resolvedParams.action as AuditAction) || undefined;
  const entityType = (resolvedParams.entityType as AuditEntity) || undefined;

  const pageSize = 25;
  const { logs, total, hasNextPage } = await getAuditLogs({
    page,
    pageSize,
    action,
    entityType,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Admin Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform Audit Trail
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Immutable log of all user activities, status changes, AI invocations, and cron executions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border">
            <Shield className="h-3.5 w-3.5 text-indigo-500" />
            <span>Retention Policy: 90 Days</span>
          </span>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl border">
            <Activity className="h-3.5 w-3.5 text-rose-500" />
            <span>{total} Total Audit Records</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border bg-card shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter Logs:</span>
        </div>

        {/* Action Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/admin/audit-log?${new URLSearchParams({
              ...(entityType && { entityType }),
            }).toString()}`}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              !action
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Actions
          </Link>
          {[
            AuditAction.STATUS_CHANGE,
            AuditAction.APPLY,
            AuditAction.CREATE,
            AuditAction.UPDATE,
            AuditAction.DELETE,
            AuditAction.EXPORT,
          ].map((act) => (
            <Link
              key={act}
              href={`/admin/audit-log?${new URLSearchParams({
                action: act,
                ...(entityType && { entityType }),
              }).toString()}`}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                action === act
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {act}
            </Link>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor / User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Metadata / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No audit records match the selected criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const userName = log.user
                    ? `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() || log.user.email
                    : "System Service";
                  return (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">
                        {userName}
                        {log.user?.email && (
                          <span className="block text-[10px] text-muted-foreground font-mono">
                            {log.user.email}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getAuditActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-foreground">
                        {log.entityType}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                        {log.entityId ? `${log.entityId.slice(0, 14)}...` : "—"}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[11px] text-muted-foreground font-mono">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> ({total} entries)
          </p>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/audit-log?${new URLSearchParams({
                page: String(page - 1),
                ...(action && { action }),
                ...(entityType && { entityType }),
              }).toString()}`}
              aria-disabled={page <= 1}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                page <= 1
                  ? "pointer-events-none opacity-40 bg-muted/40"
                  : "bg-card hover:bg-muted/40 text-foreground"
              }`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Link>

            <Link
              href={`/admin/audit-log?${new URLSearchParams({
                page: String(page + 1),
                ...(action && { action }),
                ...(entityType && { entityType }),
              }).toString()}`}
              aria-disabled={!hasNextPage}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                !hasNextPage
                  ? "pointer-events-none opacity-40 bg-muted/40"
                  : "bg-card hover:bg-muted/40 text-foreground"
              }`}
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Badge Helper ───────────────────────────────────────────────────────────────

function getAuditActionBadge(action: AuditAction): string {
  switch (action) {
    case AuditAction.CREATE:
      return "bg-emerald-100 text-emerald-800";
    case AuditAction.UPDATE:
      return "bg-blue-100 text-blue-800";
    case AuditAction.DELETE:
      return "bg-rose-100 text-rose-800";
    case AuditAction.STATUS_CHANGE:
      return "bg-purple-100 text-purple-800";
    case AuditAction.APPLY:
      return "bg-amber-100 text-amber-800";
    case AuditAction.EXPORT:
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}
