"use client";

import type { ActivitySuggestion } from "../types";
import { createGeoapifySuggestionHook } from "./createGeoapifySuggestionHook";

export const useActivitySuggestions = createGeoapifySuggestionHook<ActivitySuggestion>({
  endpoint: "/api/places/search",
  queryKeyPrefix: "planner-activity-suggestions",
  paramName: "name",
});
