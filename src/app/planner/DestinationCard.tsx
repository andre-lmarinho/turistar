// src/app/planner/DestinationCard.tsx
"use client";

import React from "react";
import { FaClock, FaCheck } from "react-icons/fa";

interface DestinationCardProps {
  id: string;
  title: string;
  duration: number;   // minutes
  price: string;
  description: string;
  added: boolean;     // true → already on the board
  onAdd: () => void;  // callback to add
}

/**
 * A searchable / selectable activity card shown in DestinationFilterPanel.
 * Shows placeholder image, title, chips, description, and conditional button.
 */
export default function DestinationCard({
  title,
  duration,
  price,
  description,
  added,
  onAdd,
}: DestinationCardProps) {
  return (
    <div
      className="
        flex flex-col bg-white rounded-lg shadow p-4
        transition-transform duration-200 hover:-translate-y-1
      "
    >
      {/* placeholder image (swap later with real imageUrl) */}
      <img
        src="https://placehold.co/400x200"
        alt={title}
        className="w-full h-40 object-cover rounded-md mb-4"
      />

      {/* title */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* chips: duration | price */}
      <div className="flex items-center text-sm text-gray-600 mb-2 space-x-2">
        <span className="flex items-center gap-1">
          <FaClock />
          {duration} min
        </span>
        <span>|</span>
        <span>{price}</span>
      </div>

      {/* description */}
      <p className="text-sm text-gray-700 flex-1 mb-4">{description}</p>

      {/* action button */}
      {added ? (
        /* Already on planner → disabled green state */
        <button
          disabled
          className="mt-auto px-4 py-2 bg-green-100 text-green-700 rounded flex items-center justify-center gap-1 cursor-default"
        >
          <FaCheck />
          Added
        </button>
      ) : (
        /* Add to planner */
        <button
          onClick={onAdd}
          className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add to Planner
        </button>
      )}
    </div>
  );
}
