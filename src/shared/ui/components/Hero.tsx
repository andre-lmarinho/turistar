'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/shared/ui/button';

export default function Hero() {
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
    <section className="relative mx-auto w-full max-w-screen-lg overflow-hidden px-6 pt-24 sm:pt-28 lg:pt-32">
      {/* Left column */}
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="m-auto flex w-full max-w-lg flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="mb-6 text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl">
            Less time planning. More time traveling.
          </h1>
          <p className="mb-6 text-xl">Shape your trip in minutes and keep everything in sync.</p>
          <Button asChild>
            <Link href="/signup">Start Your Planning</Link>
          </Button>
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
    </section>
  );
}
