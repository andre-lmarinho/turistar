// src/components/planner/Icon - SettingsToggle.tsx
'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/** Reusable animated button that toggles the config sidebar */
export default function SettingsToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      title="Toggle config"
      onClick={onClick}
      variant="ghost"
      className="text-xl bg-background text-gray-600 hover:text-gray-800 transform transition-transform duration-300 hover:scale-110 hover:-rotate-90"
    >
      <Sliders />
    </Button>
  );
}
