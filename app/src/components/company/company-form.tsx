"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Building2 } from "lucide-react";
import {
  CreateCompanySchema,
  UpdateCompanySchema,
} from "@/schemas/company";
import type { CreateCompanyInput, UpdateCompanyInput } from "@/schemas/company";
import { INDUSTRIES, COMPANY_SIZES } from "@/lib/constants";
import type { Company } from "@prisma/client";
import { toast } from "sonner";

interface CreateCompanyFormProps {
  mode: "create";
  onSuccess?: (company: { id: string; name: string }) => void;
  onSubmit: (data: CreateCompanyInput) => Promise<{ id: string; name: string }>;
}

interface EditCompanyFormProps {
  mode: "edit";
  company: Pick<Company, "id" | "name" | "email" | "website" | "description" | "industry" | "size">;
  onSuccess?: () => void;
  onSubmit: (data: UpdateCompanyInput) => Promise<void>;
}

type CompanyFormProps = CreateCompanyFormProps | EditCompanyFormProps;

export function CompanyForm(props: CompanyFormProps) {
  const [isPending, startTransition] = useTransition();
  const isCreate = props.mode === "create";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(isCreate ? CreateCompanySchema : UpdateCompanySchema) as any,
    defaultValues: isCreate
      ? { name: "", email: "" }
      : {
          name: (props as EditCompanyFormProps).company.name,
          email: (props as EditCompanyFormProps).company.email,
          website: (props as EditCompanyFormProps).company.website ?? "",
          description: (props as EditCompanyFormProps).company.description ?? "",
          industry: (props as EditCompanyFormProps).company.industry ?? undefined,
          size: (props as EditCompanyFormProps).company.size ?? undefined,
        },
  });

  function onSubmit(data: CreateCompanyInput) {
    startTransition(async () => {
      try {
        if (isCreate) {
          const result = await (props as CreateCompanyFormProps).onSubmit(data);
          toast.success(`${result.name} created successfully!`);
          (props as CreateCompanyFormProps).onSuccess?.(result);
        } else {
          await (props as EditCompanyFormProps).onSubmit(data);
          toast.success("Company updated successfully!");
          (props as EditCompanyFormProps).onSuccess?.();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Company Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Company Name <span className="text-destructive">*</span>
        </label>
        <input
          {...register("name")}
          placeholder="Acme Corporation"
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Company Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Company Email <span className="text-destructive">*</span>
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="careers@acme.com"
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Website */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Website</label>
        <input
          {...register("website")}
          type="url"
          placeholder="https://acme.com"
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {errors.website && (
          <p className="text-xs text-destructive">{errors.website.message}</p>
        )}
      </div>

      {/* Industry + Size Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Industry</label>
          <select
            {...register("industry")}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Company Size</label>
          <select
            {...register("size")}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select size</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} employees
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Tell candidates what makes your company great..."
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
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
            {isCreate ? "Creating..." : "Saving..."}
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4" />
            {isCreate ? "Create Company" : "Save Changes"}
          </>
        )}
      </button>
    </form>
  );
}
