// src/components/planner/catalog/CategoryFilterBar.tsx
'use client';

import React from 'react';

/**
 * Horizontal scrollable pill list.
 * Click toggles a category on/off.
 */
export default function CategoryFilterBar({
  categories,
  active,
  onToggle,
}: {
  categories: string[];
  active: Set<string>;
  onToggle: (cat: string) => void;
}) {
  return (
    <div className="flex overflow-x-auto gap-2 pb-1">
      {categories.map((cat) => {
        const isOn = active.has(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-sm border transition
            ${isOn ? 'bg-[var(--muted)] text-[var(--muted-foreground)]' : 'bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--muted)] hover:text-[var(--muted-foreground)]'}
            `}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
