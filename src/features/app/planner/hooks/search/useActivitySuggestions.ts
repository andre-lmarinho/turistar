'use client';

import { createGeoapifySuggestionHook } from '@/features/app/planner/hooks/search/createGeoapifySuggestionHook';
import type { ActivitySuggestion } from '@/features/app/planner/types/locations';

export const useActivitySuggestions = createGeoapifySuggestionHook<ActivitySuggestion>({
  endpoint: '/api/places/search',
  queryKeyPrefix: 'planner-activity-suggestions',
  paramName: 'name',
});
