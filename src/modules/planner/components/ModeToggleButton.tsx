"use client";

import { useTranslations } from "next-intl";
import { ToggleButton } from "@/ui/components/button";
import type { LucideIcon } from "@/ui/components/icon";
import { Calendar, DollarSign, List, Map as MapIcon } from "@/ui/components/icon";

export const modeOrder = ["overview", "kanban", "map", "budget"] as const;
export type PlannerMode = (typeof modeOrder)[number];

const MODE_CONFIG: Record<PlannerMode, { labelKey: string; icon: LucideIcon }> = {
  overview: { labelKey: "modeTrip", icon: Calendar },
  kanban: { labelKey: "modeBoard", icon: List },
  map: { labelKey: "modeMap", icon: MapIcon },
  budget: { labelKey: "modeBudget", icon: DollarSign },
};

interface ModeToggleButtonProps {
  value: PlannerMode;
  onChange: (mode: PlannerMode) => void;
  modes?: readonly PlannerMode[];
}

export function ModeToggleButton({ value, onChange, modes = modeOrder }: ModeToggleButtonProps) {
  const t = useTranslations();
  return (
    <ToggleButton
      options={[...modes]}
      value={value}
      onChange={(mode) => onChange(mode as PlannerMode)}
      renderOption={(mode) => {
        const config = MODE_CONFIG[mode as PlannerMode];
        return {
          label: t(config.labelKey as "modeTrip" | "modeBoard" | "modeMap" | "modeBudget"),
          icon: config.icon,
        };
      }}
      getOptionTestId={(mode) => `planner-mode-${mode}`}
    />
  );
}
