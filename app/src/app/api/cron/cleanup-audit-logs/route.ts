import { NextRequest, NextResponse } from "next/server";
import { cleanupOldAuditLogs } from "@/lib/audit";
import { captureException } from "@/lib/sentry";
import { AuditRetentionSchema } from "@/schemas/audit";

export const dynamic = "force-dynamic";

/**
 * GET/POST /api/cron/cleanup-audit-logs
 * Vercel Cron or external scheduler endpoint for automated audit log pruning (>90 days).
 * Protected by CRON_SECRET bearer token.
 */
async function handleCleanup(req: NextRequest) {
  // 1. Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const rawDays = url.searchParams.get("retentionDays") ?? undefined;
    const { retentionDays } = AuditRetentionSchema.parse({
      retentionDays: rawDays,
    });

    const result = await cleanupOldAuditLogs(retentionDays);

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up audit logs older than ${retentionDays} days`,
      deletedCount: result.deletedCount,
      cutoffDate: result.cutoffDate.toISOString(),
      retentionDays,
    });
  } catch (error) {
    captureException(error, { endpoint: "/api/cron/cleanup-audit-logs" });
    return NextResponse.json(
      { error: "Audit log cleanup cron job failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}
