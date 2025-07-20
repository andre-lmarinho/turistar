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
  const titleId = `destination-title-${name.replace(/\s+/g, '-')}`;

  return (
    <li
      role="group"
      aria-labelledby={titleId}
      className="bg-[var(--card)] text-[var(--card-foreground)] rounded-lg shadow border border-[var(--border)] hover:shadow-lg transition duration-300"
    >
      <div className="relative">
        {/* Image */}
        <Image
          src={image_url || 'https://placehold.co/400x200'}
          alt={`Photo of ${name}`}
          width={400}
          height={200}
          unoptimized
          className="w-full h-40 object-cover rounded-t"
        />
        {/* quick-remove icon (only when added) */}
        <div className="absolute left-2 top-2">
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
        <h3 id={titleId} className="font-bold mb-2">
          {name}
        </h3>

        {/* Duration | Price chips */}
        <dl className="flex items-center text-sm text-[var(--muted-foreground)] space-x-2 mb-1">
          <dt className="sr-only">Duração</dt>
          <dd>
            <time
              dateTime={`PT${duration}H`}
              aria-label={`${duration} horas`}
              className="flex items-center gap-1"
            >
              <Clock aria-hidden="true" size={12} /> {duration} h
            </time>
          </dd>

          <dt className="sr-only">Preço</dt>
          <dd aria-label={`Preço: ${price}`}>{price}</dd>

          <dt className="sr-only">Avaliação</dt>
          <dd
            aria-label={
              rating != null
                ? `${rating.toFixed(1)} de 5 estrelas, ${reviewcount ?? 0} avaliações`
                : 'Sem avaliação'
            }
          >
            {rating?.toFixed(1) ?? 'N/A'} ⭐ ({reviewcount ?? 0} reviews)
          </dd>
        </dl>

        {/* Description */}
        <p className="text-sm text-[var(--muted-foreground)] flex-1 mb-1">{description}</p>
      </div>
    </li>
  );
}
