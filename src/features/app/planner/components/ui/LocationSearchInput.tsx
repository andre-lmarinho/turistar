'use client';

import React from 'react';

import { SuggestionCombobox, type SuggestionOption } from '@/shared/ui/input';

import { useDebounce } from '@/features/app/planner/hooks/search/useDebounce';

import type { AutocompletePlace, PlaceSelection } from '@/features/app/planner/types/locations';
import type { LocationAutocompleteHook } from '@/features/app/planner/hooks/search/createLocationAutocompleteHook';

interface LocationSearchInputProps {
  value: string;
  onChange: (val: string | PlaceSelection<AutocompletePlace>) => void;
  id?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  latitude?: number;
  longitude?: number;
  autocompleteHook: LocationAutocompleteHook;
  onFocus?: () => void;
}

export function LocationSearchInput({
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
  onFocus: onFocusProp,
}: LocationSearchInputProps) {
  const debounced = useDebounce(value);

  const [open, setOpen] = React.useState(false);

  const { results, loading, error } = autocompleteHook(debounced, {
    enabled: open,
    latitude,
    longitude,
  });

  const options = React.useMemo(() => {
    return results.map((place: AutocompletePlace, idx: number) => ({
      id: place.placeId ?? `${place.latitude}-${place.longitude}-${idx}`,
      label: place.name,
      value: place,
    }));
  }, [results]);

  const mapOptionToSelection = React.useCallback(
    (option: SuggestionOption<AutocompletePlace>): PlaceSelection<AutocompletePlace> => ({
      id: option.id,
      placeId: option.value.placeId,
      name: option.value.name,
      formatted: option.value.formatted ?? option.value.name,
      description: option.value.description,
      category: option.value.category,
      latitude: option.value.latitude,
      longitude: option.value.longitude,
      raw: option.value,
      source: 'location',
    }),
    []
  );

  return (
    <SuggestionCombobox<AutocompletePlace, PlaceSelection<AutocompletePlace>>
      id={id}
      label={label}
      placeholder={placeholder}
      value={value}
      open={open}
      onOpenChange={setOpen}
      onInputChange={(next) => onChange(next)}
      options={options}
      onSelect={(selection) => onChange(selection)}
      mapOptionToSelection={mapOptionToSelection}
      loading={loading}
      error={error ? 'Failed to load suggestions.' : undefined}
      emptyMessage="No suggestions found."
      className={className}
      inputClassName={
        inputClassName ??
        'bg-background focus:ring-primary flex w-full items-center justify-between space-x-4 rounded-md border px-4 py-2 text-sm transition focus:ring-2 focus:outline-none'
      }
      onInputFocus={onFocusProp}
    />
  );
}

export type { LocationAutocompleteHook };
