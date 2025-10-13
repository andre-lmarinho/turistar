'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { useIsDesktop } from '@/shared/hooks/ui/useIsDesktop';
import { usePointerDragScroll } from '@/shared/hooks/ui/usePointerDragScroll';
import { useSyncedPointerCarousels } from '@/shared/hooks/ui/useSyncedPointerCarousels';

import { FeatureCarouselCard } from './FeatureCarouselCard';
import { FeatureCarouselNavDots } from './FeatureCarouselNavDots';
import './FeatureCarousel.module.css';

export type FeatureCarouselFeature = {
  title: string;
  description: string;
  imgSrc: string;
};

export type FeatureCarouselProps = {
  features: FeatureCarouselFeature[];
};

const CARD_LIST_CLASSES =
  'scrollbar-hidden m-0 flex w-full snap-x snap-proximity gap-4 overflow-x-auto p-0 cursor-grab [touch-action:pan-y] md:flex-col md:gap-4 md:overflow-visible md:cursor-auto md:[touch-action:auto] md:snap-none';

const CARD_ITEM_CLASSES = 'min-w-full shrink-0 basis-full snap-start md:min-w-0 md:basis-auto';

const IMAGE_LIST_CLASSES =
  'scrollbar-hidden m-0 flex w-full cursor-grab [touch-action:pan-y] snap-x snap-proximity gap-4 overflow-x-auto p-0';

const IMAGE_ITEM_CLASSES = 'min-w-full shrink-0 basis-full snap-start';

export default function FeatureCarousel({ features }: FeatureCarouselProps) {
  const cardsRef = useRef<HTMLUListElement | null>(null);
  const imagesRef = useRef<HTMLUListElement | null>(null);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const carouselRefs = useMemo(() => [cardsRef, imagesRef] as const, []);
  const { activeIndex, select, scrollHandlers } = useSyncedPointerCarousels(carouselRefs);
  const [cardsHandlers, imagesHandlers] = scrollHandlers;

  const isDesktop = useIsDesktop();
  const interactive = hasMounted && isDesktop;

  usePointerDragScroll(cardsRef, cardsHandlers, !isDesktop);
  usePointerDragScroll(imagesRef, imagesHandlers);

  const previousIsDesktopRef = useRef(isDesktop);
  useEffect(() => {
    if (!hasMounted) return;

    const previousIsDesktop = previousIsDesktopRef.current;
    if (previousIsDesktop === isDesktop) return;

    previousIsDesktopRef.current = isDesktop;

    if (!cardsRef.current || !imagesRef.current) return;

    select(activeIndex);
  }, [activeIndex, hasMounted, isDesktop, select]);

  const handleCardSelect = useCallback(
    (index: number) => {
      if (!interactive) return;
      select(index);
    },
    [interactive, select]
  );

  const handleDotSelect = useCallback(
    (index: number) => {
      select(index);
    },
    [select]
  );

  return (
    <div className="flex flex-col gap-8 md:gap-3">
      <FeatureCarouselNavDots
        total={features.length}
        current={activeIndex}
        onSelect={handleDotSelect}
        className="order-2 justify-center md:order-1 md:justify-end md:self-end"
      />
      <div className="order-1 flex flex-col gap-8 md:order-2 md:grid md:grid-cols-3 md:gap-8">
        <div className="order-2 md:order-none">
          <ul ref={cardsRef} className={CARD_LIST_CLASSES}>
            {features.map((feature, index) => (
              <li key={feature.title} className={CARD_ITEM_CLASSES}>
                <FeatureCarouselCard
                  feature={feature}
                  isActive={index === activeIndex}
                  interactive={interactive}
                  onSelect={() => handleCardSelect(index)}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 overflow-hidden md:order-none md:col-span-2">
          <ul ref={imagesRef} tabIndex={-1} aria-hidden="true" className={IMAGE_LIST_CLASSES}>
            {features.map((feature, index) => (
              <li key={feature.title} className={IMAGE_ITEM_CLASSES}>
                <div className="select-none">
                  <Image
                    src={feature.imgSrc}
                    alt=""
                    role="presentation"
                    width={1600}
                    height={900}
                    className="block h-auto w-full overflow-hidden rounded-xl object-contain"
                    priority={index === activeIndex}
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export { FeatureCarouselCard } from './FeatureCarouselCard';
export type { FeatureCarouselCardProps } from './FeatureCarouselCard';
export { FeatureCarouselNavDots } from './FeatureCarouselNavDots';
export type { FeatureCarouselNavDotsProps } from './FeatureCarouselNavDots';
