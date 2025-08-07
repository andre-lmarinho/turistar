// src/features/planner/components/catalog/CategorySelection.tsx
'use client';

import React from 'react';
import { CategoryFilterBar } from '@/features/planner';

interface CategorySelectionProps {
  categories: string[];
  active: Set<string>;
  onToggle: (cat: string) => void;
  onSearch: () => void;
}

export default function CategorySelection({
  categories,
  active,
  onToggle,
  onSearch,
}: CategorySelectionProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
      <div className="flex-1 overflow-x-auto">
        <CategoryFilterBar categories={categories} active={active} onToggle={onToggle} />
      </div>
      <button
        type="button"
        disabled={active.size === 0}
        onClick={onSearch}
        className="rounded border px-3 py-1 text-sm"
      >
        Search
      </button>
    </div>
  );
}
