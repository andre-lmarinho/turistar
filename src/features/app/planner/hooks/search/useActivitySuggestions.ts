import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/features/app/planner/hooks/search/useDebounce';
import type { ActivitySuggestion } from '@/features/app/planner/types/activitySuggestion';

interface ActivitySuggestionOptions {
  enabled?: boolean;
  latitude?: number;
  longitude?: number;
}

export function useActivitySuggestions(
  query: string,
  options: ActivitySuggestionOptions = {}
): {
  suggestions: ActivitySuggestion[];
  loading: boolean;
  error: boolean;
} {
  const debouncedQuery = useDebounce(query);
  const trimmedQuery = debouncedQuery.trim();
  const isEnabled = (options.enabled ?? true) && trimmedQuery.length >= 3;

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'planner-activity-suggestions',
      trimmedQuery,
      options.latitude,
      options.longitude,
    ],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ name: trimmedQuery });
      if (options.latitude != null && options.longitude != null) {
        params.set('lat', String(options.latitude));
        params.set('lon', String(options.longitude));
      }
      const requestUrl = `/api/places/search?${params.toString()}`;
      const res = await fetch(requestUrl, signal ? { signal } : undefined);
      if (!res.ok) {
        throw new Error('Failed to load activity suggestions');
      }
      const body = await res.json();
      return (body.results ?? []) as ActivitySuggestion[];
    },
    enabled: isEnabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  return {
    suggestions: data ?? [],
    loading: isLoading,
    error: isError,
  };
}
