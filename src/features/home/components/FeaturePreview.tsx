// src/features/home/components/FeaturePreview.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/utils';

type Feature = { title: string; description: string; imgSrc: string };

const features: Feature[] = [
  {
    title: 'Smart planning.',
    description:
      'Create a complete travel itinerary based on your selected dates - no templates, just flexibility.',
    imgSrc: '/previews/preview_01.png',
  },
  {
    title: 'Interactive map view.',
    description: 'See all your planned locations mapped out for better spatial awareness.',
    imgSrc: '/previews/preview_05.png',
  },
  {
    title: 'Budget tracking.',
    description:
      'Edit and manage your expenses in a dedicated panel - keep it organized, day by day.',
    imgSrc: '/images/placeholder.png',
  },
];

// largura visual do “espaço” entre slides (sem afetar layout/medidas)
const SLIDE_GAP_REM = 1; // 1rem ~ 16px

function scrollToChild(
  el: HTMLUListElement,
  idx: number,
  opts: { smooth?: boolean; disableSnap?: boolean } = {}
) {
  const { smooth = true, disableSnap = true } = opts;
  const target = el.children[idx] as HTMLElement | undefined;
  if (!target) return;

  if (disableSnap) el.classList.add('no-snap');
  el.scrollTo({ left: target.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });

  if (disableSnap) {
    let raf: number | null = null;
    let last = -1;
    const tick = () => {
      const cur = el.scrollLeft;
      if (Math.abs(cur - last) < 0.5) {
        el.classList.remove('no-snap');
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        return;
      }
      last = cur;
      raf = requestAnimationFrame(tick);
    };
    tick();
  }
}

function usePointerDragScroll(
  ref: React.RefObject<HTMLUListElement | null>,
  opts?: {
    onRelease?: (nearestIndex: number) => void;
    onDragStart?: () => void;
    onScrollPreview?: (nearestIndex: number) => void;
  }
) {
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const nearestIndex = () => {
      const items = Array.from(el.children) as HTMLElement[];
      if (!items.length) return 0;
      const center = el.scrollLeft + el.clientWidth / 2;
      let i = 0,
        best = Infinity;
      items.forEach((it, idx) => {
        const c = it.offsetLeft + it.offsetWidth / 2;
        const d = Math.abs(center - c);
        if (d < best) {
          best = d;
          i = idx;
        }
      });
      return i;
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      draggingRef.current = true;
      el.setPointerCapture?.(e.pointerId);
      startXRef.current = e.clientX;
      startScrollRef.current = el.scrollLeft;
      el.classList.add('is-dragging');
      opts?.onDragStart?.();
    };

    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      el.scrollLeft = startScrollRef.current - (e.clientX - startXRef.current);
      opts?.onScrollPreview?.(nearestIndex());
    };

    const up = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      try {
        el.releasePointerCapture?.(e.pointerId);
      } catch {}
      el.classList.remove('is-dragging');

      const idx = nearestIndex();
      scrollToChild(el, idx, { smooth: true, disableSnap: true });
      opts?.onRelease?.(idx);
    };

    el.addEventListener('pointerdown', down, { passive: false });
    el.addEventListener('pointermove', move, { passive: false });
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('pointerleave', up);
    };
  }, [ref, opts]);
}

function FeatureCard({
  feature,
  isActive,
  onClick,
  asButton = true,
}: {
  feature: Feature;
  isActive: boolean;
  onClick?: () => void;
  asButton?: boolean;
}) {
  const desktopShadow = isActive
    ? 'md:[box-shadow:rgba(9,30,66,0.15)_0px_0.5rem_1rem_0px]'
    : 'md:[box-shadow:none]';

  const barClasses = cn(
    'before:content-[""] before:w-[6px] before:bg-primary md:before:bg-transparent',
    isActive && 'md:before:bg-primary'
  );

  const classes = cn(
    'feature-card relative w-full rounded p-6 text-left overflow-hidden',
    'before:absolute before:inset-y-0 before:left-0',
    barClasses,
    // foco só via teclado
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60 focus-visible:outline-offset-0',
    'transition-[transform,box-shadow,background-color] duration-200 ease-out',
    'cursor-pointer',
    desktopShadow
  );

  const content = (
    <p className="sm:text-15 leading-snug font-light md:leading-[1.2]">
      <span className="font-medium">{feature.title} </span>
      {feature.description}
    </p>
  );

  return asButton ? (
    <button type="button" onClick={onClick} aria-pressed={isActive} className={classes}>
      {content}
    </button>
  ) : (
    <div tabIndex={0} role="button" className={classes}>
      {content}
    </div>
  );
}

function NavDots({
  total,
  current,
  onSelect,
  className,
}: {
  total: number;
  current: number;
  onSelect: (idx: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              'h-2 cursor-pointer rounded-full transition-[width] duration-200 ease-out',
              active
                ? 'w-[3.75rem] bg-[var(--muted-foreground)]'
                : 'w-2 bg-[var(--card-foreground)]'
            )}
            aria-label={`Ir para slide ${i + 1}`}
            aria-current={active ? 'true' : 'false'}
          />
        );
      })}
    </div>
  );
}

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
            {/* Desktop: lista clicável */}
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

            {/* Mobile/tablet: slides 100% SEM gap/margem/padding no slide/trilho */}
            <ul
              ref={cardsRef}
              className="no-scrollbar m-0 flex w-full cursor-pointer snap-x snap-proximity overflow-x-auto p-0 md:hidden"
            >
              {features.map((f, idx) => (
                <li key={f.title} className="relative min-w-full shrink-0 basis-full snap-start">
                  <FeatureCard feature={f} isActive={idx === activeIdx} asButton={false} />
                  {/* separador visual à direita (não muda largura) */}
                  {idx < features.length - 1 && (
                    <span
                      aria-hidden
                      className="bg-background pointer-events-none absolute top-0 right-0 h-full"
                      style={{ width: `${SLIDE_GAP_REM}rem` }}
                    />
                  )}
                </li>
              ))}
            </ul>

            {/* Mobile: dots abaixo dos cards */}
            <NavDots
              total={features.length}
              current={activeIdx}
              onSelect={handleSelect}
              className="mt-4 justify-center md:hidden"
            />
          </div>

          {/* Imagens */}
          <div className="order-1 md:order-2 md:col-span-2">
            {/* Desktop: dots acima da imagem, à direita */}
            <NavDots
              total={features.length}
              current={activeIdx}
              onSelect={handleSelect}
              className="mb-3 hidden justify-end md:flex"
            />

            {/* Carrossel de imagens 100% + separador absoluto (sem alterar largura) */}
            <ul
              ref={imagesRef}
              tabIndex={-1}
              aria-hidden="true"
              className="no-scrollbar m-0 flex w-full cursor-grab [touch-action:pan-y] snap-x snap-proximity overflow-x-auto p-0"
            >
              {features.map((f, idx) => (
                <li key={f.title} className="relative min-w-full shrink-0 basis-full snap-start">
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
                  {/* separador visual à direita (não muda largura) */}
                  {idx < features.length - 1 && (
                    <span
                      aria-hidden
                      className="bg-background pointer-events-none absolute top-0 right-0 h-full"
                      style={{ width: `${SLIDE_GAP_REM}rem` }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .is-dragging {
          user-select: none;
          scroll-snap-type: none !important;
          scroll-behavior: auto !important;
        }
        .no-snap {
          scroll-snap-type: none !important;
        }
        .cursor-grab {
          cursor: grab;
          cursor: -webkit-grab;
        }
        .is-dragging.cursor-grab,
        ul.is-dragging {
          cursor: grabbing !important;
          cursor: -webkit-grabbing !important;
        }
      `}</style>
    </section>
  );
}
