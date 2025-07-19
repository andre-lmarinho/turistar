// src/components/planner/EmptyPlannerHint.tsx
'use client';

import React, { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import ReactDOM from 'react-dom';

interface EmptyPlannerHintProps {
  targetRef: RefObject<HTMLButtonElement | null>;
}

export default function EmptyPlannerHint({ targetRef }: EmptyPlannerHintProps) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const btn = targetRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setCoords({ x: rect.left + rect.width / 2, y: rect.top });
  }, [targetRef]);

  if (!coords) return null;

  return ReactDOM.createPortal(
    <>
      <div
        className="fixed z-50 flex flex-col items-center pointer-events-none -translate-x-1/2 -translate-y-full font-[var(--font-architects-daughter)]"
        style={{ left: coords.x, top: coords.y }}
      >
        <div className="mb-2 rounded bg-card/80 px-4 py-2">Start by adding a new adventure</div>
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <path d="M95.439.247C86.56..." fill="none" stroke="currentColor" />
        </svg>
      </div>
    </>,
    document.body
  );
}
