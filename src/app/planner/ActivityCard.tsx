"use client";

import React from "react";
import { FaRegClock, FaHourglassHalf } from "react-icons/fa";
import type { Activity } from "@/types/itinerary";

/**
 * UI-only card for an activity already on the board.
 * Later we’ll add onClick / pop-up logic.
 */
interface ActivityCardProps {
  activity: Activity & {
    /** ISO time the user plans to start, e.g. "09:30" */
    startTime?: string;
    /** Duration in minutes (already on Activity, but keep explicit) */
    duration: number;
  };
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const { title, startTime = "– –", duration } = activity;

  return (
    <div className="flex flex-col rounded-lg border shadow-sm bg-white overflow-hidden">
      {/* image placeholder */}
      <img
        src="https://placehold.co/600x300"
        alt={title}
        className="h-32 p-2 w-full rounded-lg object-cover"
      />

      {/* title */}
      <h4 className="px-3 pt-3 pb-2 font-medium border-b">{title}</h4>

      {/* schedule + duration */}
    <div className="flex justify-between items-center gap-2 px-3 py-2 text-sm">
    {/* start time */}
    <span className="inline-flex items-center gap-1 px-2 py-1">
        <FaRegClock />
        {startTime}
    </span>

    {/* divider */}
    <span className="w-px h-4 bg-gray-300 mx-1" />

    {/* duration */}
    <span className="inline-flex items-center gap-1 px-2 py-1">
        <FaHourglassHalf />
        ~{duration} min
    </span>
    </div>
    </div>
  );
}
