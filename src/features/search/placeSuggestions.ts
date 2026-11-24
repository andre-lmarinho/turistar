import type { AutocompletePlace, PlaceSearch } from "./types";

export async function fetchPlaceSuggestions(
  source: PlaceSearch,
  query: string,
  signal: AbortSignal,
  latitude?: number,
  longitude?: number
): Promise<AutocompletePlace[]> {
  const params = new URLSearchParams({ [source === "search" ? "name" : "text"]: query });
  if (latitude != null && longitude != null) {
    params.set("lat", String(latitude));
    params.set("lon", String(longitude));
  }
  const response = await fetch(`/api/places/${source}?${params}`, { signal });
  if (!response.ok) throw new Error(`Place suggestions (${source}) failed: HTTP ${response.status}`);
  const body: { results: AutocompletePlace[] } = await response.json();
  return body.results;
}
