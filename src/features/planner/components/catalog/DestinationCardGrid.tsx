// src/components/planner/catalog/DestinationCardGrid.tsx
'use client';

import React from 'react';
import { DestinationCard } from '@/features/planner';
import type { CatalogActivity } from '@/shared/types';

interface Props {
  items: CatalogActivity[]; // catalog data
  addedIds: Set<string>;
  onAdd: (a: CatalogActivity) => void;
  onRemove: (id: string) => void;
}

/**
 * Grid to display catalog items (CatalogActivity).
 * - Receives catalog items.
 * - Decides whether to show "Add" or "Remove" button based on addedIds.
 */
export default function DestinationCardGrid({ items, addedIds, onAdd, onRemove }: Props) {
  return (
    <ul
      aria-label="List of activities"
      className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] justify-start gap-4"
    >
      {items.map((item) => {
        const isAdded = addedIds.has(item.id);

        return (
          <DestinationCard
            key={item.id}
            id={item.id}
            name={item.name}
            imageUrl={item.imageUrl}
            description={item.description}
            category={item.category}
            rating={item.rating}
            added={isAdded}
            onAdd={() => onAdd(item)}
            onRemove={() => onRemove(item.id)}
          />
        );
      })}
    </ul>
  );
}
