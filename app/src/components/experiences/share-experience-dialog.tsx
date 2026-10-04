"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  DollarSign,
  HelpCircle,
  Award,
  Loader2,
  Plus,
} from "lucide-react";
import { JobLevel } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateStudentExperienceSchema,
  type CreateStudentExperienceInput,
} from "@/schemas/experience";
import { createStudentExperience } from "@/actions/experiences";
import { JOB_CATEGORIES, JOB_LEVEL_LABELS } from "@/lib/constants";

interface ShareExperienceDialogProps {
  companies?: Array<{ id: string; name: string }>;
  trigger?: React.ReactNode;
}

export function ShareExperienceDialog({
  companies = [],
  trigger,
}: ShareExperienceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateStudentExperienceInput>({
    resolver: zodResolver(CreateStudentExperienceSchema),
    defaultValues: {
      companyName: "",
      role: "",
      category: "Software Development",
      level: JobLevel.BEGINNER,
      salary: "",
      difficulty: "Medium",
      overallOutcome: "Offered / Accepted",
      rounds: "",
      questions: "",
      preparationStrategy: "",
      tips: "",
    },
  });

  const selectedCategory = watch("category");
  const selectedLevel = watch("level");
  const selectedDifficulty = watch("difficulty");
  const selectedOutcome = watch("overallOutcome");

  const onSubmit = (values: CreateStudentExperienceInput) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await createStudentExperience(values);
        if (result?.success) {
          setIsSuccess(true);
          setCreatedId(result.experienceId);
          reset();
        } else {
          setServerError("Failed to publish experience. Please try again.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
        setServerError(msg);
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
    if (isSuccess) {
      setIsSuccess(false);
      setCreatedId(null);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => (val ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            size="default"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:from-indigo-600 hover:to-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>Share Interview Experience</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl">
        {isSuccess ? (
          <div className="py-8 px-4 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Experience Published Successfully!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for contributing to the placement community. Your insights will help fellow students navigate hiring rounds with confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {createdId && (
                <Button
                  onClick={() => {
                    handleClose();
                    router.push(`/experiences/${createdId}`);
                  }}
                  className="w-full sm:w-auto"
                >
                  View Your Submission
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-indigo-500 mb-1">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Community Contribution
                </span>
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Share Your Interview Experience
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Help other candidates prepare better by sharing round details, questions, preparation tips, and compensation details.
              </DialogDescription>
            </DialogHeader>

            {serverError && (
              <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
              {/* Row 1: Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-xs font-semibold text-foreground">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="companyName"
                      placeholder="e.g. Google, Microsoft, Razorpay"
                      {...register("companyName")}
                      className={errors.companyName ? "border-destructive" : ""}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-[11px] text-destructive">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-semibold text-foreground">
                    Role / Position <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="role"
                    placeholder="e.g. Software Engineer (SDE-1)"
                    {...register("role")}
                    className={errors.role ? "border-destructive" : ""}
                  />
                  {errors.role && (
                    <p className="text-[11px] text-destructive">{errors.role.message}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Category & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Job Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(val) =>
                      setValue("category", val as CreateStudentExperienceInput["category"], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {JOB_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-[11px] text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Seniority Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedLevel}
                    onValueChange={(val) =>
                      setValue("level", val as JobLevel, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(JOB_LEVEL_LABELS).map(([lvl, label]) => (
                        <SelectItem key={lvl} value={lvl}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-[11px] text-destructive">{errors.level.message}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Salary, Difficulty, Outcome */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="salary" className="text-xs font-semibold text-foreground">
                    Package / CTC (Optional)
                  </Label>
                  <Input
                    id="salary"
                    placeholder="e.g. ₹14 LPA or $110,000"
                    {...register("salary")}
                  />
                  {errors.salary && (
                    <p className="text-[11px] text-destructive">{errors.salary.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Difficulty <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedDifficulty}
                    onValueChange={(val) =>
                      setValue(
                        "difficulty",
                        val as "Easy" | "Medium" | "Hard",
                        { shouldValidate: true }
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Outcome <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedOutcome}
                    onValueChange={(val) =>
                      setValue(
                        "overallOutcome",
                        val as CreateStudentExperienceInput["overallOutcome"],
                        { shouldValidate: true }
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Offered / Accepted">Offered / Accepted</SelectItem>
                      <SelectItem value="Offered / Declined">Offered / Declined</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="In Process">In Process</SelectItem>
                      <SelectItem value="Deferred">Deferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Section: Interview Rounds */}
              <div className="space-y-1.5">
                <Label htmlFor="rounds" className="text-xs font-semibold text-foreground">
                  Interview Rounds Breakdown <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="rounds"
                  rows={3}
                  placeholder={`Round 1: Online Assessment (60 mins - 2 DSA questions & 20 MCQs)\nRound 2: Technical Interview 1 (Data Structures, Binary Trees & DB indexing)\nRound 3: System Design / Hiring Manager Round`}
                  {...register("rounds")}
                  className={errors.rounds ? "border-destructive text-xs" : "text-xs"}
                />
                {errors.rounds && (
                  <p className="text-[11px] text-destructive">{errors.rounds.message}</p>
                )}
              </div>

              {/* Section: Questions Asked */}
              <div className="space-y-1.5">
                <Label htmlFor="questions" className="text-xs font-semibold text-foreground">
                  Key Questions & Topics Asked <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="questions"
                  rows={3}
                  placeholder="Detail the specific coding problems, system design topics, behavioral scenarios, or technical concepts they tested..."
                  {...register("questions")}
                  className={errors.questions ? "border-destructive text-xs" : "text-xs"}
                />
                {errors.questions && (
                  <p className="text-[11px] text-destructive">{errors.questions.message}</p>
                )}
              </div>

              {/* Section: Preparation Strategy */}
              <div className="space-y-1.5">
                <Label htmlFor="preparationStrategy" className="text-xs font-semibold text-foreground">
                  Your Preparation Strategy <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="preparationStrategy"
                  rows={2}
                  placeholder="What resources, roadmaps, or practice tools helped you prepare? (e.g. LeetCode, Striver sheet, AI Placement Copilot mock interviews)"
                  {...register("preparationStrategy")}
                  className={errors.preparationStrategy ? "border-destructive text-xs" : "text-xs"}
                />
                {errors.preparationStrategy && (
                  <p className="text-[11px] text-destructive">
                    {errors.preparationStrategy.message}
                  </p>
                )}
              </div>

              {/* Section: Tips */}
              <div className="space-y-1.5">
                <Label htmlFor="tips" className="text-xs font-semibold text-foreground">
                  Advice & Tips for Peers <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="tips"
                  rows={2}
                  placeholder="What do you wish you knew before the interview? What made the interviewer nod or smile?"
                  {...register("tips")}
                  className={errors.tips ? "border-destructive text-xs" : "text-xs"}
                />
                {errors.tips && (
                  <p className="text-[11px] text-destructive">{errors.tips.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Experience"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
