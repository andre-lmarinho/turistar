// src/app/planner/catalog/CatalogClient.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useActivityCatalog } from '@/hooks/useActivityCatalog';
import { useDnDPlannerContext } from '@/context/DnDPlannerContext';
import { Input } from '@/components/ui/input';

export default function CatalogClient() {
  // Access query params from URL
  const searchParams = useSearchParams();
  const dest = searchParams.get('dest') ?? 'salvador';
  const router = useRouter();

  // Fetch catalog data for destination
  const { data, isLoading, error } = useActivityCatalog(dest);

  // Access planner context to add activities
  const { addActivity } = useDnDPlannerContext();

  // Local search state
  const [query, setQuery] = useState('');

  if (isLoading) return <p className="p-4">Loading…</p>;
  if (error || !data) return <p className="p-4">Failed to load catalog.</p>;

  // Search filter
  const filtered = data.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="p-4 space-y-4">
      <button onClick={() => router.back()} className="text-sm underline">
        ← Back to planner
      </button>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search activities…"
      />

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((act) => (
          <li key={act.id} className="border rounded-md p-4">
            <h3 className="font-semibold">{act.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{act.description}</p>

            <button className="text-xs underline" onClick={() => addActivity(act)}>
              + Add to planner
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
