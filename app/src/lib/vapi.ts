import Vapi from "@vapi-ai/web";

// ─── Vapi Client Singleton ────────────────────────────────────────────────────
// Vapi is a client-side-only SDK — only import in Client Components.

let vapiInstance: Vapi | null = null;

/**
 * Returns the singleton Vapi instance.
 * Initializes it using the public web token.
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

// ─── Vapi Constants & Environment ─────────────────────────────────────────────

export const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? "";

/**
 * Standard UUID regex (v4 / standard 8-4-4-4-12 hex format)
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates whether a given string is a valid UUID format expected by Vapi.
 */
export function isValidUuid(id: string | null | undefined): boolean {
  if (!id || typeof id !== "string") return false;
  return UUID_REGEX.test(id.trim());
}

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
