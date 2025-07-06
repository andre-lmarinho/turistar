// src/components/planner/catalog/DestinationCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import RemoveCardButton from '@/components/ui/IcoRemoveCard';
import BtnDestinationAction from '@/components/ui/BtnDestinationAction';
import type { CatalogActivity } from '@/types/itinerary';

/**
 * Card inside DestinationFilterPanel.
 * - When not added  → primary button “Add to Planner”.
 * - When already added  → green “Added” button **and** a trash icon in
 *   the top-left corner so the user can remove quickly.
 *
 * Uses CatalogActivity data structure (raw catalog items).
 */
interface DestinationCardProps extends CatalogActivity {
  added: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export default function DestinationCard({
  name,
  image_url,
  duration,
  price,
  description,
  added,
  onAdd,
  onRemove,
}: DestinationCardProps) {
  return (
    <div className="relative flex flex-col bg-[var(--card)] text-[var(--card-foreground)] rounded-lg shadow p-4 transition-transform duration-200 hover:-translate-y-1 border border-[var(--border)]">
      {/* quick-remove icon (only when added) */}
      <div className="absolute left-2 top-2">
        {added && <RemoveCardButton onClick={onRemove} />}
      </div>

      {/* Image */}
      <Image
        src={image_url || 'https://placehold.co/400x200'}
        alt={name}
        width={400}
        height={200}
        unoptimized
        className="w-full h-40 object-cover rounded-md mb-4 border border-[var(--border)]"
      />

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{name}</h3>

      {/* Duration | Price chips */}
      <div className="flex items-center text-sm text-[var(--muted-foreground)] mb-2 space-x-2">
        <span className="flex items-center gap-1">
          <Clock /> {duration} min
        </span>
        <span>|</span>
        <span>{price}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--foreground)] flex-1 mb-4">{description}</p>

      {/* Action button */}
      <BtnDestinationAction added={added} onAdd={onAdd} onRemove={onRemove} />
    </div>
  );
}
