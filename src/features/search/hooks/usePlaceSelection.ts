"use client";

import { useEffect, useRef } from "react";
import type { AutocompletePlace } from "../types";

export function getPlaceSelectionValues(selection: AutocompletePlace) {
  const name = selection.name.trim();
  const comma = name.indexOf(",");
  const title = (comma > 0 && comma < name.length / 2 ? name.slice(0, comma).trim() : name) || selection.name;
  return {
    title,
    address: selection.formatted || selection.name,
    description: selection.description,
    latitude: selection.latitude,
    longitude: selection.longitude,
    imageUrl: undefined as string | undefined,
  };
}

export function usePlaceSelection() {
  const pending = useRef<AbortController | null>(null);
  const cancelSelection = () => pending.current?.abort();
  useEffect(() => () => pending.current?.abort(), []);

  const selectPlace = async (selection: AutocompletePlace) => {
    cancelSelection();
    const fallback = getPlaceSelectionValues(selection);
    const { placeId } = selection;
    if (!placeId) return fallback;
    const controller = new AbortController();
    pending.current = controller;
    try {
      const response = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body: { details?: { formatted?: string; description?: string }; wikidataImageUrl?: string } =
        await response.json();
      if (controller.signal.aborted) return null;
      return {
        ...fallback,
        address: body.details?.formatted || fallback.address,
        description: body.details?.description || fallback.description,
        imageUrl: body.wikidataImageUrl,
      };
    } catch (error) {
      if (controller.signal.aborted) return null;
      console.warn("Place details lookup failed", { operation: "placeDetails", placeId, error });
      return fallback;
    }
  };

  return { selectPlace, cancelSelection };
}
