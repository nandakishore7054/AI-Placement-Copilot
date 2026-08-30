"use client";

import { useState, useRef, useTransition, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { uploadResume } from "@/actions/resume";
import { cn } from "@/lib/utils";

interface ResumeUploaderProps {
  onUploadSuccess?: () => void;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ResumeUploader({ onUploadSuccess, className }: ResumeUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function validateFile(file: File): boolean {
    setValidationError(null);

    // Validate extension & type
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setValidationError("Please select a PDF file (.pdf format only).");
      return false;
    }

    // Validate size (5MB)
    if (file.size > MAX_FILE_SIZE) {
      setValidationError("File is too large. Maximum allowed size is 5MB.");
      return false;
    }

    return true;
  }

  function handleFileProcess(file: File) {
    if (!validateFile(file)) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const result = await uploadResume(formData);
        if (result.success) {
          toast.success(
            `Resume uploaded! Extracted ${result.resume.charCount.toLocaleString()} characters.`
          );
          setSelectedFile(null);
          onUploadSuccess?.();
          router.refresh();
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to upload resume.";
        setValidationError(errorMsg);
        toast.error(errorMsg);
        setSelectedFile(null);
      }
    });
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isPending) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isPending && fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]"
            : "border-zinc-200 bg-card hover:border-indigo-300 hover:bg-zinc-50/50",
          isPending && "pointer-events-none opacity-80"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isPending}
        />

        {/* State Icons */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
          {isPending ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <UploadCloud className="h-8 w-8" />
          )}
        </div>

        {/* Text Guidelines */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            {isPending
              ? `Processing & Extracting Text…`
              : "Drag & drop your resume PDF here"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {isPending ? (
              <span className="text-indigo-600 font-medium">
                Uploading to secure storage & parsing content…
              </span>
            ) : (
              <>
                or <span className="font-semibold text-indigo-600 underline">browse your files</span> from your device.
              </>
            )}
          </p>
        </div>

        {/* Requirements footer */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
            PDF format only
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
            Max 5MB
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
            Auto text extraction
          </span>
        </div>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive animate-in fade-in-0">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
