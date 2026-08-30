"use client";

// src/components/jobs/recruiter-job-form.tsx
// Create / Edit job form for recruiters.
// Uses react-hook-form v7 + @hookform/resolvers v3 (Zod v3 compatible).

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { CreateJobSchema, UpdateJobSchema } from "@/schemas/job";
import type { CreateJobInput, UpdateJobInput } from "@/schemas/job";
import { createJob, updateJob } from "@/actions/jobs";
import {
  JOB_CATEGORIES,
  JOB_LEVEL_LABELS,
  JOB_TYPE_LABELS,
  POPULAR_LOCATIONS,
} from "@/lib/constants";
import { JobType } from "@prisma/client";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BaseProps {
  companyId: string;
}
interface CreateProps extends BaseProps {
  mode: "create";
  existingJob?: never;
}
interface EditProps extends BaseProps {
  mode: "edit";
  existingJob: UpdateJobInput & { id: string };
}
type RecruiterJobFormProps = CreateProps | EditProps;

// ─── Component ────────────────────────────────────────────────────────────────

export function RecruiterJobForm({ companyId, mode, existingJob }: RecruiterJobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = mode === "edit";

  // Single form typed as any to avoid union-register incompatibility.
  // Validation is still 100% enforced via Zod resolver at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(isEditing ? UpdateJobSchema : CreateJobSchema),
    defaultValues: isEditing
      ? existingJob
      : {
          title: "",
          description: "",
          location: "",
          category: "",
          level: "",
          type: JobType.FULL_TIME,
          salary: "",
          applyLink: "",
        },
  });

  function onSubmit(data: CreateJobInput | UpdateJobInput) {
    startTransition(async () => {
      try {
        if (isEditing && existingJob) {
          await updateJob(existingJob.id, companyId, data as UpdateJobInput);
          toast.success("Job updated successfully!");
        } else {
          await createJob(companyId, data as CreateJobInput);
          toast.success("Job posted successfully!");
        }
        router.push("/recruiter/jobs");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <Field label="Job Title" error={errors.title?.message as string | undefined}>
        <input
          {...register("title")}
          placeholder="e.g. Senior React Developer"
          className={inputCls(!!errors.title)}
        />
      </Field>

      {/* Category + Location */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" error={errors.category?.message as string | undefined}>
          <select {...register("category")} className={inputCls(!!errors.category)}>
            <option value="">Select category…</option>
            {JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Location" error={errors.location?.message as string | undefined}>
          <input
            {...register("location")}
            list="locations-list"
            placeholder="e.g. Bangalore or Remote"
            className={inputCls(!!errors.location)}
          />
          <datalist id="locations-list">
            {POPULAR_LOCATIONS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </Field>
      </div>

      {/* Level + Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Experience Level" error={errors.level?.message as string | undefined}>
          <select {...register("level")} className={inputCls(!!errors.level)}>
            <option value="">Select level…</option>
            {Object.entries(JOB_LEVEL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>

        <Field label="Job Type" error={errors.type?.message as string | undefined}>
          <select {...register("type")} className={inputCls(!!errors.type)}>
            {Object.entries(JOB_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Salary + Apply Link */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Salary (optional)" error={errors.salary?.message as string | undefined}>
          <input
            {...register("salary")}
            placeholder="e.g. 10–14 LPA"
            className={inputCls(!!errors.salary)}
          />
        </Field>

        <Field label="External Apply Link (optional)" error={errors.applyLink?.message as string | undefined}>
          <input
            {...register("applyLink")}
            type="url"
            placeholder="https://yourcompany.com/careers/…"
            className={inputCls(!!errors.applyLink)}
          />
        </Field>
      </div>

      {/* Description */}
      <Field label="Job Description" error={errors.description?.message as string | undefined}>
        <textarea
          {...register("description")}
          rows={12}
          placeholder="Describe the role, responsibilities, and requirements. Supports HTML."
          className={cn(inputCls(!!errors.description), "resize-y font-mono text-xs")}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Minimum 50 characters. HTML is rendered on the job detail page.
        </p>
      </Field>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending
            ? isEditing ? "Saving…" : "Publishing…"
            : isEditing ? "Save Changes" : "Publish Job"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/recruiter/jobs")}
          className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
