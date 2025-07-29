// src/components/planner/catalog/DestinationCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
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
  imageUrl,
  description,
  rating,
  added,
  onAdd,
  onRemove,
}: DestinationCardProps) {
  const titleId = `destination-title-${name.replace(/\s+/g, '-')}`;

  return (
    <li
      role="group"
      aria-labelledby={titleId}
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow transition duration-300 hover:shadow-lg"
    >
      <div className="relative">
        {/* Image */}
        <Image
          src={imageUrl || 'https://placehold.co/400x200'}
          alt={`Photo of ${name}`}
          width={400}
          height={200}
          unoptimized
          className="h-40 w-full rounded-t object-cover"
        />
        {/* quick-remove icon (only when added) */}
        <div className="absolute top-2 left-2">
          {added && <RemoveCardButton aria-label={`Remove ${name}`} onClick={onRemove} />}
        </div>
        {/* Action button */}
        <div className="absolute right-2 bottom-2">
          <DestinationActionButton
            aria-pressed={added}
            aria-label={added ? `Remove ${name}` : `Add ${name}`}
            added={added}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </div>
      </div>

      <div className="p-2 leading-tight">
        {/* Title */}
        <h3 id={titleId} className="mb-2 font-bold">
          {name}
        </h3>

        {/* Duration | Price chips */}
        <dl className="mb-1 flex items-center space-x-2 text-sm text-[var(--muted-foreground)]">
          <dt className="sr-only">Avaliação</dt>
          <dd aria-label={rating != null ? `${rating.toFixed(1)} de 5 stars, ` : 'Sem avaliação'}>
            {rating?.toFixed(1) ?? 'N/A'} 
          </dd>
        </dl>
        {description && <p className="text-sm text-[var(--muted-foreground)]">{description}</p>}
      </div>
    </li>
  );
}
