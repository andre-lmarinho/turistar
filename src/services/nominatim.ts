// src/services/nominatim.ts

export interface CitySuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    country: string;
    [key: string]: string | undefined;
  };
}

/**
 * Fetch city-name suggestions from Nominatim (OpenStreetMap).
 */
export async function fetchCitySuggestions(
  term: string,
  limit: number = 5
): Promise<CitySuggestion[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', term); // general text query
  url.searchParams.set('format', 'jsonv2'); // JSON v2 to include 'address'
  url.searchParams.set('addressdetails', '1'); // include address object
  url.searchParams.set('limit', limit.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
  return res.json();
}
