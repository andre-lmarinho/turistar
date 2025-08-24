// src/features/home/components/Hero.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import PlanForm from './PlanForm';
import { Button, CloseButton, Modal } from '@/shared/ui';

export default function Hero() {
  const [open, setOpen] = useState(false);
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
  const openForm = () => setOpen(true);
  const closeForm = () => setOpen(false);
  return (
    <section className="relative mx-auto w-full max-w-screen-lg overflow-hidden px-6 pt-24 sm:pt-28 lg:pt-32">
      {/* Left column */}
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="m-auto flex w-full max-w-lg flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="mb-6 text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl">
            Less time planning. More time traveling.
          </h1>
          <p className="mb-6 text-lg md:text-xl">
            Shape your trip in minutes and keep everything in sync.
          </p>
          <Button onClick={openForm}>Start Your Planning</Button>
        </div>

        {/* Right column */}
        <div className="flex w-full justify-center lg:justify-end">
          <Image
            src="/images/home/hero_.webp"
            alt=""
            aria-hidden="true"
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

      <Modal
        open={open}
        onClose={closeForm}
        overlayClassName="backdrop-overlay"
        wrapperClassName="fixed inset-0 z-50 flex items-center justify-center p-4 max-w-100 px-10 py-8 m-auto"
        className="w-full max-w-md p-6"
      >
        <div className="flex w-full justify-end">
          <CloseButton onClick={closeForm} />
        </div>
        <PlanForm />
      </Modal>
    </section>
  );
}
