// src/components/planner/catalog/DestinationCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { RemoveCardButton, DestinationActionButton } from '@/components';
import type { CatalogActivity } from '@/types';

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
  rating,
  reviewcount,
  added,
  onAdd,
  onRemove,
}: DestinationCardProps) {
  return (
    <div className="relative flex flex-col bg-[var(--card)] text-[var(--card-foreground)] rounded shadow p-4 border border-[var(--border)]">
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
        className="w-full h-40 object-cover rounded mb-4"
      />

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{name}</h3>

      {/* Duration | Price chips */}
      <div className="flex items-center text-sm text-[var(--muted-foreground)] mb-2 space-x-2">
        <span className="flex items-center gap-1">
          <Clock size={12} /> {duration} h
        </span>
        <span>|</span>
        <span>{price}</span>
        <span>|</span>
        <p className="text-sm text-gray-600">
          {rating?.toFixed(1) ?? 'N/A'} ⭐ ({reviewcount ?? 0} reviews)
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--foreground)] flex-1 mb-4">{description}</p>

      {/* Action button */}
      <DestinationActionButton added={added} onAdd={onAdd} onRemove={onRemove} />
    </div>
  );
}
