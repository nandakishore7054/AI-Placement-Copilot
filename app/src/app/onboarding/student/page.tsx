"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, ArrowLeft, ArrowRight } from "lucide-react";
import { StudentProfileForm } from "@/components/student/profile-form";
import { completeStudentOnboarding } from "@/actions/user";
import type { StudentProfileInput } from "@/schemas/student-profile";

export default function StudentOnboardingPage() {
  const router = useRouter();

  async function handleSubmit(data: StudentProfileInput) {
    await completeStudentOnboarding(data);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/40 text-indigo-300 text-xs">
            1
          </span>
          <span>Choose Role</span>
        </div>
        <ArrowRight className="h-4 w-4" />
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">
            2
          </span>
          <span className="text-white font-medium">Set Up Profile</span>
        </div>
        <ArrowRight className="h-4 w-4" />
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-slate-400 text-xs">
            3
          </span>
          <span>Done</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Your Student Profile</h1>
            <p className="text-slate-400 text-sm">
              Help AI Copilot match you with the perfect opportunities
            </p>
          </div>
        </div>

        {/* Form — rendered against a slightly lighter surface */}
        <div className="bg-white/5 rounded-xl p-6 [&_label]:text-slate-200 [&_input]:text-white [&_input]:placeholder:text-slate-500 [&_input]:border-white/10 [&_input]:bg-white/5 [&_textarea]:text-white [&_textarea]:placeholder:text-slate-500 [&_textarea]:border-white/10 [&_textarea]:bg-white/5 [&_select]:text-white [&_select]:border-white/10 [&_select]:bg-slate-900">
          <StudentProfileForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors mx-auto"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to role selection
      </button>
    </div>
  );
}
