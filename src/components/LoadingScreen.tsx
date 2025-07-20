// src/components/LoadingScreen.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Spinner } from '@/components';

interface LoadingScreenProps {
  text?: string;
}

export default function LoadingScreen({ text = 'Loading…' }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)]"
    >
      {/* Mascot */}
      <div className="relative w-32 h-32 mb-6">
        <Image src="/images/mascot_1_.webp" alt="" fill className="object-contain" priority />
      </div>
      {/* Text */}
      <div role="status" aria-live="polite" className="flex items-center gap-2 text-lg">
        <Spinner className="size-6" aria-hidden="true" />
        <span>{text}</span>
      </div>
    </div>
  );
}
