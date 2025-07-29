// src/components/home/DestinationInput.tsx
'use client';

import React from 'react';
import { Spinner } from '@/components';
import { useDestinationAutocomplete } from '@/hooks';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function DestinationInput({ value, onChange }: Props) {
  const { results, loading } = useDestinationAutocomplete(value);
  return (
    <div className="relative">
      <label htmlFor="dest-input" className="sr-only">
        Destination
      </label>
      <input
        id="dest-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="City"
        className="w-full rounded border px-2 py-1 text-sm"
        autoComplete="off"
      />
      {loading && <Spinner className="absolute top-2 right-2 size-4" />}
      {results.length > 0 && (
        <ul className="bg-background absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded border text-sm shadow">
          {results.map((r) => (
            <li key={`${r.latitude}-${r.longitude}`}>
              <button
                type="button"
                className="hover:bg-accent w-full px-2 py-1 text-left"
                onClick={() => onChange(r.name)}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
