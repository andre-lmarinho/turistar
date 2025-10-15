'use client';

import React from 'react';
import Image from 'next/image';

import { Plus } from '@/shared/ui/icon';

export type TestimonialCardProps = {
  quote: string;
  avatarUrl: string;
  name: string;
  traveledTo: string;
};

export function TestimonialCard({ quote, avatarUrl, name, traveledTo }: TestimonialCardProps) {
  return (
    <div className="relative h-full border p-3">
      <span>
        <Plus aria-hidden className="bg-card text-border absolute -top-3 -left-3 size-6" />
        <Plus aria-hidden className="bg-card text-border absolute -top-3 -right-3 size-6" />
        <Plus aria-hidden className="bg-card text-border absolute -bottom-3 -left-3 size-6" />
        <Plus aria-hidden className="bg-card text-border absolute -right-3 -bottom-3 size-6" />
      </span>
      <div className="border-border bg-background flex h-full w-full flex-col rounded-xl border p-8 text-left shadow-sm">
        <p className="text-foreground text-base leading-relaxed font-bold md:text-lg lg:text-xl">
          {quote}
        </p>

        <div className="mt-auto flex items-end gap-3 pt-12">
          <Image
            src={avatarUrl}
            alt={`Portrait of ${name}`}
            width={40}
            height={40}
            className="size-10 flex-none rounded-lg border object-cover"
          />
          <div className="text-foreground text-sm">
            <p className="font-bold">{name}</p>
            <p>{traveledTo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
