// src/components/planner/catalog/SortSelector.tsx
'use client';

import React from 'react';

export const sortModes = ['A-Z', 'Price', 'Duration', 'Rating', 'Reviews'] as const;
export type SortMode = (typeof sortModes)[number]; // <- union type

/** Tiny select used in DestinationFilterPanel */
export default function SortSelector({
  value,
  onChange,
}: {
  value: SortMode; // ← use union
  onChange: (mode: SortMode) => void; // ← use union
}) {
  return (
    <select
      id="sort-mode"
      name="sort"
      value={value}
      onChange={(e) => onChange(e.target.value as SortMode)}
      className="rounded border px-2 py-1 text-sm"
    >
      {sortModes.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}
