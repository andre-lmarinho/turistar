// src/components/planner/RemoveCardButton.tsx
"use client";

import React from "react";
import { FaTrashAlt } from "react-icons/fa";

/**
 * Floating round-red button used by cards that are already in the planner.
 * Caller decides placement via `className`.
 */
export default function RemoveCardButton({
  onClick,
  title = "Remove from planner",
  className = "",
}: {
  onClick: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`
        p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition
        ${className}
      `}
    >
      <FaTrashAlt size={12} />
    </button>
  );
}
