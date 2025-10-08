'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { usePointerDragScroll } from '@/features/home/hooks/usePointerDragScroll';
import { useSyncedPointerCarousels } from '@/features/home/hooks/useSyncedPointerCarousels';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';

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
  const content = (
    <>
      <h3 className="pb-4 text-xl font-medium md:leading-[1.2]">{feature.title}</h3>
      <p>{feature.description}</p>
    </>
  );

  return (
    <Button
      type="button"
      variant="featureCard"
      onClick={interactive ? onSelect : undefined}
      aria-pressed={isActive}
      aria-disabled={!interactive}
      tabIndex={interactive ? 0 : -1}
    >
      {content}
    </Button>
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
          <Button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            variant="featureCarouselDot"
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
    <>
      <style jsx global>
        {GLOBAL_CAROUSEL_STYLES}
      </style>
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
    </>
  );
}
