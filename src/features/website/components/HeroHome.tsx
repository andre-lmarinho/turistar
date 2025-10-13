'use client';

import { useEffect, useState } from 'react';
import { Wrapper } from '@/features/website/ui/section/Wrapper';
import Image from 'next/image';
import Link from 'next/link';

export function HeroHome() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * 20 - 10,
        y: Math.random() * 20 - 10,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Wrapper className="py-20 sm:py-24 lg:py-28">
      {/* Left column */}
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="m-auto flex w-full max-w-lg flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="mb-6 text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl">
            Less time planning. More time traveling.
          </h1>
          <p className="mb-6 text-xl">Shape your trip in minutes and keep everything in sync.</p>
          <Link
            href="/signup"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors"
          >
            Start Your Planning
          </Link>
        </div>

        {/* Right column */}
        <div className="flex w-full justify-center lg:justify-end">
          <Image
            src="/images/home/hero_.webp"
            alt="Illustration of a traveler planning a trip"
            width={800}
            height={600}
            className="h-auto w-full max-w-[420px] select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: 'transform 5s ease-in-out',
            }}
            priority
          />
        </div>
      </div>
    </Wrapper>
  );
}
