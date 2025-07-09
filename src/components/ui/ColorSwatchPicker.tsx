// src/components/ui/ColorSwatchPicker.tsx
'use client';

import React from 'react';
import { DEFAULT_COLORS } from '@/constants';

/**
 * Click-a-colour control.
 * - `colors` defaults to a neat Tailwind palette.
 * - Calls `onChange(hexOrTwClass)` when the user picks a swatch.
 */
export default function ColorSwatchPicker({
  value,
  onChange,
  colors = DEFAULT_COLORS,
}: {
  value: string; // currently selected colour
  onChange: (c: string) => void; // callback with the colour chosen
  colors?: string[]; // tailwind bg-classes OR hexes
}) {
  return (
    <div className="flex gap-2 justify-center items-center">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`
        w-12 h-12 rounded-full shadow border-2
        ${c.startsWith('#') ? '' : c}
        ${value === c ? 'ring-2 ring-black' : 'border-white'}
      `}
          style={c.startsWith('#') ? { backgroundColor: c } : undefined}
          aria-label={c}
        />
      ))}
    </div>
  );
}
