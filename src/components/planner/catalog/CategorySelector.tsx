// src/components/planner/catalog/CategorySelector.tsx
'use client';

import React from 'react';
import { CategoryFilterBar } from '@/components';
import { GEOAPIFY_CATEGORIES } from '@/lib';

interface CategorySelectorProps {
  active: Set<string>;
  onToggle: (cat: string) => void;
  submitted: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export default function CategorySelector({
  active,
  onToggle,
  submitted,
  onSubmit,
  onBack,
}: CategorySelectorProps) {
  if (submitted) {
    return (
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <button type="button" onClick={onBack} className="rounded border px-3 py-1 text-sm">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
      <div className="flex-1 overflow-x-auto">
        <CategoryFilterBar categories={GEOAPIFY_CATEGORIES} active={active} onToggle={onToggle} />
      </div>
      <button
        type="button"
        disabled={active.size === 0}
        onClick={onSubmit}
        className="rounded border px-3 py-1 text-sm"
      >
        Search
      </button>
    </div>
  );
}
