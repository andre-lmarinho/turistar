// src/components/planner/ActivityCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaRegClock, FaHourglassHalf } from 'react-icons/fa';
import type { Activity } from '@/types/itinerary';
import { EMPTY_ACTIVITY_TITLE } from '@/constants/ui';

/**
 * Card shown inside DayColumn.
 * - Becomes **clickable** via `onSelect` (opens edit-modal).
 * - Renders a colour strip at the left if `activity.color` is set.
 */
interface ActivityCardProps {
  activity: Activity & {
    startTime?: string; // e.g. "09:30"
    duration: number; // h
    imageUrl?: string;
  };
  onSelect?: () => void; // optional click handler
}

export default function ActivityCard({ activity, onSelect }: ActivityCardProps) {
  const { title, startTime, duration, color, imageUrl } = activity;

  /* Tailwind class (e.g. "bg-sky-500") OR inline hex style */
  const twBg = color && !color.startsWith('#') ? color : undefined;

  /*
   * Prevents hydration mismatch by ensuring this section only renders on the client side.
   * Next.js can render inconsistent initial markup between server and client for dynamic values.
   * This guard ensures the conditional content is only rendered after the component is mounted in the browser.
   */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  /* ========================================================================================================== */

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full text-left flex items-stretch rounded-lg border
        shadow-sm bg-white overflow-hidden hover:shadow-md transition
        cursor-pointer"
    >
      {/* main content */}
      <div className={`flex-1 flex flex-col ${twBg ?? ''}`}>
        {/* image */}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={200}
            unoptimized
            className="h-32 p-2 w-full object-cover"
          />
        )}

        {/* title */}
        <h4 className="px-3 pt-3 pb-2 font-medium border-b">
          {title.trim() ? title : EMPTY_ACTIVITY_TITLE}
        </h4>

        {/* Conditionally render schedule and duration only if at least one exists */}
        {isMounted && (startTime?.trim() || duration > 0) && (
          <div className="flex justify-between items-center gap-2 px-3 py-2 text-sm">
            {/* Conditionally render start time */}
            {startTime?.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-1">
                <FaRegClock />
                {startTime}
              </span>
            )}

            {/* Separator only if both elements exist */}
            {startTime?.trim() && duration && duration > 0 && (
              <span className="w-px h-4 bg-gray-300 mx-1" />
            )}

            {/* Conditionally render duration */}
            {duration > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1">
                <FaHourglassHalf />~{duration} min
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
