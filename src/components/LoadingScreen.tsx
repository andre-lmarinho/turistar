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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)]">
      <div className="relative w-32 h-32 mb-6">
        <Image src="/images/mascot_1_.webp" alt="Mascot" fill className="object-contain" priority />
      </div>
      <div className="flex items-center gap-2 text-lg">
        <Spinner className="size-6" />
        <span>{text}</span>
      </div>
    </div>
  );
}
