"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  Sparkles,
  Loader2,
  Code2,
  Users2,
  Layers,
  Check,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { InterviewType, JobLevel } from "@prisma/client";
import { createInterview } from "@/actions/interviews";
import { cn } from "@/lib/utils";

const POPULAR_ROLES = [
  "Frontend Engineer",
  "Backend Developer",
  "Full Stack Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Product Manager",
  "QA Automation Engineer",
];

const POPULAR_SKILLS = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Docker",
  "AWS",
  "GraphQL",
  "Tailwind CSS",
  "System Design",
  "REST APIs",
  "Git",
];

export function CreateInterviewForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [role, setRole] = useState("");
  const [type, setType] = useState<InterviewType>(InterviewType.TECHNICAL);
  const [level, setLevel] = useState<JobLevel>(JobLevel.BEGINNER);
  const [techStack, setTechStack] = useState<string[]>(["React", "TypeScript"]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (techStack.includes(trimmed)) return;
    if (techStack.length >= 10) {
      toast.error("Maximum 10 technologies allowed");
      return;
    }
    setTechStack((prev) => [...prev, trimmed]);
    setCustomSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setTechStack((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!role.trim() || role.trim().length < 2) {
      setError("Please specify a target role for your interview.");
      return;
    }

    if (techStack.length === 0) {
      setError("Please select at least one technology or topic.");
      return;
    }

    startTransition(async () => {
      try {
        toast.loading("Generating customized interview questions with Gemini AI...", {
          id: "create-interview",
        });

        const result = await createInterview({
          role: role.trim(),
          type,
          level,
          techStack,
        });

        if (result.success && result.interviewId) {
          toast.success("Interview session created with AI questions!", {
            id: "create-interview",
          });
          router.push(`/interviews/${result.interviewId}`);
        }
      } catch (err: any) {
        console.error("[CreateInterviewForm] Error:", err);
        const msg = err?.message || "Failed to create interview session. Please try again.";
        setError(msg);
        toast.error(msg, { id: "create-interview" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-900">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. Target Role */}
      <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-xs">
        <label className="block text-sm font-bold tracking-tight text-foreground">
          1. Target Job Role <span className="text-rose-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Specify the job title or specialization you want to practice for.
        </p>

        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Full Stack Developer, SRE, Mobile App Engineer"
          required
          disabled={isPending}
          className="w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 transition-all"
        />

        {/* Quick select pills */}
        <div className="pt-1">
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Quick suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                disabled={isPending}
                className={cn(
                  "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  role === r
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60 border-border",
                )}
              >
                {role === r && <Check className="h-3 w-3 mr-1" />}
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interview Type */}
      <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-xs">
        <label className="block text-sm font-bold tracking-tight text-foreground">
          2. Interview Format / Type <span className="text-rose-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Choose the assessment domain to focus your interview questions.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 pt-1">
          {[
            {
              id: InterviewType.TECHNICAL,
              label: "Technical",
              desc: "Deep technical, coding, algorithms & framework questions",
              icon: <Code2 className="h-4 w-4" />,
            },
            {
              id: InterviewType.BEHAVIORAL,
              label: "Behavioral",
              desc: "STAR method, teamwork, conflict resolution & culture fit",
              icon: <Users2 className="h-4 w-4" />,
            },
            {
              id: InterviewType.MIXED,
              label: "Mixed Assessment",
              desc: "Balanced blend of technical competency and behavioral scenarios",
              icon: <Layers className="h-4 w-4" />,
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setType(item.id)}
              disabled={isPending}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                type === item.id
                  ? "border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-600"
                  : "border-border bg-card hover:bg-muted/30",
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg",
                    type === item.id
                      ? "bg-indigo-600 text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.icon}
                </div>
                {type === item.id && <Check className="h-4 w-4 text-indigo-600" />}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Experience Level */}
      <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-xs">
        <label className="block text-sm font-bold tracking-tight text-foreground">
          3. Experience Level <span className="text-rose-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Calibrates the depth, complexity, and expected standard of interview questions.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 pt-1">
          {[
            {
              id: JobLevel.BEGINNER,
              label: "Entry / Junior (0-2 Yrs)",
              desc: "Focus on fundamentals, core syntax, problem solving & eagerness to learn",
            },
            {
              id: JobLevel.INTERMEDIATE,
              label: "Mid-Level (2-5 Yrs)",
              desc: "Focus on practical design patterns, debugging, APIs & trade-off decisions",
            },
            {
              id: JobLevel.SENIOR,
              label: "Senior / Lead (5+ Yrs)",
              desc: "Focus on high-level architecture, scalability, edge cases & mentorship",
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLevel(item.id)}
              disabled={isPending}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all",
                level === item.id
                  ? "border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-600"
                  : "border-border bg-card hover:bg-muted/30",
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-bold text-foreground">{item.label}</span>
                {level === item.id && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tech Stack & Competencies */}
      <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold tracking-tight text-foreground">
            4. Technologies & Topics <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-muted-foreground">{techStack.length}/10 selected</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Select the technologies, libraries, and topics relevant to your mock interview.
        </p>

        {/* Selected skills list */}
        <div className="flex flex-wrap gap-2 min-h-9 p-2 rounded-xl border bg-muted/20">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-2xs"
            >
              {tech}
              <button
                type="button"
                onClick={() => removeSkill(tech)}
                disabled={isPending}
                className="rounded-full hover:bg-indigo-200/60 p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {techStack.length === 0 && (
            <span className="text-xs text-muted-foreground py-1 px-1">
              No skills selected yet. Click from suggestions or type below.
            </span>
          )}
        </div>

        {/* Custom skill input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(customSkillInput);
              }
            }}
            placeholder="Type custom skill (e.g. Next.js, Kubernetes) and press Enter"
            disabled={isPending}
            className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
          />
          <button
            type="button"
            onClick={() => addSkill(customSkillInput)}
            disabled={isPending || !customSkillInput.trim()}
            className="inline-flex items-center gap-1 rounded-xl border bg-muted px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/80 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {/* Suggested skills pills */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Popular technologies:</p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.map((skill) => {
              const isSelected = techStack.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => (isSelected ? removeSkill(skill) : addSkill(skill))}
                  disabled={isPending}
                  className={cn(
                    "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/60 border-border",
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 mr-1" />}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-muted-foreground">
          Gemini AI will immediately formulate 5 structured interview questions with evaluation criteria.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition-all cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Questions with AI...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Create Interview & Generate Questions
            </>
          )}
        </button>
      </div>
    </form>
  );
}
