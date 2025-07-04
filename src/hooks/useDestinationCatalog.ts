// src/hooks/useDestinationCatalog.ts
import { useState, useEffect, useMemo } from 'react';
import type { SortMode } from '@/components/planner/catalog/SortSelector';

interface RawActivity {
  id: string;
  name: string;
  type: string[];
  category: string;
  duration: number;
  lat: number;
  lng: number;
  price: string;
  tags: string[];
  description: string;
  imageUrl?: string;
}

export function useDestinationCatalog(isOpen: boolean, city = 'salvador') {
  const [items, setItems] = useState<RawActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>('A-Z');

  // Fetch
  useEffect(() => {
    if (!isOpen || items.length > 0) return;

    setLoading(true);
    setError(null);

    fetch(`/api/itinerary?dest=${city}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { activities: RawActivity[] }) => setItems(data.activities))
      .catch(() => setError('Failed to load catalog.'))
      .finally(() => setLoading(false));
  }, [isOpen, city, items.length]);

  // Filtered & Sorted Items
  const visibleItems = useMemo(() => {
    const filtered =
      activeCats.size === 0 ? items : items.filter((it) => activeCats.has(it.category));

    return [...filtered].sort((a, b) => {
      switch (sortMode) {
        case 'Price':
          return a.price.localeCompare(b.price);
        case 'Duration':
          return a.duration - b.duration;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [items, activeCats, sortMode]);

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);

  const toggleCat = (cat: string) =>
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  return { visibleItems, categories, sortMode, setSortMode, toggleCat, loading, error };
}
