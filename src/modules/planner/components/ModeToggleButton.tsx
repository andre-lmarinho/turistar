"use client";

import { ToggleButton } from "@/shared/ui/button";
import type { LucideIcon } from "@/shared/ui/icon";
import { DollarSign, List, Map as MapIcon } from "@/shared/ui/icon";

export const modeOrder = ["planner", "map", "budget"] as const;
export type PlannerMode = (typeof modeOrder)[number];

const MODE_CONFIG: Record<PlannerMode, { label: string; icon: LucideIcon }> = {
  planner: { label: "Planner", icon: List },
  map: { label: "Map", icon: MapIcon },
  budget: { label: "Budget", icon: DollarSign },
};

interface ModeToggleButtonProps {
  value: PlannerMode;
  onChange: (mode: PlannerMode) => void;
}

const modeOptions: PlannerMode[] = [...modeOrder];

export function ModeToggleButton({ value, onChange }: ModeToggleButtonProps) {
  return (
    <ToggleButton
      options={modeOptions}
      value={value}
      onChange={(mode) => onChange(mode as PlannerMode)}
      renderOption={(mode) => MODE_CONFIG[mode as PlannerMode]}
    />
  );
}
