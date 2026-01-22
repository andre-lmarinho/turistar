import { useCallback, useRef } from "react";

import type { Activity } from "@/features/activity/types";
import type { ActivitySuggestion, PlaceSelection } from "@/features/search/types";

function getShortTitle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const commaIndex = trimmed.indexOf(",");
  if (commaIndex > 0 && commaIndex < trimmed.length / 2) {
    return trimmed.substring(0, commaIndex).trim();
  }
  return trimmed;
}

export interface UseSuggestionSelectOptions {
  onSelectSuggestion?: (patch: Partial<Activity>) => void;
  onSuggestionProcessed?: (patch: Partial<Activity>) => void; // For InlineActivity
}

export interface SuggestionData {
  title: string;
  address: string | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
}

export function useSuggestionSelect({
  onSelectSuggestion,
  onSuggestionProcessed,
}: UseSuggestionSelectOptions) {
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const handleSuggestionSelect = useCallback(
    async (selection: PlaceSelection<ActivitySuggestion>): Promise<SuggestionData | null> => {
      // Cancel any in-flight request from a previous selection
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const suggestion: ActivitySuggestion =
        selection.raw ??
        ({
          placeId: selection.placeId ?? "",
          name: selection.name,
          formatted: selection.formatted ?? selection.name,
          addressLine1: undefined,
          addressLine2: undefined,
          latitude: selection.latitude,
          longitude: selection.longitude,
          resultType: undefined,
          category: selection.category,
          description: selection.description,
        } satisfies ActivitySuggestion);

      const rawTitle =
        selection.raw?.name ??
        suggestion.name ??
        selection.name ??
        selection.raw?.addressLine1 ??
        suggestion.addressLine1 ??
        selection.formatted ??
        suggestion.formatted ??
        "";
      const selectedTitle = getShortTitle(rawTitle) || selection.name;

      let selectedAddress = selection.formatted ?? suggestion.formatted;
      let selectedDescription = selection.description ?? suggestion.description;
      let selectedImageUrl: string | undefined;

      const placeId = selection.placeId ?? suggestion.placeId;

      if (placeId) {
        try {
          const response = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`, {
            signal: controller.signal,
          });
          if (controller.signal.aborted) return null;
          if (response.ok) {
            const body = (await response.json()) as {
              details?: { formatted?: string; description?: string };
              wikidataImageUrl?: string;
            };
            if (body.details?.formatted) {
              selectedAddress = body.details.formatted;
            }
            if (body.details?.description) {
              selectedDescription = body.details.description;
            }
            selectedImageUrl = body.wikidataImageUrl ?? undefined;
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return null;
          console.error("Failed to fetch place details:", { placeId, error });
        }
      }

      if (controller.signal.aborted) return null;

      const suggestionData = {
        title: selectedTitle,
        address: selectedAddress,
        latitude: selection.latitude,
        longitude: selection.longitude,
        description: selectedDescription,
        imageUrl: selectedImageUrl,
      };

      // Call onSelectSuggestion callback if provided (for ActivityForm)
      if (onSelectSuggestion) {
        onSelectSuggestion(suggestionData);
      }

      // Call onSuggestionProcessed callback if provided (for InlineActivity)
      if (onSuggestionProcessed) {
        onSuggestionProcessed(suggestionData);
      }

      return suggestionData;
    },
    [onSelectSuggestion, onSuggestionProcessed]
  );

  return { handleSuggestionSelect };
}
