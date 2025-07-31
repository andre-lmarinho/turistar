// src/components/home/DestinationInput.tsx
'use client';

import React from 'react';
import { Spinner } from '@/components';
import { useDestinationAutocomplete } from '@/hooks';

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
  const { results, loading, error } = useDestinationAutocomplete(value);

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);

  const handleSelect = (r: PlaceSelection) => {
    onChange({ name: r.name, latitude: r.latitude, longitude: r.longitude });
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className="relative">
      <label htmlFor="dest-input" className="sr-only">
        Destination
      </label>
      <input
        id="dest-input"
        role="combobox"
        aria-expanded={open}
        aria-controls="dest-suggestions"
        aria-activedescendant={active >= 0 ? `dest-option-${active}` : undefined}
        type="text"
        value={value}
        onChange={(e) => {
          setOpen(true);
          setActive(-1);
          onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && results.length > 0) {
            e.preventDefault();
            setOpen(true);
            setActive((i) => (i + 1) % results.length);
          } else if (e.key === 'ArrowUp' && results.length > 0) {
            e.preventDefault();
            setOpen(true);
            setActive((i) => (i - 1 + results.length) % results.length);
          } else if ((e.key === 'Enter' || e.key === 'Tab') && open) {
            const idx = active >= 0 ? active : 0;
            const r = results[idx];
            if (r) {
              e.preventDefault();
              handleSelect(r);
            } else {
              setOpen(false);
            }
          }
        }}
        onBlur={() => {
          setOpen(false);
          setActive(-1);
        }}
        placeholder="City"
        className="w-full rounded border px-2 py-1 text-sm"
        autoComplete="off"
      />
      {loading && <Spinner className="absolute top-2 right-2 size-4" />}
      {error && <p className="mt-1 text-sm text-red-500">Failed to load suggestions.</p>}
      {open && results.length > 0 && !error && (
        <ul
          id="dest-suggestions"
          role="listbox"
          className="bg-background absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded border text-sm shadow"
        >
          {results.map((r, idx) => (
            <li key={`${r.latitude}-${r.longitude}`}>
              <button
                id={`dest-option-${idx}`}
                role="option"
                aria-selected={active === idx}
                tabIndex={-1}
                type="button"
                className={`w-full px-2 py-1 text-left ${
                  active === idx ? 'bg-accent' : 'hover:bg-accent'
                }`}
                onMouseDown={() => handleSelect(r)}
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
