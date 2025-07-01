// src/components/planner/SettingsToggleButton.tsx
"use client";

import React from "react";
import { FaSlidersH } from "react-icons/fa";

/** Reusable animated button that toggles the config sidebar */
export default function SettingsToggleButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      title="Toggle config"
      onClick={onClick}
      className="
        text-xl text-gray-600 hover:text-gray-800
        transition-transform duration-300
        transform hover:scale-110 hover:-rotate-90
      "
    >
      <FaSlidersH />
    </button>
  );
}
