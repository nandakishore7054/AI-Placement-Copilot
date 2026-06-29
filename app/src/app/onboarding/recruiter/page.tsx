"use client";

import { useRouter } from "next/navigation";
import { Briefcase, ArrowLeft, ArrowRight } from "lucide-react";
import { CompanyForm } from "@/components/company/company-form";
import { completeRecruiterOnboarding } from "@/actions/user";
import type { CreateCompanyInput } from "@/schemas/company";

export default function RecruiterOnboardingPage() {
  const router = useRouter();

  async function handleSubmit(data: CreateCompanyInput) {
    const company = await completeRecruiterOnboarding(data);
    router.push("/recruiter/dashboard");
    router.refresh();
    return company;
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
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white text-xs font-bold">
            2
          </span>
          <span className="text-white font-medium">Create Company</span>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
            <Briefcase className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Set Up Your Company</h1>
            <p className="text-slate-400 text-sm">
              You'll be the Owner. You can invite team members after setup.
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-3 rounded-lg bg-violet-500/10 border border-violet-400/20 text-sm text-violet-300">
          <strong>You'll be assigned as Owner.</strong> You can invite Admins,
          Recruiters, HR, and Interviewers from the Team page after setup.
        </div>

        {/* Form */}
        <div className="bg-white/5 rounded-xl p-6 [&_label]:text-slate-200 [&_input]:text-white [&_input]:placeholder:text-slate-500 [&_input]:border-white/10 [&_input]:bg-white/5 [&_textarea]:text-white [&_textarea]:placeholder:text-slate-500 [&_textarea]:border-white/10 [&_textarea]:bg-white/5 [&_select]:text-white [&_select]:border-white/10 [&_select]:bg-slate-900">
          <CompanyForm mode="create" onSubmit={handleSubmit} />
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
