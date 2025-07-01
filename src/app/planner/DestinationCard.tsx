import React from "react";
import { FaClock, FaCheck } from "react-icons/fa";

interface DestinationCardProps {
  id: string;
  title: string;
  duration: number;     // minutes
  price: string;
  description: string;
  added: boolean;       // ← new
  onAdd: () => void;
}

export default function DestinationCard({
  id,
  title,
  duration,
  price,
  description,
  added,
  onAdd,
}: DestinationCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow p-4">
      {/* img placeholder */}
      <img
        src="https://placehold.co/400x200"
        alt={title}
        className="w-full h-40 object-cover rounded-md mb-4"
      />

      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      <div className="flex items-center text-sm text-gray-600 mb-2 space-x-2">
        <span className="flex items-center">
          <FaClock className="mr-1" />
          {duration} min
        </span>
        <span>|</span>
        <span>{price}</span>
      </div>

      <p className="text-sm text-gray-700 flex-1 mb-4">{description}</p>

      {added ? (
        /* Already in planner – show green check */
        <button
          disabled
          className="mt-auto px-4 py-2 bg-green-100 text-green-700 rounded flex items-center justify-center gap-1 cursor-default"
        >
          <FaCheck />
          Added
        </button>
      ) : (
        /* Add-to-planner action */
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
