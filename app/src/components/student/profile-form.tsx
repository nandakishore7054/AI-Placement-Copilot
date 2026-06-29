"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User } from "lucide-react";
import { StudentProfileSchema, UpdateStudentProfileSchema } from "@/schemas/student-profile";
import type { StudentProfileInput, UpdateStudentProfileInput } from "@/schemas/student-profile";
import { SkillsInput } from "@/components/student/skills-input";
import { POPULAR_LOCATIONS, JOB_CATEGORIES } from "@/lib/constants";
import type { StudentProfile } from "@prisma/client";
import { toast } from "sonner";

interface CreateProfileFormProps {
  mode: "create";
  onSubmit: (data: StudentProfileInput) => Promise<void>;
}

interface EditProfileFormProps {
  mode: "edit";
  profile: StudentProfile;
  onSubmit: (data: UpdateStudentProfileInput) => Promise<void>;
}

type ProfileFormProps = CreateProfileFormProps | EditProfileFormProps;

export function StudentProfileForm(props: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const isCreate = props.mode === "create";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StudentProfileInput>({
    resolver: zodResolver(isCreate ? StudentProfileSchema : UpdateStudentProfileSchema) as any,
    defaultValues: isCreate
      ? { skills: [], preferredLocations: [], preferredCategories: [] }
      : {
          bio: (props as EditProfileFormProps).profile.bio ?? "",
          skills: (props as EditProfileFormProps).profile.skills,
          education: (props as EditProfileFormProps).profile.education ?? "",
          preferredLocations: (props as EditProfileFormProps).profile.preferredLocations as string[],
          preferredCategories: (props as EditProfileFormProps).profile.preferredCategories as string[],
          expectedSalary: (props as EditProfileFormProps).profile.expectedSalary ?? "",
          linkedinUrl: (props as EditProfileFormProps).profile.linkedinUrl ?? "",
          githubUrl: (props as EditProfileFormProps).profile.githubUrl ?? "",
          portfolioUrl: (props as EditProfileFormProps).profile.portfolioUrl ?? "",
          yearsOfExperience: (props as EditProfileFormProps).profile.yearsOfExperience ?? undefined,
        },
  });

  function onSubmit(data: StudentProfileInput) {
    startTransition(async () => {
      try {
        await props.onSubmit(data);
        toast.success(isCreate ? "Profile created!" : "Profile updated!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Bio */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Bio</label>
        <textarea
          {...register("bio")}
          rows={3}
          placeholder="Tell recruiters a little about yourself..."
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      {/* Skills */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Skills <span className="text-destructive">*</span>
        </label>
        <Controller
          control={control}
          name="skills"
          render={({ field }) => (
            <SkillsInput
              value={field.value ?? []}
              onChange={field.onChange}
              error={errors.skills?.message}
            />
          )}
        />
      </div>

      {/* Years of Experience */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Years of Experience</label>
        <input
          {...register("yearsOfExperience", { valueAsNumber: true })}
          type="number"
          min={0}
          max={50}
          placeholder="0"
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.yearsOfExperience && (
          <p className="text-xs text-destructive">{errors.yearsOfExperience.message}</p>
        )}
      </div>

      {/* Education */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Education</label>
        <textarea
          {...register("education")}
          rows={3}
          placeholder="B.Tech Computer Science, IIT Delhi (2020-2024)..."
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Preferred Locations */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Preferred Locations</label>
        <Controller
          control={control}
          name="preferredLocations"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {POPULAR_LOCATIONS.map((loc) => {
                const selected = (field.value ?? []).includes(loc);
                const atMax = (field.value ?? []).length >= 5;
                return (
                  <button
                    key={loc}
                    type="button"
                    disabled={!selected && atMax}
                    onClick={() => {
                      if (selected) {
                        field.onChange((field.value ?? []).filter((l: string) => l !== loc));
                      } else if (!atMax) {
                        field.onChange([...(field.value ?? []), loc]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-background border-border hover:bg-muted disabled:opacity-40"
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.preferredLocations && (
          <p className="text-xs text-destructive">{errors.preferredLocations.message}</p>
        )}
      </div>

      {/* Preferred Job Categories */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Preferred Job Categories</label>
        <Controller
          control={control}
          name="preferredCategories"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {JOB_CATEGORIES.map((cat) => {
                const selected = (field.value ?? []).includes(cat);
                const atMax = (field.value ?? []).length >= 5;
                return (
                  <button
                    key={cat}
                    type="button"
                    disabled={!selected && atMax}
                    onClick={() => {
                      if (selected) {
                        field.onChange((field.value ?? []).filter((c: string) => c !== cat));
                      } else if (!atMax) {
                        field.onChange([...(field.value ?? []), cat]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-background border-border hover:bg-muted disabled:opacity-40"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* Expected Salary */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Expected Salary</label>
        <input
          {...register("expectedSalary")}
          placeholder="e.g. 8-12 LPA or 80,000 INR/month"
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Links Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">LinkedIn</label>
          <input
            {...register("linkedinUrl")}
            type="url"
            placeholder="https://linkedin.com/in/..."
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.linkedinUrl && (
            <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">GitHub</label>
          <input
            {...register("githubUrl")}
            type="url"
            placeholder="https://github.com/..."
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.githubUrl && (
            <p className="text-xs text-destructive">{errors.githubUrl.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Portfolio</label>
          <input
            {...register("portfolioUrl")}
            type="url"
            placeholder="https://myportfolio.dev"
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.portfolioUrl && (
            <p className="text-xs text-destructive">{errors.portfolioUrl.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isCreate ? "Creating Profile..." : "Saving..."}
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            {isCreate ? "Create Profile" : "Save Changes"}
          </>
        )}
      </button>
    </form>
  );
}
