"use client";

import React from "react";
import type { SuggestionOption } from "@/features/search/components/SuggestionCombobox";
import type { SuggestionHook } from "@/features/search/hooks/createGeoapifySuggestionHook";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

function useDebounce<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

interface UseSearchInputOptions<T> {
  hook: SuggestionHook<T>;
  value: string;
  latitude?: number;
  longitude?: number;
  mapResult: (result: T, index: number) => SuggestionOption<T>;
}

interface UseSearchInputResult<T> {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  options: SuggestionOption<T>[];
  loading: boolean;
  error: boolean;
}

export function useSearchInput<T>({
  hook,
  value,
  latitude,
  longitude,
  mapResult,
}: UseSearchInputOptions<T>): UseSearchInputResult<T> {
  const [open, setOpen] = React.useState(false);
  const debounced = useDebounce(value);
  const currentQuery = value.trim();
  const canSearch = currentQuery.length >= MIN_QUERY_LENGTH;
  const openState = open && canSearch && currentQuery === debounced.trim();

  const { results, loading, error } = hook(debounced, {
    enabled: openState,
    latitude,
    longitude,
  });

  const options = React.useMemo(() => {
    return results.map(mapResult);
  }, [results, mapResult]);

  return { open: openState, setOpen, options, loading, error };
}
