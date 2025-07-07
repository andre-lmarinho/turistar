// src/components/planner/modal/ActivityHeaderCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';

/**
 * Mini-card used in ActivityModal to visualise the POI that
 * the activity refers to (static — not editable here).
 */
export default function ActivityHeaderCard({
  name,
  imageUrl = 'https://placehold.co/600x300', // fallback placeholder
}: {
  name: string;
  imageUrl?: string;
}) {
  return (
    <div className="flex items-center rounded-lg">
      {/* thumbnail */}
      <Image
        src={imageUrl}
        alt={name}
        width={96}
        height={64}
        unoptimized /* using remote placeholder for now */
        className="rounded object-cover w-24 h-16"
      />
    </div>
  );
}
