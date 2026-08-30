"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  AlignLeft,
} from "lucide-react";
import { DeleteResumeDialog } from "./delete-resume-dialog";
import { ResumeUploader } from "./resume-uploader";
import { formatDate, timeAgo } from "@/lib/utils";

export interface ResumeData {
  id: string;
  fileUrl: string;
  fileName: string;
  extractedText: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ResumeViewerProps {
  resume: ResumeData;
}

export function ResumeViewer({ resume }: ResumeViewerProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);

  const charCount = resume.extractedText ? resume.extractedText.length : 0;
  const wordCount = resume.extractedText
    ? resume.extractedText.trim().split(/\s+/).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Active Resume Card */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {/* File Icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
              <FileText className="h-7 w-7" />
            </div>

            {/* File Information */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-foreground truncate">
                  {resume.fileName}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Text Extracted
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                  Uploaded {formatDate(resume.updatedAt)} ({timeAgo(resume.updatedAt)})
                </span>
                <span>•</span>
                <span>
                  <strong className="text-foreground">{wordCount.toLocaleString()}</strong> words (
                  <strong className="text-foreground">{charCount.toLocaleString()}</strong> chars)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors active:scale-95"
            >
              <span>View PDF</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>

            <button
              type="button"
              onClick={() => setShowUploader(!showUploader)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{showUploader ? "Close Uploader" : "Replace Resume"}</span>
            </button>

            <DeleteResumeDialog fileName={resume.fileName} />
          </div>
        </div>

        {/* Collapsible Replace Form */}
        {showUploader && (
          <div className="pt-4 border-t animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Upload New Version
            </div>
            <ResumeUploader onUploadSuccess={() => setShowUploader(false)} />
          </div>
        )}
      </div>

      {/* Extracted Text Preview Card */}
      <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlignLeft className="h-4 w-4 text-indigo-500" />
            <h3 className="font-semibold text-sm text-foreground">
              Extracted Resume Content Preview
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowExtractedText(!showExtractedText)}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>{showExtractedText ? "Hide Text" : "Show Text Preview"}</span>
            {showExtractedText ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {showExtractedText ? (
          <div className="pt-2 border-t">
            {resume.extractedText ? (
              <pre className="max-h-96 overflow-y-auto rounded-xl bg-muted/40 p-4 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap select-text border">
                {resume.extractedText}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2">
                No plain text could be extracted from this document (it may be a scanned image-only PDF).
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {charCount > 0
              ? `${charCount.toLocaleString()} characters of plain text successfully parsed from your PDF and ready for placement matching.`
              : "No text extracted."}
          </p>
        )}
      </div>
    </div>
  );
}
