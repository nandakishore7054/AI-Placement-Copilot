"use client";

import { useState } from "react";
import { CareerInsightCard } from "./career-insight-card";
import { cn } from "@/lib/utils";
import type { InsightCategory } from "@prisma/client";

interface CareerInsightsFeedProps {
  insights: any[];
  className?: string;
}

const CATEGORIES: Array<{ id: "ALL" | InsightCategory; label: string }> = [
  { id: "ALL", label: "All Insights" },
  { id: "SKILL_DEMAND", label: "Skill Demand" },
  { id: "SALARY_INSIGHT", label: "Salary Trends" },
  { id: "MARKET_TREND", label: "Market Trends" },
  { id: "CAREER_PATH", label: "Career Paths" },
];

export function CareerInsightsFeed({ insights, className = "" }: CareerInsightsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | InsightCategory>("ALL");

  const filtered = insights.filter((i) => {
    if (selectedCategory === "ALL") return true;
    return i.category === selectedCategory;
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border w-fit">
        {CATEGORIES.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
              selectedCategory === tab.id
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <CareerInsightCard key={item.id} insight={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground text-xs">
          No insights currently available in this category.
        </div>
      )}
    </div>
  );
}
