// src/components/planner/ActivityCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { FaRegClock, FaHourglassHalf } from "react-icons/fa";
import type { Activity } from "@/types/itinerary";

/**
 * Card shown inside DayColumn.
 * - Becomes **clickable** via `onSelect` (opens edit-modal).
 * - Renders a colour strip at the left if `activity.color` is set.
 */
interface ActivityCardProps {
  activity: Activity & {
    startTime?: string;  // e.g. "09:30"
    duration: number;    // minutes
  };
  onSelect?: () => void; // optional click handler
}

export default function ActivityCard({ activity, onSelect }: ActivityCardProps) {
  const { title, startTime = "– –", duration, color } = activity;

  /* Tailwind class (e.g. "bg-sky-500") OR inline hex style */
  const twBg = color && !color.startsWith("#") ? color : undefined;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full text-left flex items-stretch rounded-lg border
        shadow-sm bg-white overflow-hidden hover:shadow-md transition
        cursor-pointer"
    >
    {/* main content */}
    <div className={`flex-1 flex flex-col ${twBg ?? ""}`}>
      {/* image */}
      <Image
        src="https://placehold.co/600x300"
        alt={title}
        width={400}
        height={200}
        unoptimized
        className="h-32 p-2 w-full object-cover"
      />

      {/* title */}
      <h4 className="px-3 pt-3 pb-2 font-medium border-b">{title}</h4>

        {/* schedule + duration */}
        <div className="flex justify-between items-center gap-2 px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-1 px-2 py-1">
            <FaRegClock />
            {startTime}
          </span>

          <span className="w-px h-4 bg-gray-300 mx-1" />

          <span className="inline-flex items-center gap-1 px-2 py-1">
            <FaHourglassHalf />
            ~{duration} min
          </span>
        </div>
      </div>
    </button>
  );
}
