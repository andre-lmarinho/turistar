// src/components/planner/catalog/CitySwitcher.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

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

      <Button size="sm" className="cursor-pointer" onClick={() => onChangeCity(value.trim())}>
        Go
      </Button>
    </div>
  );
}
