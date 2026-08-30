"use client";

import { useState } from "react";
import {
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { QuestionDifficulty } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface InterviewQuestionItem {
  id: string;
  questionText: string;
  topic?: string | null;
  difficulty: QuestionDifficulty;
  orderIndex: number;
  expectedAnswer?: string | null;
}

interface QuestionListProps {
  questions: InterviewQuestionItem[];
}

export function QuestionList({ questions }: QuestionListProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const difficultyConfig = {
    [QuestionDifficulty.EASY]: {
      label: "Easy",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    [QuestionDifficulty.MEDIUM]: {
      label: "Medium",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    [QuestionDifficulty.HARD]: {
      label: "Hard",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            AI-Generated Interview Questions ({questions.length})
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Ordered for optimal interview flow
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const isExpanded = !!expandedIndices[i];
          const diff = difficultyConfig[q.difficulty] ?? difficultyConfig[QuestionDifficulty.MEDIUM];

          return (
            <div
              key={q.id || i}
              className="rounded-2xl border bg-card p-5 shadow-xs space-y-3 transition-all hover:border-indigo-200"
            >
              {/* Question Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-2xs">
                    Q{q.orderIndex + 1}
                  </div>

                  {q.topic && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/80 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      <Tag className="h-3 w-3" />
                      {q.topic}
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0",
                    diff.className,
                  )}
                >
                  {diff.label}
                </span>
              </div>

              {/* Question Text */}
              <p className="text-sm font-medium text-foreground leading-relaxed pl-0.5">
                {q.questionText}
              </p>

              {/* Guidance / Expected Answer Accordion */}
              {q.expectedAnswer && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleExpand(i)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    <span>{isExpanded ? "Hide evaluation guidance" : "Show evaluation guidance & key concepts"}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 text-xs text-indigo-950 leading-relaxed space-y-1.5">
                      <p className="font-semibold text-indigo-800 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                        Key Response Criteria:
                      </p>
                      <p>{q.expectedAnswer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
