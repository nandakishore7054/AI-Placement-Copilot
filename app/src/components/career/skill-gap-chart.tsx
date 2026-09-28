"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface SkillDataPoint {
  skill: string;
  score: number;
  status: "ACQUIRED" | "IMPROVING" | "MISSING";
}

interface SkillGapChartProps {
  skills: SkillDataPoint[];
  className?: string;
}

export function SkillGapChart({ skills, className }: SkillGapChartProps) {
  // Select top 6 to 8 representative skills for the radar visualization
  const radarSkills = useMemo(() => {
    if (skills.length <= 8) return skills;
    // Pick a balanced distribution of acquired, improving, and missing skills
    const acquired = skills.filter((s) => s.status === "ACQUIRED").slice(0, 3);
    const improving = skills.filter((s) => s.status === "IMPROVING").slice(0, 3);
    const missing = skills.filter((s) => s.status === "MISSING").slice(0, 2);
    const combined = [...acquired, ...improving, ...missing];
    return combined.length >= 4 ? combined : skills.slice(0, 8);
  }, [skills]);

  const numAxes = radarSkills.length;
  const size = 320;
  const center = size / 2;
  const radius = 100;
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = radius * (value / 100);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Grid level polygons
  const gridPolygons = levels.map((lvl) => {
    return Array.from({ length: numAxes })
      .map((_, i) => {
        const { x, y } = getCoordinates(lvl * 100, i, numAxes);
        return `${x},${y}`;
      })
      .join(" ");
  });

  // Benchmark polygon (role expectation = 80%)
  const benchmarkPolygon = Array.from({ length: numAxes })
    .map((_, i) => {
      const { x, y } = getCoordinates(80, i, numAxes);
      return `${x},${y}`;
    })
    .join(" ");

  // Candidate proficiency polygon
  const candidatePolygon = radarSkills
    .map((item, i) => {
      const { x, y } = getCoordinates(Math.max(10, item.score), i, numAxes);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[300px] h-auto overflow-visible select-none drop-shadow-xs"
      >
        {/* Background concentric web circles/polygons */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill={idx === 3 ? "currentColor" : "none"}
            className={cn(
              "stroke-muted-foreground/20",
              idx === 3 ? "text-muted/10" : ""
            )}
            strokeWidth="1"
            strokeDasharray={idx < 3 ? "2 2" : undefined}
          />
        ))}

        {/* Spoke Axes */}
        {radarSkills.map((_, i) => {
          const { x, y } = getCoordinates(100, i, numAxes);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-muted-foreground/25"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark Expectation Polygon (Dashed Slate) */}
        <polygon
          points={benchmarkPolygon}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Candidate Actual Skills Polygon (Indigo Gradient Fill) */}
        <polygon
          points={candidatePolygon}
          fill="rgba(99, 102, 241, 0.25)"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Point Markers & Value Dots */}
        {radarSkills.map((item, i) => {
          const { x, y } = getCoordinates(Math.max(10, item.score), i, numAxes);
          const color =
            item.score >= 70
              ? "#10b981" // emerald
              : item.score >= 35
              ? "#6366f1" // indigo
              : "#f43f5e"; // rose

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill={color}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Axis Labels */}
        {radarSkills.map((item, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          const isLeft = Math.cos(angle) < -0.2;
          const isRight = Math.cos(angle) > 0.2;
          const textAnchor = isRight ? "start" : isLeft ? "end" : "middle";

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="fill-foreground text-[10px] font-bold tracking-tight"
            >
              {item.skill.length > 12 ? `${item.skill.slice(0, 10)}…` : item.skill}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-[11px] font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          Your Proficiency
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 border-t-2 border-dashed border-slate-400" />
          Role Benchmark (80%)
        </span>
      </div>
    </div>
  );
}
