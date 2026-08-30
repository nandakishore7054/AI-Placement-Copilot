"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Loader2,
  Sparkles,
  Volume2,
  AlertCircle,
  Clock,
  MessageSquare,
  Radio,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getVapiClient,
  VAPI_ASSISTANT_ID,
  isValidUuid,
  type VapiCallStatus,
  type VapiMessage,
} from "@/lib/vapi";
import { saveTranscript, updateInterviewStatus } from "@/actions/interviews";
import { InterviewStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface QuestionData {
  id: string;
  questionText: string;
  topic?: string | null;
  difficulty: string;
  orderIndex: number;
}

interface InterviewAgentProps {
  interviewId: string;
  role: string;
  type: string;
  level: string;
  techStack: string[];
  questions: QuestionData[];
  initialStatus: InterviewStatus;
  savedTranscript?: string | null;
  savedDuration?: number | null;
}

export function InterviewAgent({
  interviewId,
  role,
  type,
  level,
  techStack,
  questions,
  initialStatus,
  savedTranscript,
  savedDuration,
}: InterviewAgentProps) {
  const [callStatus, setCallStatus] = useState<VapiCallStatus>(
    initialStatus === InterviewStatus.COMPLETED ? "FINISHED" : "INACTIVE",
  );

  const [messages, setMessages] = useState<VapiMessage[]>(() => {
    if (savedTranscript) {
      return savedTranscript
        .split("\n\n")
        .filter(Boolean)
        .map((block) => {
          if (block.startsWith("[AI Interviewer]:")) {
            return {
              role: "assistant" as const,
              content: block.replace("[AI Interviewer]:", "").trim(),
            };
          }
          if (block.startsWith("[Candidate]:")) {
            return {
              role: "user" as const,
              content: block.replace("[Candidate]:", "").trim(),
            };
          }
          return { role: "assistant" as const, content: block.trim() };
        });
    }
    return [];
  });

  const [currentSpeaker, setCurrentSpeaker] = useState<"assistant" | "user" | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(savedDuration ?? 0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronization refs to avoid stale closures & double-saves
  const messagesRef = useRef<VapiMessage[]>(messages);
  const durationRef = useRef<number>(durationSeconds);
  const hasSavedRef = useRef<boolean>(initialStatus === InterviewStatus.COMPLETED);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Keep refs synchronized with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    durationRef.current = durationSeconds;
  }, [durationSeconds]);

  // Auto-scroll transcript feed
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentSpeaker]);

  // Call duration stopwatch
  useEffect(() => {
    if (callStatus === "ACTIVE") {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callStatus]);

  // Clean up Vapi event listeners on unmount
  useEffect(() => {
    return () => {
      try {
        const vapi = getVapiClient();
        vapi.removeAllListeners();
      } catch {
        // Token might not be configured
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Compile full transcript string for database persistence
  const compileTranscriptString = (msgs: VapiMessage[]): string => {
    return msgs
      .map(
        (m) =>
          `${m.role === "assistant" ? "[AI Interviewer]" : "[Candidate]"}: ${m.content}`,
      )
      .join("\n\n");
  };

  // ─── Standalone Async Transcript Saver ─────────────────────────────────────
  const saveSession = useCallback(
    async (finalMsgs: VapiMessage[], finalDuration: number) => {
      if (hasSavedRef.current) return;
      hasSavedRef.current = true;

      const fullText = compileTranscriptString(finalMsgs);
      if (!fullText.trim()) return;

      setIsSaving(true);
      try {
        await saveTranscript(interviewId, fullText, finalDuration);
        toast.success("Interview session and transcript saved successfully!");
      } catch (err: any) {
        console.error("[InterviewAgent] Failed to save transcript:", err);
        toast.error("Failed to save interview transcript.");
        hasSavedRef.current = false; // Allow retry on failure
      } finally {
        setIsSaving(false);
      }
    },
    [interviewId],
  );

  // ─── Start Call Handler ───────────────────────────────────────────────────
  const startCall = async () => {
    setErrorMessage(null);
    hasSavedRef.current = false;

    // 1. Validate Vapi Public Web Token
    const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN?.trim();
    if (!webToken) {
      const msg =
        "Vapi Public Web Token is missing. Please set NEXT_PUBLIC_VAPI_WEB_TOKEN in your .env.local file (from Vapi Dashboard -> Account / API Keys -> Public Key).";
      setErrorMessage(msg);
      toast.error("Vapi Web Token is not configured.");
      return;
    }

    // 2. Validate Vapi Assistant ID
    const assistantId = (
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || VAPI_ASSISTANT_ID
    )?.trim();

    if (!assistantId) {
      const msg =
        "Vapi Assistant ID is missing. Please create an assistant in your Vapi Dashboard (dashboard.vapi.ai/assistants) and add NEXT_PUBLIC_VAPI_ASSISTANT_ID to .env.local.";
      setErrorMessage(msg);
      toast.error("Vapi Assistant ID is not configured.");
      return;
    }

    if (!isValidUuid(assistantId)) {
      const msg = `Invalid Vapi Assistant ID format ("${assistantId}"). NEXT_PUBLIC_VAPI_ASSISTANT_ID must be a valid UUID (e.g. 12345678-1234-1234-1234-123456789abc) copied from your Vapi Dashboard -> Assistants.`;
      setErrorMessage(msg);
      toast.error("Assistant ID must be a valid UUID.");
      return;
    }

    try {
      setCallStatus("CONNECTING");
      const vapi = getVapiClient();

      // Formulate formatted list of pre-generated questions for the assistant
      const formattedQuestions = questions
        .map(
          (q, i) => `${i + 1}. [${q.topic || "Core Concept"}] ${q.questionText}`,
        )
        .join("\n");

      // Attach event listeners cleanly
      vapi.removeAllListeners();

      vapi.on("call-start", () => {
        setCallStatus("ACTIVE");
        updateInterviewStatus(interviewId, InterviewStatus.IN_PROGRESS).catch(
          console.error,
        );
        toast.success("Connected with AI Interviewer! Speak into your microphone.");
      });

      vapi.on("call-end", () => {
        setCallStatus("FINISHED");
        setCurrentSpeaker(null);
        // Safely trigger save using fresh ref data
        saveSession(messagesRef.current, durationRef.current);
      });

      vapi.on("speech-start", () => {
        setCurrentSpeaker("assistant");
      });

      vapi.on("speech-end", () => {
        setCurrentSpeaker(null);
      });

      vapi.on("message", (message: any) => {
        if (message.type === "transcript" && message.transcriptType === "final") {
          const role = message.role === "assistant" ? "assistant" : "user";
          const newMsg: VapiMessage = { role, content: message.transcript };
          setMessages((prev) => {
            const updated = [...prev, newMsg];
            messagesRef.current = updated;
            return updated;
          });
        }
      });

      vapi.on("error", (e: any) => {
        console.error("[Vapi Error]", e);
        setCallStatus("ERROR");
        const msg =
          e?.error?.message || e?.message || "Failed to establish audio connection.";
        setErrorMessage(msg);
        toast.error(msg);
      });

      // Start the voice call with the validated Assistant UUID and pass dynamic context
      await vapi.start(assistantId, {
        variableValues: {
          role,
          level,
          techStack: techStack.join(", "),
          questions: formattedQuestions,
        },
      });
    } catch (err: any) {
      console.error("[startCall] Exception:", err);
      setCallStatus("ERROR");
      const msg =
        err?.message || "Could not access microphone or start voice interview.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // ─── End Call Handler ─────────────────────────────────────────────────────
  const endCall = () => {
    try {
      const vapi = getVapiClient();
      vapi.stop();
    } catch (e) {
      console.error("[endCall] Error stopping Vapi:", e);
    } finally {
      setCallStatus("FINISHED");
      setCurrentSpeaker(null);
      saveSession(messagesRef.current, durationRef.current);
    }
  };

  // ─── Toggle Mute ──────────────────────────────────────────────────────────
  const toggleMute = () => {
    try {
      const vapi = getVapiClient();
      const nextMute = !isMuted;
      vapi.setMuted(nextMute);
      setIsMuted(nextMute);
      toast(nextMute ? "Microphone muted" : "Microphone unmuted");
    } catch (e) {
      console.error("[toggleMute] Error:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Main Voice Agent Controller Card ────────────────────────────── */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Status & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl transition-all shadow-xs",
                callStatus === "ACTIVE"
                  ? "bg-emerald-600 text-white animate-pulse"
                  : callStatus === "CONNECTING"
                  ? "bg-amber-500 text-white"
                  : callStatus === "FINISHED"
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Mic className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground">
                  Voice AI Interviewer
                </h3>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-2xs",
                    callStatus === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : callStatus === "CONNECTING"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : callStatus === "FINISHED"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200",
                  )}
                >
                  {callStatus === "ACTIVE" && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                  {callStatus === "CONNECTING" && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {callStatus === "ACTIVE"
                    ? "Live Session"
                    : callStatus === "CONNECTING"
                    ? "Connecting..."
                    : callStatus === "FINISHED"
                    ? "Completed"
                    : "Standby"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Targeted for {role} • {questions.length} questions
              </p>
            </div>
          </div>

          {/* Stopwatch & Speaker Indicator */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            {isSaving && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                Saving session...
              </span>
            )}

            {(callStatus === "ACTIVE" || callStatus === "FINISHED") && (
              <div className="flex items-center gap-1.5 rounded-xl border bg-muted/40 px-3 py-1.5 text-xs font-bold text-foreground">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span>{formatTimer(durationSeconds)}</span>
              </div>
            )}

            {callStatus === "ACTIVE" && currentSpeaker && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 animate-pulse">
                <Volume2 className="h-3.5 w-3.5" />
                {currentSpeaker === "assistant"
                  ? "Interviewer Speaking..."
                  : "You are Speaking..."}
              </span>
            )}
          </div>
        </div>

        {/* Audio Waveform Visualization Bar */}
        {callStatus === "ACTIVE" && (
          <div className="flex items-center justify-center gap-1.5 py-4 bg-muted/20 rounded-2xl border border-indigo-100">
            {[40, 70, 30, 90, 50, 100, 60, 80, 45, 95, 35, 75].map((h, i) => (
              <div
                key={i}
                style={{ height: `${currentSpeaker ? h : 15}%` }}
                className={cn(
                  "w-1.5 rounded-full transition-all duration-150 min-h-3",
                  currentSpeaker === "assistant"
                    ? "bg-indigo-600"
                    : currentSpeaker === "user"
                    ? "bg-emerald-500"
                    : "bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Voice Interview Notice</p>
              <p className="leading-relaxed">{errorMessage}</p>
              <div className="pt-1">
                <a
                  href="https://dashboard.vapi.ai/assistants"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900 underline"
                >
                  Open Vapi Dashboard Assistants
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Controls Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
          <p className="text-xs text-muted-foreground max-w-sm">
            {callStatus === "INACTIVE" &&
              "Click 'Start Voice Interview' to begin your real-time voice practice session."}
            {callStatus === "ACTIVE" &&
              "Speak naturally into your microphone. The AI interviewer will listen and respond."}
            {callStatus === "FINISHED" &&
              "Session ended. Your full interview transcript and duration have been saved."}
          </p>

          <div className="flex items-center gap-2.5">
            {callStatus === "INACTIVE" && (
              <button
                type="button"
                onClick={startCall}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <PhoneCall className="h-4 w-4" />
                Start Voice Interview
              </button>
            )}

            {callStatus === "CONNECTING" && (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-white opacity-80"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting Audio...
              </button>
            )}

            {callStatus === "ACTIVE" && (
              <>
                <button
                  type="button"
                  onClick={toggleMute}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer",
                    isMuted
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-muted text-foreground hover:bg-muted/80",
                  )}
                >
                  {isMuted ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {isMuted ? "Unmute Mic" : "Mute Mic"}
                </button>

                <button
                  type="button"
                  onClick={endCall}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all cursor-pointer"
                >
                  <PhoneOff className="h-4 w-4" />
                  End Interview
                </button>
              </>
            )}

            {callStatus === "FINISHED" && (
              <button
                type="button"
                onClick={startCall}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Mic className="h-3.5 w-3.5" />
                Practice Again
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Live Real-time Transcript Feed ──────────────────────────────── */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              Real-Time Interview Transcript
            </h3>
          </div>

          <span className="text-xs text-muted-foreground">
            {messages.length} {messages.length === 1 ? "turn" : "turns"} recorded
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground space-y-2 bg-muted/10">
            <Radio className="h-6 w-6 mx-auto text-muted-foreground/60" />
            <p className="font-medium">No spoken dialogue yet</p>
            <p className="text-[11px] text-muted-foreground/80 max-w-sm mx-auto">
              Start the voice session above. Spoken questions and answers will appear
              here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl p-4 text-xs leading-relaxed transition-all",
                  msg.role === "assistant"
                    ? "bg-indigo-50/70 border border-indigo-100 text-indigo-950 ml-0 mr-8"
                    : "bg-muted/40 border text-foreground mr-0 ml-8",
                )}
              >
                <p className="font-bold text-[11px] mb-1 flex items-center gap-1.5">
                  {msg.role === "assistant" ? (
                    <>
                      <Sparkles className="h-3 w-3 text-indigo-600" />
                      <span className="text-indigo-700">AI Interviewer</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700">You (Candidate)</span>
                    </>
                  )}
                </p>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
