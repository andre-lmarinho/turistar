// src/components/home/LocationSearch.tsx
'use client';

import { useEffect, useState } from 'react';

interface LocationSearchProps {
  /** Current destination value */
  value: string;
  /** Callback when a destination is chosen */
  onChange: (value: string) => void;
}

interface Suggestion {
  id: string;
  name: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  type: string;
}

export default function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const fetchSuggestions = async () => {
      try {
        const params = new URLSearchParams({
          format: 'json',
          addressdetails: '1',
          limit: '5',
          q: query,
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'travel-planner-app',
          },
        });
        const data: NominatimResult[] = await res.json();
        const filtered = data.filter((item) => ['city', 'state', 'country'].includes(item.type));
        setSuggestions(
          filtered.map((item) => ({ id: String(item.place_id), name: item.display_name }))
        );
      } catch {
        // ignore fetch errors; suggestions list simply stays empty
      }
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [query]);

  function handleSelect(name: string) {
    onChange(name);
    setQuery(name);
    setSuggestions([]);
  }

  return (
    <div className="relative w-full" aria-label="Destination search">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          onChange(val);
        }}
        className="border-input bg-background focus-visible:ring-ring w-full rounded-md border p-2 text-sm shadow-sm outline-none focus-visible:ring-2"
        placeholder="Search city, state or country"
        aria-label="Destination"
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="bg-background absolute top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border p-1 shadow-md">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleSelect(s.name)}
                className="hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1 text-left"
              >
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
