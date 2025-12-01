'use client';

'use client';

import React from 'react';
import type { ActivitySuggestion } from '@/features/app/planner/types/activitySuggestion';

interface ActivitySuggestionsPanelProps {
  suggestions: ActivitySuggestion[];
  loading: boolean;
  error: boolean;
  onSelect: (suggestion: ActivitySuggestion) => void;
}

export function ActivitySuggestionsPanel({
  suggestions,
  loading,
  error,
  onSelect,
}: ActivitySuggestionsPanelProps) {
  return (
    <div className="w-full rounded border border-border bg-background shadow-lg">
      {loading && (
        <p className="px-3 py-2 text-xs text-muted-foreground">Looking for matches…</p>
      )}
      {error && (
        <p className="px-3 py-2 text-xs text-destructive">Failed to load suggestions.</p>
      )}
      {!loading && !error && suggestions.length === 0 && (
        <p className="px-3 py-2 text-xs text-muted-foreground">Try a different name.</p>
      )}
      {!loading && suggestions.length > 0 && (
        <ul className="divide-y divide-border max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId}>
              <button
                type="button"
                className="w-full px-3 py-3 text-left text-sm transition hover:bg-accent/40"
                onClick={() => onSelect(suggestion)}
              >
                <p className="text-sm font-semibold text-foreground">{suggestion.name}</p>
                <p className="text-[13px] text-muted-foreground">{suggestion.formatted}</p>
                {suggestion.category && (
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {suggestion.category}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
