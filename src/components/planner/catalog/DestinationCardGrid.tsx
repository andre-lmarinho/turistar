// src/components/planner/catalog/DestinationCardGrid.tsx
'use client';

import React from 'react';
import DestinationCard from '@/components/planner/catalog/DestinationCard';
import { omit } from '@/utils/omit';
import type { Activity } from '@/types/itinerary';

/* Raw JSON shape coming from the filter panel */
export interface RawActivity {
  id: string;
  name: string;
  duration: number;
  price: string;
  description: string;
}

interface Props {
  items: RawActivity[];
  addedIds: Set<string>;
  onAdd: (a: Activity) => void;
  onRemove: (id: string) => void;
}

/**
 * Renders a responsive grid of DestinationCard components.
 * Decides per-card whether we call onAdd or onRemove based on `addedIds`.
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
            title={item.name}
            duration={item.duration}
            price={item.price}
            description={item.description}
            added={isAdded}
            onAdd={() =>
              onAdd({
                ...omit(item, 'price', 'name'),
                title: item.name,
              } as Activity)
            }
            onRemove={() => onRemove(item.id)}
          />
        );
      })}
    </div>
  );
}
