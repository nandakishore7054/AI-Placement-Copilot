import {
  TrendingUp,
  DollarSign,
  Flame,
  Compass,
  Newspaper,
  Calendar,
  Building,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import type { InsightCategory } from "@prisma/client";

interface CareerInsightCardProps {
  insight: {
    id: string;
    category: InsightCategory;
    title: string;
    content: string;
    dataPoints?: any;
    source?: string | null;
    createdAt: Date | string;
  };
  className?: string;
}

export function CareerInsightCard({ insight, className = "" }: CareerInsightCardProps) {
  const categoryConfig = {
    SKILL_DEMAND: {
      label: "Skill Demand",
      icon: Flame,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    SALARY_INSIGHT: {
      label: "Salary Benchmark",
      icon: DollarSign,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    MARKET_TREND: {
      label: "Market Trend",
      icon: TrendingUp,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    },
    CAREER_PATH: {
      label: "Career Trajectory",
      icon: Compass,
      color: "text-violet-700 bg-violet-50 border-violet-200",
    },
    INDUSTRY_NEWS: {
      label: "Industry News",
      icon: Newspaper,
      color: "text-sky-700 bg-sky-50 border-sky-200",
    },
  }[insight.category] || {
    label: "Market Insight",
    icon: TrendingUp,
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
  };

  const CategoryIcon = categoryConfig.icon;
  const dataPoints = insight.dataPoints && typeof insight.dataPoints === "object"
    ? Object.entries(insight.dataPoints)
    : [];

  return (
    <div
      className={cn(
        "rounded-3xl border bg-card p-6 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between",
        className
      )}
    >
      <div className="space-y-3">
        {/* Category & Date */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              categoryConfig.color
            )}
          >
            <CategoryIcon className="h-3 w-3" />
            {categoryConfig.label}
          </span>

          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(insight.createdAt)}
          </span>
        </div>

        <h3 className="text-base font-bold text-foreground tracking-tight leading-snug">
          {insight.title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {insight.content}
        </p>

        {/* Data points badges */}
        {dataPoints.length > 0 && (
          <div className="pt-2">
            <div className="grid grid-cols-2 gap-2">
              {dataPoints.map(([key, val], idx) => (
                <div
                  key={idx}
                  className="rounded-xl border bg-muted/20 p-2.5 space-y-0.5"
                >
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block truncate">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-xs font-black text-foreground truncate block">
                    {Array.isArray(val) ? val.join(", ") : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Source */}
      {insight.source && (
        <div className="pt-3 border-t text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Building className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="truncate">Source: {insight.source}</span>
        </div>
      )}
    </div>
  );
}
