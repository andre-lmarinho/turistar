// src/components/ui/IcoSettingsToggle.tsx
'use client';

import React from 'react';
import { Sliders } from 'lucide-react';

/** Reusable animated button that toggles the config sidebar */
export default function SettingsToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        text-xl group bg-background text-gray-600 hover:text-gray-800
        transition-transform duration-300
        transform hover:scale-110
      "
    >
      {/* Tooltip */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded text-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Settings
      </div>
      <Sliders className="transform transition duration-300 group-hover:scale-105 group-hover:rotate-90" />
    </button>
  );
}
