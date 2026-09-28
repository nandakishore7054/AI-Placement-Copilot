import { Resend } from "resend";

// ─── Environment & Lazy Client Initialization ─────────────────────────────────

let _resend: Resend | null = null;

/**
 * Returns true if a valid, non-placeholder Resend API key is configured.
 */
export function isEmailConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY;
  return Boolean(apiKey && apiKey.trim() !== "" && !apiKey.includes("...") && apiKey !== "re_...");
}

/**
 * Returns the singleton Resend instance if configured.
 * Lazy initialized to prevent module evaluation crashes during `next build`.
 */
function getResend(): Resend | null {
  if (!isEmailConfigured()) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@aiplacement.co";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Email Parameter Interfaces ───────────────────────────────────────────────

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export interface NotificationEmailParams {
  to: string;
  subject: string;
  title: string;
  heading: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  footerNote?: string;
}

export interface ApplicationStatusEmailParams {
  to: string;
  studentName: string;
  jobTitle: string;
  companyName: string;
  newStatus: string;
  previousStatus?: string;
  notes?: string;
  applicationId: string;
}

// ─── Branded HTML Email Template Renderer ─────────────────────────────────────

export function renderBrandedEmailHtml(options: {
  title: string;
  heading: string;
  bodyHtml: string;
  actionUrl?: string;
  actionLabel?: string;
  footerNote?: string;
  showUnsubscribe?: boolean;
  unsubscribeEmail?: string;
}): string {
  const {
    title,
    heading,
    bodyHtml,
    actionUrl,
    actionLabel,
    footerNote,
    showUnsubscribe = true,
    unsubscribeEmail,
  } = options;

  const unsubscribeLink = unsubscribeEmail
    ? `${APP_URL}/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}`
    : `${APP_URL}/unsubscribe`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #4f46e5; padding: 24px 32px; text-align: left;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ffffff; border-radius: 8px; width: 32px; height: 32px; text-align: center; vertical-align: middle; font-weight: 800; color: #4f46e5; font-size: 14px;">
                    AI
                  </td>
                  <td style="padding-left: 12px; color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">
                    Placement Copilot
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.5px; line-height: 1.3;">
                ${heading}
              </h1>

              <div style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                ${bodyHtml}
              </div>

              ${
                actionUrl && actionLabel
                  ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="left">
                    <a href="${actionUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);">
                      ${actionLabel} →
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              ${
                footerNote
                  ? `
              <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #f1f5f9;">
                ${footerNote}
              </p>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">
                AI Placement Copilot — Career Intelligence & Mock Interview Platform
              </p>
              ${
                showUnsubscribe
                  ? `<p style="margin: 0;">
                      You are receiving this because you subscribed to career updates.
                      <a href="${unsubscribeLink}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
                    </p>`
                  : ""
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ─── Core Sending Methods ─────────────────────────────────────────────────────

/**
 * Safely dispatches an email via Resend without throwing unexpected exceptions.
 * Automatically falls back to simulation mode in local dev/testing if no valid RESEND_API_KEY is present.
 */
export async function trySendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const resend = getResend();

  // If Resend is not configured or in development mode without live keys, simulate dispatch
  if (!resend) {
    console.info(
      `[Email Simulation] To: ${Array.isArray(params.to) ? params.to.join(", ") : params.to} | Subject: "${params.subject}" (RESEND_API_KEY is not configured or is a placeholder).`,
    );
    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      simulated: true,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    });

    if (error || !data) {
      const errorMsg = error?.message ?? "Unknown Resend error";
      console.warn(`[trySendEmail] Resend delivery error:`, errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (err: any) {
    const errorMsg = err?.message ?? String(err);
    console.error(`[trySendEmail] Unexpected delivery failure:`, err);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Sends a transactional email. Throws an Error on failure for callers that strictly require delivery confirmation.
 */
export async function sendEmail(params: SendEmailParams): Promise<string> {
  const result = await trySendEmail(params);
  if (!result.success) {
    throw new Error(`Failed to send email: ${result.error ?? "Unknown error"}`);
  }
  return result.messageId ?? "ok";
}

// ─── Notification Templates ───────────────────────────────────────────────────

/**
 * Sends a welcome confirmation email to a new subscriber.
 */
export async function sendWelcomeEmail(to: string, firstName?: string): Promise<SendEmailResult> {
  const greeting = firstName ? `Welcome, ${firstName}! 👋` : "Welcome to AI Placement Copilot! 🚀";

  const bodyHtml = `
    <p>You've successfully subscribed to job alerts and career updates on <strong>AI Placement Copilot</strong>.</p>
    <p>Here is what you'll get directly in your inbox:</p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>🔥 <strong>Weekly Top Jobs Digest:</strong> Handpicked technical roles matched to your verified skills.</li>
      <li>⚡ <strong>Application Status Alerts:</strong> Real-time notifications when recruiters review your profile.</li>
      <li>💡 <strong>Career Intelligence:</strong> Industry hiring insights, salary benchmarks, and placement advice.</li>
    </ul>
    <p>Get started today by completing your profile and practicing your first voice mock interview.</p>
  `;

  const html = renderBrandedEmailHtml({
    title: "Welcome to AI Placement Copilot",
    heading: greeting,
    bodyHtml,
    actionUrl: `${APP_URL}/dashboard`,
    actionLabel: "Go to Dashboard",
    footerNote: "You can customize or unsubscribe from job alert emails at any time.",
    showUnsubscribe: true,
    unsubscribeEmail: to,
  });

  return trySendEmail({
    to,
    subject: "Welcome to AI Placement Copilot! 🚀",
    html,
    text: `Welcome to AI Placement Copilot! You are subscribed to job alerts and weekly digests. Visit your dashboard at ${APP_URL}/dashboard`,
  });
}

/**
 * Sends a weekly job digest email to a subscriber.
 */
export async function sendJobDigestEmail(
  to: string,
  firstName: string,
  jobs: Array<{ title: string; company: string; location: string; id: string }>,
): Promise<SendEmailResult> {
  const jobItems = jobs
    .map(
      (job) => `
      <div style="margin-bottom: 12px; padding: 14px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
        <strong style="color: #0f172a; font-size: 15px;">${job.title}</strong>
        <div style="color: #4f46e5; font-size: 13px; font-weight: 600; margin-top: 2px;">
          ${job.company} · <span style="color: #64748b; font-weight: normal;">${job.location}</span>
        </div>
        <div style="margin-top: 8px;">
          <a href="${APP_URL}/jobs/${job.id}" style="color: #4f46e5; text-decoration: none; font-size: 13px; font-weight: 700;">
            View Job Details →
          </a>
        </div>
      </div>
    `,
    )
    .join("");

  const bodyHtml = `
    <p>Hi ${firstName}, here are this week's top active campus & tech placements on the platform:</p>
    <div style="margin: 20px 0;">
      ${jobItems}
    </div>
  `;

  const html = renderBrandedEmailHtml({
    title: "Weekly Job Digest",
    heading: "🔥 Top Placements Picked for You",
    bodyHtml,
    actionUrl: `${APP_URL}/jobs`,
    actionLabel: "Browse All Jobs",
    showUnsubscribe: true,
    unsubscribeEmail: to,
  });

  return trySendEmail({
    to,
    subject: "🔥 This Week's Top Jobs — AI Placement Copilot",
    html,
  });
}

/**
 * Reusable general notification email foundation for Phase 7.
 */
export async function sendNotificationEmail(
  params: NotificationEmailParams,
): Promise<SendEmailResult> {
  const html = renderBrandedEmailHtml({
    title: params.title,
    heading: params.heading,
    bodyHtml: `<p>${params.message}</p>`,
    actionUrl: params.actionUrl,
    actionLabel: params.actionLabel,
    footerNote: params.footerNote,
    showUnsubscribe: true,
    unsubscribeEmail: params.to,
  });

  return trySendEmail({
    to: params.to,
    subject: params.subject,
    html,
    text: params.message,
  });
}

/**
 * Foundation for Application Status Change Notification (Prepared for Step 2).
 */
export async function sendApplicationStatusEmail(
  params: ApplicationStatusEmailParams,
): Promise<SendEmailResult> {
  const {
    to,
    studentName,
    jobTitle,
    companyName,
    newStatus,
    previousStatus,
    notes,
    applicationId,
  } = params;

  const statusLabel = newStatus.replace(/_/g, " ");
  const prevLabel = previousStatus ? previousStatus.replace(/_/g, " ") : null;

  const statusColorMap: Record<string, string> = {
    SHORTLISTED: "#059669",
    INTERVIEW_SCHEDULED: "#4f46e5",
    ACCEPTED: "#16a34a",
    REJECTED: "#dc2626",
    REVIEWED: "#0284c7",
    PENDING: "#d97706",
    WITHDRAWN: "#64748b",
  };
  const badgeColor = statusColorMap[newStatus] || "#4f46e5";

  const bodyHtml = `
    <p>Hi ${studentName},</p>
    <p>There is an update on your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>:</p>
    <div style="padding: 18px; margin: 20px 0; background-color: #f8fafc; border-left: 4px solid ${badgeColor}; border-radius: 8px; border: 1px solid #e2e8f0; border-left-width: 4px;">
      ${
        prevLabel
          ? `<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Previous Status: <span style="text-decoration: line-through;">${prevLabel}</span></div>`
          : ""
      }
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-top: ${
        prevLabel ? "4px" : "0"
      };">Updated Status</div>
      <div style="font-size: 18px; font-weight: 800; color: ${badgeColor}; margin-top: 4px;">${statusLabel}</div>
      ${
        notes
          ? `<p style="font-size: 13px; color: #334155; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1;"><strong>Note from recruiter:</strong> ${notes}</p>`
          : ""
      }
    </div>
    <p style="font-size: 14px; color: #475569;">You can review full application details, interview schedules, and feedback anytime on your dashboard.</p>
  `;

  const html = renderBrandedEmailHtml({
    title: `Application Update: ${jobTitle}`,
    heading: `Application Status: ${statusLabel}`,
    bodyHtml,
    actionUrl: `${APP_URL}/applications/${applicationId}`,
    actionLabel: "View Application Details",
    footerNote: "You are receiving this notification regarding your active application on AI Placement Copilot.",
    showUnsubscribe: true,
    unsubscribeEmail: to,
  });

  return trySendEmail({
    to,
    subject: `Application Update: ${jobTitle} at ${companyName} (${statusLabel})`,
    html,
  });
}
