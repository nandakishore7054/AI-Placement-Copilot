import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendJobDigestEmail } from "@/lib/email";

// Force dynamic — this route reads env vars and calls external services at runtime
export const dynamic = "force-dynamic";

// GET /api/cron/weekly-digest — Vercel Cron (runs every Monday 9AM UTC)
// Protected by CRON_SECRET to prevent unauthorized triggers
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch active subscribers with user data
    const subscribers = await db.subscription.findMany({
      where: { isActive: true },
      include: {
        user: { select: { firstName: true } },
      },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ message: "No active subscribers", sent: 0 });
    }

    // Fetch the latest 5 visible jobs
    const jobs = await db.job.findMany({
      where: { isVisible: true },
      include: {
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (jobs.length === 0) {
      return NextResponse.json({ message: "No jobs to digest", sent: 0 });
    }

    const jobData = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      location: job.location,
    }));

    // Send digest to each subscriber
    let sent = 0;
    const errors: string[] = [];

    for (const subscriber of subscribers) {
      try {
        const firstName = subscriber.user?.firstName ?? "there";
        await sendJobDigestEmail(subscriber.email, firstName, jobData);
        sent++;
      } catch (err) {
        errors.push(`${subscriber.email}: ${String(err)}`);
      }
    }

    console.log(`[Cron] Weekly digest sent to ${sent}/${subscribers.length} subscribers`);

    return NextResponse.json({
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
