import "server-only";
import { NextResponse } from "next/server";
import type { AutocompletePlace } from "../types";
import { MIN_SEARCH_LENGTH } from "../types";

export function validateGeoapifyQuery(params: URLSearchParams, key: string) {
  const value = params.get(key)?.trim();
  if (!value) return NextResponse.json({ error: "Query is required." }, { status: 400 });
  if (value.length < MIN_SEARCH_LENGTH) {
    return NextResponse.json(
      { error: `Query must be at least ${MIN_SEARCH_LENGTH} characters.` },
      { status: 400 }
    );
  }
  return value;
}

export function readGeoapifyCoordinates(params: URLSearchParams) {
  function coordinate(key: string) {
    const value = params.get(key)?.trim();
    return value && Number.isFinite(Number(value)) ? Number(value) : undefined;
  }
  return { lat: coordinate("lat"), lon: coordinate("lon") };
}

interface Place {
  place_id?: string | number;
  name?: string;
  formatted?: string;
  lat: number;
  lon: number;
  country?: string;
  country_code?: string;
  result_type?: string;
  category?: string;
  description?: string;
  wiki_and_media?: { wikidata?: string };
}

async function request(path: string, params: URLSearchParams) {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error(`Geoapify ${path}: missing GEOAPIFY_KEY`);
  params.set("apiKey", key);
  const response = await fetch(`https://api.geoapify.com/${path}?${params}`, {
    cache: "force-cache",
    next: { revalidate: 86400 },
  });
  if (!response.ok) throw new Error(`Geoapify ${path}: HTTP ${response.status}`);
  const body: { results?: Place[]; features?: { properties: Place }[] } = await response.json();
  return body.results ?? body.features?.map((f) => f.properties) ?? [];
}

const destinations = ["city", "state", "country"];
const addresses = [
  "building",
  "street",
  "amenity",
  "suburb",
  "neighbourhood",
  "district",
  "quarter",
  "locality",
  "village",
  "hamlet",
];

async function suggestions(
  text: string,
  lat?: number,
  lon?: number,
  priority?: string[]
): Promise<AutocompletePlace[]> {
  if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_E2E === "1") return [];
  const params = new URLSearchParams({ text, format: "json", limit: priority ? "5" : "6" });
  if (lat != null && lon != null) params.set("bias", `proximity:${lon},${lat}`);
  const places = await request(`v1/geocode/${priority ? "autocomplete" : "search"}`, params);
  const ranked = priority
    ? places
        .filter((p) => priority.includes(p.result_type ?? ""))
        .sort((a, b) => priority.indexOf(a.result_type ?? "") - priority.indexOf(b.result_type ?? ""))
    : places;
  return ranked
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
    .map((p) => ({
      name: (priority ? (p.formatted ?? p.name) : (p.name ?? p.formatted)) ?? text,
      formatted: p.formatted,
      latitude: p.lat,
      longitude: p.lon,
      placeId: p.place_id == null ? undefined : String(p.place_id),
      country: p.country,
      countryCode: p.country_code,
      category: p.category,
      description: p.description,
    }));
}

export const fetchGeoapifyAutocomplete = (text: string, lat?: number, lon?: number) =>
  suggestions(text, lat, lon, destinations);
export const fetchGeoapifyAddressAutocomplete = (text: string, lat?: number, lon?: number) =>
  suggestions(text, lat, lon, addresses);
export const fetchGeoapifyPlaceSearch = (text: string, lat?: number, lon?: number) =>
  suggestions(text, lat, lon);

export async function fetchGeoapifyPlaceDetails(placeId: string) {
  const [place] = await request("v2/place-details", new URLSearchParams({ id: placeId, format: "json" }));
  if (!place) throw new Error(`Geoapify place-details: no place for ${placeId}`);
  return {
    formatted: place.formatted,
    description: place.description,
    wikidataId: place.wiki_and_media?.wikidata,
  };
}
