import { Resend } from "resend";

// ─── Lazy Resend Client ───────────────────────────────────────────────────────
// The Resend constructor throws if the API key is missing.
// We initialize lazily so that import-time module evaluation during
// `next build` does not fail when env vars are not present.

let _resend: Resend | null = null;

/**
 * Returns the singleton Resend instance.
 * Initializes on first call — safe during `next build` static analysis.
 */
function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to your .env.local file.",
      );
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@aiplacement.co";

// ─── Email Helpers ────────────────────────────────────────────────────────────

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends a transactional email via Resend.
 * Returns the message ID on success.
 */
export async function sendEmail(params: SendEmailParams): Promise<string> {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (error || !data) {
    throw new Error(
      `Failed to send email: ${error?.message ?? "Unknown error"}`,
    );
  }

  return data.id;
}

/**
 * Sends a welcome email to a new subscriber.
 */
export async function sendWelcomeEmail(
  to: string,
  firstName: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: "Welcome to AI Placement Copilot! 🚀",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a1a2e; font-size: 28px; margin-bottom: 16px;">
          Welcome, ${firstName}! 👋
        </h1>
        <p style="color: #4a4a6a; font-size: 16px; line-height: 1.6;">
          You've successfully joined AI Placement Copilot — your intelligent career companion.
        </p>
        <p style="color: #4a4a6a; font-size: 16px; line-height: 1.6;">
          Here's what you can do:
        </p>
        <ul style="color: #4a4a6a; font-size: 16px; line-height: 2;">
          <li>🔍 Browse and apply to jobs semantically matched to your skills</li>
          <li>🎙️ Practice with AI-powered voice interviews</li>
          <li>📄 Get your resume analyzed and scored</li>
          <li>🗺️ Generate a personalized career roadmap</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          Go to Dashboard →
        </a>
      </div>
    `,
  });
}

/**
 * Sends a weekly job digest email to a subscriber.
 */
export async function sendJobDigestEmail(
  to: string,
  firstName: string,
  jobs: Array<{ title: string; company: string; location: string; id: string }>,
): Promise<void> {
  const jobItems = jobs
    .map(
      (job) => `
      <li style="margin-bottom: 16px; padding: 16px; background: #f8f9ff; border-radius: 8px;">
        <strong style="color: #1a1a2e;">${job.title}</strong>
        <br/>
        <span style="color: #6366f1;">${job.company}</span> · ${job.location}
        <br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}"
           style="color: #6366f1; text-decoration: none; font-size: 14px;">
          View Job →
        </a>
      </li>
    `,
    )
    .join("");

  await sendEmail({
    to,
    subject: "🔥 This Week's Top Jobs — AI Placement Copilot",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a1a2e; font-size: 24px;">Hi ${firstName}, here are this week's top picks 👇</h1>
        <ul style="list-style: none; padding: 0;">${jobItems}</ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
          View All Jobs →
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
          You're receiving this because you subscribed to job alerts on AI Placement Copilot.
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}
