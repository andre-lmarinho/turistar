// src/components/budget/CategoryProgressBar.tsx
import React from 'react';
import { CategoryKey, CATEGORIES, CHART_COLORS } from '@/constants';

interface Props {
  category: CategoryKey;
  value: number;
  total: number;
  colorIndex: number;
}

export function CategoryProgressBar({ category, value, total, colorIndex }: Props) {
  const { label, icon } = CATEGORIES.find((c) => c.key === category)!;
  const percent = total ? Math.min(100, (value / total) * 100) : 0;
  const Icon = icon;

  return (
    <div className="flex items-center gap-2">
      <Icon size={16} aria-hidden />
      <span className="w-32 text-sm">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded" aria-hidden>
        <div
          className="h-2 rounded"
          style={{ width: `${percent}%`, backgroundColor: CHART_COLORS[colorIndex] }}
        />
      </div>
      <span className="w-20 text-right text-sm">${value.toFixed(2)}</span>
    </div>
  );
}
