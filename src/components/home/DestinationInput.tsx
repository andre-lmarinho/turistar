// src/components/home/DestinationInput.tsx
'use client';

import React from 'react';
import { Spinner } from '@/components';
import { useDebounce, useDestinationAutocomplete } from '@/hooks';

interface PlaceSelection {
  name: string;
  latitude: number;
  longitude: number;
}

interface Props {
  value: string;
  onChange: (val: string | PlaceSelection) => void;
}

export default function DestinationInput({ value, onChange }: Props) {
  const debounced = useDebounce(value);
  const { results, loading } = useDestinationAutocomplete(debounced);

  // Track whether the suggestion list is visible
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <label htmlFor="dest-input" className="sr-only">
        Destination
      </label>
      <input
        id="dest-input"
        type="text"
        value={value}
        onChange={(e) => {
          setOpen(true);
          onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Tab' && open) {
            const first = results[0];
            if (first) {
              onChange({
                name: first.name,
                latitude: first.latitude,
                longitude: first.longitude,
              });
            }
            setOpen(false);
          }
        }}
        onBlur={() => setOpen(false)}
        placeholder="City"
        className="w-full rounded border px-2 py-1 text-sm"
        autoComplete="off"
      />
      {loading && <Spinner className="absolute top-2 right-2 size-4" />}
      {open && results.length > 0 && (
        <ul className="bg-background absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded border text-sm shadow">
          {results.map((r) => (
            <li key={`${r.latitude}-${r.longitude}`}>
              <button
                type="button"
                className="hover:bg-accent w-full px-2 py-1 text-left"
                onMouseDown={() => {
                  onChange({
                    name: r.name,
                    latitude: r.latitude,
                    longitude: r.longitude,
                  });
                  setOpen(false);
                }}
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
