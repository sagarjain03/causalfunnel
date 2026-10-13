"use client";

import { cn } from "@/lib/utils";

export type HeatmapMode = "dots" | "grid";

const MODES: { value: HeatmapMode; label: string }[] = [
  { value: "dots", label: "Dots" },
  { value: "grid", label: "Grid" },
];

/** Dots / Grid segmented control (glass pill; the selected segment uses the active-nav style). */
export function ModeToggle({ mode, onChange }: { mode: HeatmapMode; onChange: (mode: HeatmapMode) => void }) {
  return (
    <div className="glass flex h-9 shrink-0 items-center rounded-full p-1" role="radiogroup" aria-label="Display mode">
      {MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          role="radio"
          aria-checked={mode === m.value}
          onClick={() => onChange(m.value)}
          className={cn(
            "h-7 rounded-full px-3 text-sm",
            mode === m.value ? "glass-shine bg-panel-raised text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
