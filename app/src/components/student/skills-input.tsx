"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  placeholder?: string;
  error?: string;
}

const SUGGESTED_SKILLS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python",
  "Java", "SQL", "PostgreSQL", "MongoDB", "Docker",
  "AWS", "Git", "REST API", "GraphQL", "Next.js",
  "Vue.js", "Angular", "Go", "Rust", "Kubernetes",
];

export function SkillsInput({
  value,
  onChange,
  maxSkills = 30,
  placeholder = "Type a skill and press Enter...",
  error,
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("");

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (value.length >= maxSkills) return;
    if (value.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setInputValue("");
  }

  function removeSkill(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  }

  const suggestions = SUGGESTED_SKILLS.filter(
    (s) =>
      !value.includes(s) &&
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      inputValue.length > 0,
  ).slice(0, 5);

  return (
    <div className="space-y-2">
      {/* Skills Chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-indigo-900 transition-colors ml-0.5"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length >= maxSkills ? `Max ${maxSkills} skills` : placeholder}
          disabled={value.length >= maxSkills}
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
        />

        {/* Autocomplete Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 z-10 rounded-lg border bg-popover shadow-md overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Counter + error */}
      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Press Enter or comma to add. Backspace to remove last skill.
          </p>
        )}
        <span className={`text-xs ${value.length >= maxSkills ? "text-destructive" : "text-muted-foreground"}`}>
          {value.length}/{maxSkills}
        </span>
      </div>
    </div>
  );
}
