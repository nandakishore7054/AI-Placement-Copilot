import type { VapiCallStatus, VapiMessage, VapiMessageRole } from "@/lib/vapi";

export type { VapiCallStatus, VapiMessage, VapiMessageRole };

// ─── Vapi Event Types ─────────────────────────────────────────────────────────

export interface VapiSpeechUpdate {
  status: "started" | "stopped";
  role: "assistant" | "user";
}

export interface VapiTranscriptMessage {
  role: VapiMessageRole;
  transcript: string;
  transcriptType: "partial" | "final";
}

export interface VapiCallEndedMessage {
  endedReason: string;
  duration: number; // seconds
  transcript: VapiMessage[];
}

// ─── Interview Agent State ────────────────────────────────────────────────────

export interface InterviewAgentState {
  callStatus: VapiCallStatus;
  messages: VapiMessage[];
  isSpeaking: boolean;
  activeRole: VapiMessageRole | null;
  error: string | null;
}
