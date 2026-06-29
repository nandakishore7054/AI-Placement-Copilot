import Vapi from "@vapi-ai/web";

// ─── Vapi Client Singleton ────────────────────────────────────────────────────
// Vapi is a client-side-only SDK — only import in Client Components.

let vapiInstance: Vapi | null = null;

/**
 * Returns the singleton Vapi instance.
 * Creates it on first call using the public web token.
 * Only call this in Client Components (browser environment).
 */
export function getVapiClient(): Vapi {
  if (!vapiInstance) {
    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    if (!token) {
      throw new Error(
        "NEXT_PUBLIC_VAPI_WEB_TOKEN is not set in environment variables.",
      );
    }
    vapiInstance = new Vapi(token);
  }
  return vapiInstance;
}

// ─── Vapi Constants ───────────────────────────────────────────────────────────

export const VAPI_WORKFLOW_ID = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID ?? "";

/** Vapi call status states */
export type VapiCallStatus =
  | "INACTIVE"
  | "CONNECTING"
  | "ACTIVE"
  | "ENDING"
  | "FINISHED"
  | "ERROR";

/** Vapi message roles */
export type VapiMessageRole = "assistant" | "user" | "system" | "tool";

export interface VapiMessage {
  role: VapiMessageRole;
  content: string;
}
