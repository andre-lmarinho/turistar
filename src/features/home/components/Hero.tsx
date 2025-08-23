// src/features/home/components/Hero.tsx
'use client';

import Image from 'next/image';
import PlanForm from './PlanForm';

export default function Hero() {
  return (
    <section className="relative container overflow-hidden px-6 pt-24 sm:pt-28 lg:pt-32">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Coluna esquerda */}
        <div className="flex w-full max-w-2xl flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="mb-6 text-[48px] leading-[1.1] font-semibold tracking-tight md:text-[52px] lg:text-[56px]">
            The App for
            <br />
            your travel.
          </h1>
          <p className="mb-6 text-lg md:text-xl">
            Escape the clutter and chaos. Organize and plan your adventure from anywhere.
          </p>
          <PlanForm />
        </div>

        {/* Coluna direita (Mascote) */}
        <div className="flex w-full justify-center lg:justify-end">
          <Image
            src="/images/mascot_1_.webp"
            alt=""
            aria-hidden="true"
            width={800}
            height={600}
            className="h-auto w-full max-w-[420px] -scale-x-100 select-none"
            priority
          />
        </div>
      </div>
    </section>
  );
}
