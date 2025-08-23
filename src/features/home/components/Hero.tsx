// src/features/home/components/Hero.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/shared/ui';
import PlanForm from './PlanForm';

export default function Hero() {
  return (
    <section className="hero relative overflow-hidden p-8 pt-[184px] sm:pt-[92px] md:h-auto md:pt-24 lg:pt-28">
      <div className="relative container flex flex-col pt-20">
        <div className="relative z-10 flex flex-col-reverse items-center gap-10 lg:flex-row lg:items-start">
          <div className="flex w-full items-start gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            <div className="flex-1 pb-[5dvh] lg:pb-[15dvh]">
              <h1 className="font-title text-foreground pb-6 text-[32px] leading-[0.9] font-semibold tracking-tight sm:text-[40px] md:text-[56px] lg:text-[72px] xl:text-[84px]">
                The App for
                <br />
                your travel.
              </h1>
              <p className="sm:text-15 mt-6 max-w-[705px] pb-4 text-lg leading-tight tracking-tight sm:mt-3 sm:max-w-lg lg:mt-5">
                Escape the clutter and chaos. Organize and plan your adventure from anywhere.
              </p>
              <PlanForm />
            </div>
          </div>
          {/* Mascot */}
          <div className="absolute right-[10%] bottom-0 w-[40%] max-w-[280px] min-w-[100px] lg:right-[20%] lg:w-[36%] lg:max-w-[420px]">
            <Image
              src="/images/mascot_1_.webp"
              alt=""
              role="presentation"
              aria-hidden
              width={800}
              height={600}
              className="h-auto w-full -scale-x-100 transform"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
