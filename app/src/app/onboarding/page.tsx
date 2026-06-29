import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome — Choose Your Role",
};

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold">
            1
          </span>
          <span className="text-white font-medium">Choose Role</span>
        </div>
        <ArrowRight className="h-4 w-4" />
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-slate-400 text-xs">
            2
          </span>
          <span>Set Up Profile</span>
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
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Welcome! What brings you here?
        </h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          Your experience will be tailored based on your role.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Student */}
          <Link
            href="/onboarding/student"
            className="group relative flex flex-col items-center gap-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-indigo-500/20 hover:border-indigo-400/50 transition-all duration-200 cursor-pointer"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-colors">
              <GraduationCap className="h-7 w-7 text-indigo-400" />
            </div>
            <div className="text-center">
              <h2 className="text-white font-semibold text-lg">
                I'm a Student / Job Seeker
              </h2>
              <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                Find jobs, practice interviews, analyze your resume, and get a
                personalized career roadmap.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-400 text-sm font-medium mt-auto">
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Recruiter */}
          <Link
            href="/onboarding/recruiter"
            className="group relative flex flex-col items-center gap-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-violet-500/20 hover:border-violet-400/50 transition-all duration-200 cursor-pointer"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 group-hover:bg-violet-500/40 transition-colors">
              <Briefcase className="h-7 w-7 text-violet-400" />
            </div>
            <div className="text-center">
              <h2 className="text-white font-semibold text-lg">
                I'm a Recruiter / Employer
              </h2>
              <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                Post jobs, manage applicants, schedule interviews, and build your
                hiring team.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-violet-400 text-sm font-medium mt-auto">
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
