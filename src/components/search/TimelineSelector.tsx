"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TimelineFlexibility } from "@/types/database";

interface TimelineSelectorProps {
  targetDate: string;
  earliestDate: string;
  latestDate: string;
  flexibility: TimelineFlexibility | "";
  onChange: (field: string, value: string) => void;
}

const flexibilityOptions: { value: TimelineFlexibility; label: string; desc: string }[] = [
  { value: "rigid", label: "Rigid", desc: "Must be within these dates" },
  { value: "somewhat_flexible", label: "Flexible", desc: "Prefer these dates, some wiggle room" },
  { value: "very_flexible", label: "Very Flexible", desc: "Open to a wide range of timelines" },
];

export function TimelineSelector({
  targetDate, earliestDate, latestDate, flexibility, onChange,
}: TimelineSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          id="target_move_date"
          label="Target Move Date"
          type="date"
          value={targetDate}
          onChange={(e) => onChange("target_move_date", e.target.value)}
        />
        <Input
          id="earliest_move_date"
          label="Earliest"
          type="date"
          value={earliestDate}
          onChange={(e) => onChange("earliest_move_date", e.target.value)}
        />
        <Input
          id="latest_move_date"
          label="Latest"
          type="date"
          value={latestDate}
          onChange={(e) => onChange("latest_move_date", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Flexibility</label>
        <div className="grid grid-cols-3 gap-2">
          {flexibilityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange("timeline_flexibility", opt.value)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                flexibility === opt.value
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <p className="text-sm font-medium text-gray-900">{opt.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
