// src/components/planner/CloseButton.tsx
"use client";

import React from "react";

/**
 * Animated “X” close button.
 * On hover: scale 110 % + rotate –90 deg (same as Trivia effect).
 */
export default function CloseButton({
  onClick,
  title = "Close",
}: {
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="
        text-2xl text-gray-500 hover:text-gray-800
        transition-all duration-300
        transform hover:scale-110 hover:-rotate-90
      "
    >
      &times;
    </button>
  );
}
