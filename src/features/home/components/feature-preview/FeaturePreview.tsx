// src/features/home/components/feature-preview/FeaturePreview.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { scrollToChild } from '@/shared/utils';
import { usePointerDragScroll } from '@/shared/hooks/ui';
import FeatureCard from './FeatureCard';
import NavDots from './NavDots';
import { features } from './data/features';
import './styles.css';

export default function FeaturePreview() {
  const [activeIdx, setActiveIdx] = useState(0);

  const cardsRef = useRef<HTMLUListElement | null>(null);
  const imagesRef = useRef<HTMLUListElement | null>(null);

  const controllerRef = useRef<'cards' | 'images' | null>(null);

  usePointerDragScroll(cardsRef, {
    onDragStart: () => {
      controllerRef.current = 'cards';
    },
    onScrollPreview: (i) => {
      if (controllerRef.current === 'cards') setActiveIdx(i);
    },
    onRelease: (i) => {
      controllerRef.current = null;
      setActiveIdx(i);
    },
  });

  usePointerDragScroll(imagesRef, {
    onDragStart: () => {
      controllerRef.current = 'images';
    },
    onScrollPreview: (i) => {
      if (controllerRef.current === 'images') setActiveIdx(i);
    },
    onRelease: (i) => {
      controllerRef.current = null;
      setActiveIdx(i);
    },
  });

  useEffect(() => {
    const cards = cardsRef.current;
    const imgs = imagesRef.current;
    if (controllerRef.current !== 'cards' && cards) {
      scrollToChild(cards, activeIdx, { smooth: true, disableSnap: true });
    }
    if (controllerRef.current !== 'images' && imgs) {
      scrollToChild(imgs, activeIdx, { smooth: true, disableSnap: true });
    }
  }, [activeIdx]);

  const handleSelect = (idx: number) => setActiveIdx(idx);

  return (
    <section className="p-8 pt-40 sm:pt-16 md:pt-24 lg:pt-32">
      <div className="container md:max-w-3xl lg:max-w-[960px]">
        <h2 className="font-title text-foreground pb-6 text-[32px] leading-[0.9] font-semibold sm:text-[40px] md:text-[56px] lg:text-[72px] xl:text-[84px]">
          What can you do?
        </h2>
        <p className="mt-6 max-w-[705px] leading-tight sm:mt-3 sm:max-w-lg lg:mt-5">
          Turistar is a personal project focused on clean architecture, drag-and-drop logic, and
          real-world UX.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Cards */}
          <div className="order-2 md:order-1">
            {/* Desktop: clickable list */}
            <ul className="hidden flex-col gap-4 md:flex">
              {features.map((f, idx) => (
                <li key={f.title}>
                  <FeatureCard
                    feature={f}
                    isActive={idx === activeIdx}
                    onClick={() => handleSelect(idx)}
                  />
                </li>
              ))}
            </ul>

            {/* Mobile/tablet: full-width slides with gap */}
            <ul
              ref={cardsRef}
              className="no-scrollbar m-0 flex w-full cursor-pointer snap-x snap-proximity gap-4 overflow-x-auto p-0 md:hidden"
            >
              {features.map((f, idx) => (
                <li key={f.title} className="min-w-full shrink-0 basis-full snap-start">
                  <FeatureCard feature={f} isActive={idx === activeIdx} asButton={false} />
                </li>
              ))}
            </ul>

            {/* Mobile: dots below the cards */}
            <NavDots
              total={features.length}
              current={activeIdx}
              onSelect={handleSelect}
              className="mt-4 justify-center md:hidden"
            />
          </div>

          {/* Images */}
          <div className="order-1 md:order-2 md:col-span-2">
            {/* Desktop: dots above the image to the right */}
            <NavDots
              total={features.length}
              current={activeIdx}
              onSelect={handleSelect}
              className="mb-3 hidden justify-end md:flex"
            />

            {/* Image carousel with full width and gap */}
            <ul
              ref={imagesRef}
              tabIndex={-1}
              aria-hidden="true"
              className="no-scrollbar m-0 flex w-full cursor-grab [touch-action:pan-y] snap-x snap-proximity gap-4 overflow-x-auto p-0"
            >
              {features.map((f, idx) => (
                <li key={f.title} className="min-w-full shrink-0 basis-full snap-start">
                  <div className="pointer-events-none select-none">
                    <Image
                      src={f.imgSrc}
                      alt=""
                      role="presentation"
                      width={1600}
                      height={900}
                      className="block h-auto w-full rounded-xl object-contain"
                      priority={idx === activeIdx}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
