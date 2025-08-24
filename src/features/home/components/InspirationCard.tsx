// src/features/home/components/InspirationCard.tsx
'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

const DEFAULT_INTERVAL_MS = 2000;

export type InspirationCardProps = {
  title: string;
  imageUrls: string[];
  intervalMs?: number;
};

export default function InspirationCard({
  title,
  imageUrls,
  intervalMs = DEFAULT_INTERVAL_MS,
}: InspirationCardProps) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);

  const startCycle = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % imageUrls.length);
    }, intervalMs);
  };

  const stopCycle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 30) {
      setIndex((prev) => {
        const next = deltaX < 0 ? prev + 1 : prev - 1;
        return (next + imageUrls.length) % imageUrls.length;
      });
    }
    touchStartX.current = null;
  };

  useEffect(() => () => stopCycle(), []);

  return (
    <div
      tabIndex={0}
      className="block w-56 cursor-pointer rounded-lg border bg-white p-6 text-center shadow-sm transition hover:shadow focus:shadow"
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
      onFocus={startCycle}
      onBlur={stopCycle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Image
        src={imageUrls[index]}
        alt={title}
        width={200}
        height={120}
        className="mx-auto mb-4 h-40 w-full rounded object-cover"
      />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}
