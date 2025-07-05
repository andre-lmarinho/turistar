// src/components/planner/catalog/CategoryFilterBar.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

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
          <Button
            key={cat}
            onClick={() => onToggle(cat)}
            size="sm"
            variant="ghost"
            className={`whitespace-nowrap px-3 py-1 rounded-full text-sm border transition ${
              isOn
                ? 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                : 'bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--muted)] hover:text-[var(--muted-foreground)]'
            }`}
          >
            {cat}
          </Button>
        );
      })}
    </div>
  );
}
