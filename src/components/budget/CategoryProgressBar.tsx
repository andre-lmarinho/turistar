// src/components/budget/CategoryProgressBar.tsx

import React from 'react';
import { Info } from 'lucide-react';
import { CategoryKey, CATEGORIES, CHART_COLORS, BUDGET_INFO } from '@/constants';
import { InfoPopup } from '@/components';

interface Props {
  category: CategoryKey;
  value: number;
  total: number;
  colorIndex: number;
}

export default function CategoryProgressBar({ category, value, total, colorIndex }: Props) {
  const { label, icon } = CATEGORIES.find((c) => c.key === category)!;
  const percent = total ? Math.min(100, (value / total) * 100) : 0;
  const Icon = icon;

  return (
    <>
      <div className="z-30 flex items-center justify-between">
        <div className="ml-1 flex items-center gap-2">
          <Icon size={16} aria-hidden="true" />
          <span className="flex items-center gap-1 text-sm">
            {label}
            <InfoPopup content={BUDGET_INFO[category]}>
              <Info size={12} aria-hidden="true" className="text-muted-foreground" />
            </InfoPopup>
          </span>
        </div>
        <span className="mr-1 w-20 text-right text-sm" aria-label={`$${value.toFixed(2)} spent`}>
          {'$' + value.toFixed(2)}
        </span>
      </div>

      {/* accessible progress bar */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label={`${label} usage ${Math.round(percent)}%`}
        className="bg-muted mb-3 flex-1 rounded"
      >
        <div
          className="h-2 rounded"
          style={{ width: `${percent}%`, backgroundColor: CHART_COLORS[colorIndex] }}
        />
      </div>
    </>
  );
}
