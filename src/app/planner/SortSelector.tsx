// src/app/planner/SortSelector.tsx
"use client";

import React from "react";

export const sortModes = ["A-Z", "Price", "Duration"] as const;
export type SortMode = typeof sortModes[number]; // <- union type

/** Tiny select used in DestinationFilterPanel */
export default function SortSelector({
  value,
  onChange,
}: {
  value: SortMode;               // ← use union
  onChange: (mode: SortMode) => void; // ← use union
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortMode)}
      className="border rounded px-2 py-1 text-sm"
    >
      {sortModes.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}
