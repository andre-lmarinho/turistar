// src/components/planner/catalog/DestinationCardGrid.tsx
'use client';

import React from 'react';
import DestinationCard from '@/components/planner/catalog/DestinationCard';
import type { CatalogActivity } from '@/types/itinerary';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const isAdded = addedIds.has(item.id);

        return (
          <DestinationCard
            key={item.id}
            id={item.id}
            name={item.name}
            duration={item.duration}
            image_url={item.image_url}
            price={item.price}
            description={item.description}
            category={item.category}
            added={isAdded}
            onAdd={() => onAdd(item)}
            onRemove={() => onRemove(item.id)}
          />
        );
      })}
    </div>
  );
}
