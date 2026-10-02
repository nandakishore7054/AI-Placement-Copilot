import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendJobDigestEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";

// Force dynamic — this route reads env vars and calls external services at runtime
export const dynamic = "force-dynamic";

// GET /api/cron/weekly-digest — Vercel Cron (runs every Monday 9AM UTC)
// Protected by CRON_SECRET to prevent unauthorized triggers
export async function GET(req: NextRequest) {
  // 1. Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Fetch active subscribers with user profile and job recommendations
    const subscribers = await db.subscription.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            studentProfile: {
              select: {
                skills: true,
                preferredCategories: true,
                preferredLocations: true,
              },
            },
            recommendations: {
              where: { type: "JOB", isDismissed: false },
              select: { metadata: true },
              take: 5,
            },
          },
        },
      },
    });

    if (subscribers.length === 0) {
      await createAuditLog({
        action: AuditAction.EXPORT,
        entityType: AuditEntity.SUBSCRIPTION,
        entityId: "cron-weekly-digest",
        metadata: {
          totalSubscribers: 0,
          sent: 0,
          status: "NO_ACTIVE_SUBSCRIBERS",
        },
      });

      return NextResponse.json({
        message: "No active subscribers found",
        sent: 0,
        total: 0,
      });
    }

    // 3. Pre-fetch general latest visible jobs as pool
    const recentJobs = await db.job.findMany({
      where: { isVisible: true },
      include: {
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    if (recentJobs.length === 0) {
      await createAuditLog({
        action: AuditAction.EXPORT,
        entityType: AuditEntity.SUBSCRIPTION,
        entityId: "cron-weekly-digest",
        metadata: {
          totalSubscribers: subscribers.length,
          sent: 0,
          status: "NO_JOBS_AVAILABLE",
        },
      });

      return NextResponse.json({
        message: "No active job listings to digest",
        sent: 0,
        total: subscribers.length,
      });
    }

    const fallbackJobData = recentJobs.slice(0, 5).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      location: job.location,
    }));

    // 4. Send personalized digest to each subscriber with graceful error isolation
    let sent = 0;
    const errors: string[] = [];

    for (const subscriber of subscribers) {
      try {
        const user = subscriber.user;
        const firstName = user?.firstName || "there";
        let userJobs = [...fallbackJobData];

        // If user has a profile or recommendations, personalize the digest
        if (user) {
          const profile = user.studentProfile;
          const recommendedJobIds: string[] = (user.recommendations || [])
            .map((r) => {
              const meta = r.metadata as { jobId?: string } | null;
              return meta?.jobId;
            })
            .filter((id): id is string => Boolean(id));

          // Find matches from pool first
          const matchedFromPool = recentJobs.filter((job) => {
            if (recommendedJobIds.includes(job.id)) return true;
            if (
              profile?.preferredCategories?.some((cat: string) =>
                job.category.toLowerCase().includes(cat.toLowerCase())
              )
            ) {
              return true;
            }
            if (
              profile?.preferredLocations?.some((loc: string) =>
                job.location.toLowerCase().includes(loc.toLowerCase())
              )
            ) {
              return true;
            }
            if (
              profile?.skills?.some((s: string) =>
                job.title.toLowerCase().includes(s.toLowerCase())
              )
            ) {
              return true;
            }
            return false;
          });

          if (matchedFromPool.length > 0) {
            const combined = [...matchedFromPool];
            // Backfill with general jobs up to 5
            for (const rj of recentJobs) {
              if (combined.length >= 5) break;
              if (!combined.some((item) => item.id === rj.id)) {
                combined.push(rj);
              }
            }
            userJobs = combined.slice(0, 5).map((j) => ({
              id: j.id,
              title: j.title,
              company: j.company.name,
              location: j.location,
            }));
          }
        }

        const emailRes = await sendJobDigestEmail(subscriber.email, firstName, userJobs);
        if (emailRes.success) {
          sent++;
        } else {
          errors.push(`${subscriber.email}: ${emailRes.error || "Delivery failed"}`);
        }
      } catch (err) {
        errors.push(`${subscriber.email}: ${String(err)}`);
      }
    }

    // 5. Record Cron Audit Log
    await createAuditLog({
      action: AuditAction.EXPORT,
      entityType: AuditEntity.SUBSCRIPTION,
      entityId: "cron-weekly-digest",
      metadata: {
        totalSubscribers: subscribers.length,
        sent,
        failed: errors.length,
      },
    });

    console.log(`[Cron] Weekly digest sent to ${sent}/${subscribers.length} subscribers`);

    return NextResponse.json({
      success: true,
      message: "Weekly digest completed",
      sent,
      total: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[Cron] Weekly digest failed:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
