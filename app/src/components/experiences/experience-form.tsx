"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import {
  CreateExperienceSchema,
  UpdateExperienceSchema,
} from "@/schemas/experience";
import type {
  CreateExperienceInput,
  UpdateExperienceInput,
} from "@/schemas/experience";
import { createExperience, updateExperience } from "@/actions/experiences";
import { JOB_CATEGORIES, JOB_LEVEL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BaseProps {
  companyId: string;
}

interface CreateProps extends BaseProps {
  mode: "create";
  existingExperience?: never;
}

interface EditProps extends BaseProps {
  mode: "edit";
  existingExperience: UpdateExperienceInput & { id: string };
}

type ExperienceFormProps = CreateProps | EditProps;

export function ExperienceForm({
  companyId,
  mode,
  existingExperience,
}: ExperienceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = mode === "edit";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(
      isEditing ? UpdateExperienceSchema : CreateExperienceSchema
    ),
    defaultValues: isEditing
      ? existingExperience
      : {
          title: "",
          description: "",
          category: "",
          level: "",
          salary: "",
          imageUrl: "",
        },
  });

  function onSubmit(data: CreateExperienceInput | UpdateExperienceInput) {
    startTransition(async () => {
      try {
        if (isEditing && existingExperience) {
          await updateExperience(
            existingExperience.id,
            companyId,
            data as UpdateExperienceInput
          );
          toast.success("Experience updated successfully!");
        } else {
          await createExperience(companyId, data as CreateExperienceInput);
          toast.success("Experience published successfully!");
        }
        router.push("/recruiter/experiences");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <Field
        label="Experience Title"
        error={errors.title?.message as string | undefined}
      >
        <input
          {...register("title")}
          placeholder="e.g. Software Engineer Interview & Placement Experience"
          className={inputCls(!!errors.title)}
        />
      </Field>

      {/* Category + Level */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Category"
          error={errors.category?.message as string | undefined}
        >
          <select
            {...register("category")}
            className={inputCls(!!errors.category)}
          >
            <option value="">Select category…</option>
            {JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Experience Level"
          error={errors.level?.message as string | undefined}
        >
          <select {...register("level")} className={inputCls(!!errors.level)}>
            <option value="">Select level…</option>
            {Object.entries(JOB_LEVEL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Salary + Image URL */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Offered Package / CTC (optional)"
          error={errors.salary?.message as string | undefined}
        >
          <input
            {...register("salary")}
            placeholder="e.g. 12 LPA or 60k/month"
            className={inputCls(!!errors.salary)}
          />
        </Field>

        <Field
          label="Cover Image URL (optional)"
          error={errors.imageUrl?.message as string | undefined}
        >
          <input
            {...register("imageUrl")}
            type="url"
            placeholder="https://images.unsplash.com/…"
            className={inputCls(!!errors.imageUrl)}
          />
        </Field>
      </div>

      {/* Description */}
      <Field
        label="Experience Details & Interview Rounds"
        error={errors.description?.message as string | undefined}
      >
        <textarea
          {...register("description")}
          rows={12}
          placeholder="Share details about the interview process, rounds, questions asked, and preparation advice. Supports HTML."
          className={cn(
            inputCls(!!errors.description),
            "resize-y font-mono text-xs"
          )}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Minimum 20 characters. Detail the interview rounds, technical topics, and tips for students.
        </p>
      </Field>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending
            ? isEditing
              ? "Saving…"
              : "Publishing…"
            : isEditing
            ? "Save Changes"
            : "Publish Experience"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/recruiter/experiences")}
          className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-xl border bg-background px-3 py-2.5 text-sm transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400",
    hasError && "border-destructive focus:ring-destructive/30"
  );
}
