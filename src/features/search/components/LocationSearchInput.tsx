"use client";

import { useTranslations } from "next-intl";

import type { SuggestionHook } from "@/features/search/hooks/createGeoapifySuggestionHook";
import type { AutocompletePlace, PlaceSelection } from "@/features/search/types";

import { useSearchInput } from "../hooks/useSearchInput";
import type { SuggestionOption } from "./SuggestionCombobox";
import { SuggestionCombobox } from "./SuggestionCombobox";

interface LocationSearchInputProps {
  value: string;
  onChange: (val: string | PlaceSelection<AutocompletePlace>) => void;
  id?: string;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  latitude?: number;
  longitude?: number;
  autocompleteHook: SuggestionHook<AutocompletePlace>;
  onFocus?: () => void;
  onBlur?: () => void;
}

const mapResult = (place: AutocompletePlace, idx: number): SuggestionOption<AutocompletePlace> => ({
  id: place.placeId ?? `${place.latitude}-${place.longitude}-${idx}`,
  label: place.name,
  value: place,
});

const mapOptionToSelection = (
  option: SuggestionOption<AutocompletePlace>
): PlaceSelection<AutocompletePlace> => ({
  id: option.id,
  placeId: option.value.placeId,
  name: option.value.name,
  formatted: option.value.formatted ?? option.value.name,
  description: option.value.description,
  category: option.value.category,
  latitude: option.value.latitude,
  longitude: option.value.longitude,
  raw: option.value,
  source: "location",
});

export function LocationSearchInput({
  value,
  onChange,
  id = "location-input",
  placeholder,
  className = "",
  inputClassName,
  latitude,
  longitude,
  autocompleteHook,
  onFocus: onFocusProp,
  onBlur,
}: LocationSearchInputProps) {
  const t = useTranslations();
  const { open, setOpen, options, loading, error } = useSearchInput({
    hook: autocompleteHook,
    value,
    latitude,
    longitude,
    mapResult,
  });

  return (
    <SuggestionCombobox<AutocompletePlace, PlaceSelection<AutocompletePlace>>
      id={id}
      placeholder={placeholder}
      value={value}
      open={open}
      onOpenChange={setOpen}
      onInputChange={(next) => onChange(next)}
      options={options}
      onSelect={(selection) => onChange(selection)}
      mapOptionToSelection={mapOptionToSelection}
      loading={loading}
      error={error ? t("failedToLoadLocations") : undefined}
      emptyMessage={t("noSuggestionsFound")}
      className={className}
      inputClassName={
        inputClassName ??
        "bg-background focus:ring-primary flex w-full items-center justify-between space-x-4 rounded-md border px-4 py-2 text-sm transition focus:ring-2 focus:outline-none"
      }
      onFocus={onFocusProp}
      onBlur={onBlur}
    />
  );
}
