"use client";

import React from "react";
import { DEFAULT_COLORS } from "@/constants/colors";

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
  value: string;                   // currently selected colour
  onChange: (c: string) => void;   // callback with the colour chosen
  colors?: string[];               // tailwind bg-classes OR hexes
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`
            w-6 h-6 rounded-full border-2
            ${c.startsWith("#") ? "" : c}          /* tailwind class */
            ${value === c ? "ring-2 ring-black" : "border-white"}
          `}
          style={c.startsWith("#") ? { backgroundColor: c } : undefined}
          aria-label={c}
        />
      ))}
    </div>
  );
}
