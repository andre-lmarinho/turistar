'use client';

import React from 'react';

import type { Activity } from '@/features/planner/domain/types/PlannerEntities';
import { useCardColors } from '@/features/planner/hooks/ui/useCardColors';
import { ActivityCardBase } from './ActivityCardBase';

export interface ActivityCardProps {
  activity: Activity & { dayId?: string };
  onSelect?: () => void;
  bgColor: string;
}

export function ActivityCard({ activity, onSelect, bgColor }: ActivityCardProps) {
  const { title, duration, budget, color, imageUrl } = activity;

  const { twBg, border: borderColorClass } = useCardColors(
    color && !color.startsWith('#') ? color : undefined,
    bgColor
  );

  return (
    <div className="group relative">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onSelect?.()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.();
          }
        }}
      >
        <ActivityCardBase
          title={title}
          imageUrl={imageUrl}
          duration={duration}
          twBg={twBg}
          budget={budget}
          borderColorClass={borderColorClass}
        />
      </button>
    </div>
  );
}
