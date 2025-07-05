// src/components/planner/dnd/ActivityCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Clock, Hourglass } from 'lucide-react';
import type { Activity } from '@/types/itinerary';
import { EMPTY_ACTIVITY_TITLE } from '@/constants/ui';

/**
 * Card shown inside DayColumn.
 * - Becomes **clickable** via `onSelect` (opens edit-modal).
 * - Renders a colour strip at the left if `activity.color` is set.
 * - Now accepts the core Activity type as is.
 */
interface ActivityCardProps {
  activity: Activity; // The core activity type used across the app
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
        shadow-sm bg-white overflow-hidden hover:shadow-md transition cursor-grab"
    >
      {/* main content */}
      <div className={`flex-1 p-3 flex flex-col ${twBg ?? ''}`}>
        {/* image */}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={200}
            unoptimized
            className="h-30 mb-2 rounded-lg w-full object-cover"
          />
        )}

        {/* title */}
        <h4 className="font-medium">{title.trim() ? title : EMPTY_ACTIVITY_TITLE}</h4>

        {/* Conditionally render schedule and duration only if at least one exists */}
        {isMounted && (startTime?.trim() || duration! > 0) && (
          <div className="flex gap-6 text-sm">
            {/* Conditionally render start time */}
            {startTime?.trim() && (
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {startTime}
              </span>
            )}
            {/* Conditionally render duration */}
            {duration! > 0 && (
              <span className="inline-flex items-center gap-2">
                <Hourglass className="w-4 h-4" />
                {duration}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
