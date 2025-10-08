'use client';

import React from 'react';
import Spinner from './Spinner';
import { Input } from './input';
import { Button } from './button';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { AutocompletePlace } from '@/shared/types/locations';
import type { LocationAutocompleteHook } from '@/shared/hooks/search/createLocationAutocompleteHook';

export type { LocationAutocompleteHook } from '@/shared/hooks/search/createLocationAutocompleteHook';

export interface LocationSearchInputProps {
  value: string;
  onChange: (val: string | AutocompletePlace) => void;
  id?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  latitude?: number;
  longitude?: number;
  autocompleteHook: LocationAutocompleteHook;
}

export default function LocationSearchInput({
  value,
  onChange,
  id = 'location-input',
  placeholder = 'Location',
  label,
  className = '',
  inputClassName,
  latitude,
  longitude,
  autocompleteHook,
}: LocationSearchInputProps) {
  const debounced = useDebounce(value);

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);

  const { results, loading, error } = autocompleteHook(debounced, {
    enabled: open,
    latitude,
    longitude,
  });

  const handleSelect = (r: AutocompletePlace) => {
    onChange({ name: r.name, latitude: r.latitude, longitude: r.longitude });
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className={`relative ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      <Input
        labelId={id}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-suggestions`}
        aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined}
        value={value}
        onValueChange={(val) => {
          setOpen(true);
          setActive(-1);
          onChange(val);
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
        placeholder={placeholder}
        align="left"
        inputSize="full"
        tone="search"
        density="search"
        inputClassName={inputClassName}
        autoComplete="off"
        icon="map-pin"
      />
      {loading && <Spinner className="absolute top-2 right-2 size-4" />}
      {error && (
        <p className="text-destructive mt-1 text-sm" role="alert" aria-live="assertive">
          Failed to load suggestions.
        </p>
      )}
      {open && results.length > 0 && !error && (
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          className="bg-background absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded border text-sm shadow"
        >
          {results.map((r: AutocompletePlace, idx: number) => (
            <li key={`${r.latitude}-${r.longitude}`}>
              <Button
                id={`${id}-option-${idx}`}
                role="option"
                type="button"
                variant="listOption"
                aria-selected={active === idx}
                tabIndex={-1}
                onMouseDown={() => handleSelect(r)}
              >
                {r.name}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
