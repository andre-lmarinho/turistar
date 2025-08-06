// src/components/planner/catalog/DestinationResultsList.tsx
'use client';

import React from 'react';
import { Spinner, DestinationCardGrid } from '@/components';
import type { CatalogActivity } from '@/shared/types';

interface DestinationResultsListProps {
  loading: boolean;
  error: string | null;
  items: CatalogActivity[];
  addedIds: Set<string>;
  onAdd: (a: CatalogActivity) => void;
  onRemove: (id: string) => void;
}

export default function DestinationResultsList({
  loading,
  error,
  items,
  addedIds,
  onAdd,
  onRemove,
}: DestinationResultsListProps) {
  return (
    <div className="flex-1 p-4">
      {loading && (
        <div className="flex items-center gap-2">
          <Spinner />
          <span>Loading catalog...</span>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <DestinationCardGrid items={items} addedIds={addedIds} onAdd={onAdd} onRemove={onRemove} />
      )}
    </div>
  );
}
