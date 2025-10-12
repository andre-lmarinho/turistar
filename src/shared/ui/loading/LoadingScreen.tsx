'use client';

import React from 'react';
import Image from 'next/image';
import { Spinner } from '@/shared/ui/icon';

interface LoadingScreenProps {
  text?: string;
}

export default function LoadingScreen({ text = 'Loading…' }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="bg-background/60 fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-lg"
    >
      {/* Mascot */}
      <div className="relative mb-6 h-32 w-32">
        <Image
          src="/images/mascot_1_.webp"
          alt=""
          role="presentation"
          aria-hidden="true"
          fill
          className="object-contain"
          priority
        />
      </div>
      {/* Text */}
      <div role="status" aria-live="polite" className="flex items-center gap-2 text-lg">
        <Spinner className="size-6" aria-hidden="true" />
        <span>{text}</span>
      </div>
    </div>
  );
}
