// src/features/planner/components/catalog/DestinationCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { RemoveCardButton, DestinationActionButton } from '@/shared/ui';
import type { CatalogActivity } from '@/shared/types';

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
  added,
  onAdd,
  onRemove,
}: DestinationCardProps) {
  const titleId = `destination-title-${name.replace(/\s+/g, '-')}`;
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <li
      role="group"
      aria-labelledby={titleId}
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow transition duration-300 hover:shadow-lg"
    >
      <div className="relative">
        {/* Image */}
        <Image
          src={imageUrl ?? '/images/placeholder.png'}
          alt={`Photo of ${name}`}
          width={400}
          height={200}
          className={`h-40 w-full rounded-t object-cover transition-opacity duration-300 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/woAAgMBgLf3OBAAAAAASUVORK5CYII="
          onLoadingComplete={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
          unoptimized={!imageUrl}
        />
        {!imgLoaded && <div className="bg-muted absolute inset-0 z-10 animate-pulse rounded-t" />}
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
        <h3 id={titleId} className="mb-1 font-bold">
          {name}
        </h3>

        {/* Description */}
        {description ? (
          <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">No description available</p>
        )}
      </div>
    </li>
  );
}
