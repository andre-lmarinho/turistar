// src/components/planner/DestinationCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { FaClock, FaCheck } from 'react-icons/fa';
import RemoveCardButton from '@/components/planner/RemoveCardButton';

/**
 * Card inside DestinationFilterPanel.
 * - When not added  → primary button “Add to Planner”.
 * - When already added  → green “Added” button **and** a trash icon in
 *   the top-left corner so the user can remove quickly.
 */
interface DestinationCardProps {
  id: string;
  title: string;
  duration: number;
  price: string;
  description: string;
  added: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export default function DestinationCard({
  title,
  duration,
  price,
  description,
  added,
  onAdd,
  onRemove,
}: DestinationCardProps) {
  return (
    <div className="relative flex flex-col bg-white rounded-lg shadow p-4 transition-transform duration-200 hover:-translate-y-1">
      {/* quick-remove icon (only when added) */}
      {added && <RemoveCardButton onClick={onRemove} className="absolute -left-2 -top-2" />}

      {/* placeholder image */}
      <Image
        src="https://placehold.co/400x200"
        alt={title}
        width={400}
        height={200}
        unoptimized
        className="w-full h-40 object-cover rounded-md mb-4"
      />

      {/* title */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* duration | price chips */}
      <div className="flex items-center text-sm text-gray-600 mb-2 space-x-2">
        <span className="flex items-center gap-1">
          <FaClock /> {duration} min
        </span>
        <span>|</span>
        <span>{price}</span>
      </div>

      {/* description */}
      <p className="text-sm text-gray-700 flex-1 mb-4">{description}</p>

      {/* action button */}
      {added ? (
        <button
          onClick={onRemove}
          className="mt-auto px-4 py-2 bg-green-100 text-green-700 rounded flex items-center justify-center gap-1 hover:bg-green-200"
        >
          <FaCheck />
          Added
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add to Planner
        </button>
      )}
    </div>
  );
}
