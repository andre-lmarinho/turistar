// src/components/planner/catalog/CitySwitcher.tsx
'use client';

import React, { useState } from 'react';

/**
 * Simple text input + confirm button to change destination.
 * You’ll wire the callback into navigation later.
 */
export default function CitySwitcher({
  city,
  onChangeCity,
}: {
  city: string;
  onChangeCity: (newCity: string) => void;
}) {
  const [value, setValue] = useState(city);

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border rounded px-2 py-1 text-sm w-28"
      />
      <button
        onClick={() => onChangeCity(value.trim())}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go
      </button>
    </div>
  );
}
