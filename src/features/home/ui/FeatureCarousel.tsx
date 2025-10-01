'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { usePointerDragScroll } from '@/features/home/hooks/usePointerDragScroll';
import { useSyncedPointerCarousels } from '@/features/home/hooks/useSyncedPointerCarousels';
import { cn } from '@/shared/utils/utils';

export type FeatureCarouselFeature = {
  title: string;
  description: string;
  imgSrc: string;
};

export type FeatureCarouselProps = {
  features: FeatureCarouselFeature[];
};

const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

const GLOBAL_CAROUSEL_STYLES = `
  .is-dragging {
    user-select: none;
    scroll-snap-type: none !important;
    scroll-behavior: auto !important;
    cursor: grabbing !important;
  }

  .no-snap {
    scroll-snap-type: none !important;
  }
`;

const CARD_LIST_CLASSES =
  'scrollbar-hidden m-0 flex w-full snap-x snap-proximity gap-4 overflow-x-auto p-0 cursor-grab [touch-action:pan-y] md:flex-col md:gap-4 md:overflow-visible md:cursor-auto md:[touch-action:auto] md:snap-none';

const CARD_ITEM_CLASSES = 'min-w-full shrink-0 basis-full snap-start md:min-w-0 md:basis-auto';

const IMAGE_LIST_CLASSES =
  'scrollbar-hidden m-0 flex w-full cursor-grab [touch-action:pan-y] snap-x snap-proximity gap-4 overflow-x-auto p-0';

const IMAGE_ITEM_CLASSES = 'min-w-full shrink-0 basis-full snap-start';

function useIsDesktop(query: string = DESKTOP_MEDIA_QUERY) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    mediaQuery.addListener(handleChange);
    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, [query]);

  return matches;
}

type FeatureCarouselCardProps = {
  feature: FeatureCarouselFeature;
  isActive: boolean;
  interactive: boolean;
  onSelect?: () => void;
};

function FeatureCarouselCard({
  feature,
  isActive,
  interactive,
  onSelect,
}: FeatureCarouselCardProps) {
  const cardClassName = cn(
    'relative w-full overflow-hidden rounded p-6 text-left',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60 focus-visible:outline-offset-0',
    'transition-[transform,box-shadow,background-color] duration-200 ease-out',
    'cursor-default md:cursor-pointer',
    'pointer-events-none md:pointer-events-auto',
    isActive ? 'md:[box-shadow:rgba(9,30,66,0.15)_0px_0.5rem_1rem_0px]' : 'md:[box-shadow:none]',
    'before:absolute before:inset-y-0 before:left-0 before:w-[6px]',
    'before:bg-primary before:content-[""] before:opacity-100',
    'before:transition-opacity before:duration-200 before:ease-out',
    isActive ? 'md:before:bg-primary md:before:opacity-100' : 'md:before:opacity-0'
  );

  const content = (
    <>
      <h3 className="pb-4 text-xl font-medium md:leading-[1.2]">{feature.title}</h3>
      <p>{feature.description}</p>
    </>
  );

  return (
    <button
      type="button"
      onClick={interactive ? onSelect : undefined}
      aria-pressed={interactive ? isActive : undefined}
      aria-disabled={!interactive}
      tabIndex={interactive ? 0 : -1}
      className={cardClassName}
    >
      {content}
    </button>
  );
}

type FeatureCarouselNavDotsProps = {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  className?: string;
};

function FeatureCarouselNavDots({
  total,
  current,
  onSelect,
  className,
}: FeatureCarouselNavDotsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              'h-2 cursor-pointer rounded-full transition-[width] duration-200 ease-out',
              isActive ? 'w-[3.75rem] bg-[var(--secondary)]' : 'w-2 bg-[var(--card-foreground)]'
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={isActive ? 'true' : 'false'}
          />
        );
      })}
    </div>
  );
}

export default function FeatureCarousel({ features }: FeatureCarouselProps) {
  const cardsRef = useRef<HTMLUListElement | null>(null);
  const imagesRef = useRef<HTMLUListElement | null>(null);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const carouselRefs = useMemo(() => [cardsRef, imagesRef], [cardsRef, imagesRef]);
  const { activeIndex, select, scrollHandlers } = useSyncedPointerCarousels(carouselRefs);
  const [cardsHandlers, imagesHandlers] = scrollHandlers;

  const isDesktop = useIsDesktop();
  const interactive = hasMounted && isDesktop;

  usePointerDragScroll(cardsRef, cardsHandlers, !isDesktop);
  usePointerDragScroll(imagesRef, imagesHandlers);

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
    <>
      <style jsx global>
        {GLOBAL_CAROUSEL_STYLES}
      </style>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="order-2 md:order-1">
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

          <FeatureCarouselNavDots
            total={features.length}
            current={activeIndex}
            onSelect={handleDotSelect}
            className="mt-4 justify-center md:hidden"
          />
        </div>

        <div className="order-1 md:order-2 md:col-span-2">
          <FeatureCarouselNavDots
            total={features.length}
            current={activeIndex}
            onSelect={handleDotSelect}
            className="mb-3 hidden justify-end md:flex"
          />
          <div className="overflow-hidden">
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
    </>
  );
}
