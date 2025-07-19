// src/components/EmptyPlannerHint.tsx
'use client';

import React from 'react';

export default function EmptyPlannerHint() {
  return (
    <div className="fixed pointer-events-none inset-0 flex items-center justify-center text-foreground">
      <p className="text-4xl font-architects-daughter max-w-[300px] mb-2 rounded bg-card/80 px-4 py-2">
        Start by adding a new adventure
      </p>
    </div>
  );
}
