'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { motion } from 'framer-motion';
import type { PanInfo, Transition } from 'framer-motion';

import { TestimonialCard } from './TestimonialCard';
import { TESTIMONIALS } from './Testimonial.copy';

type Testimonial = (typeof TESTIMONIALS)[number];

const GAP = 24;
const AUTO_MS = 4000;

const SPRING: Transition = { type: 'spring', stiffness: 300, damping: 30 };
const JUMP: Transition = { duration: 0 };

function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e?.contentRect?.width ?? 0));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

export function TestimonialCarousel() {
  const { ref: containerRef, width: containerW } = useContainerWidth<HTMLDivElement>();

  const slideW = Math.min(620, Math.max(320, Math.round(containerW * 0.6)));
  const offset = slideW + GAP;

  const base = TESTIMONIALS;
  const n = base.length;
  const steps: Testimonial[] = useMemo(() => [...base, ...base, ...base], [base]);

  const [idx, setIdx] = useState(n);
  const [isJumping, setIsJumping] = useState(false);

  const center = containerW / 2 - slideW / 2;

  useEffect(() => {
    const id = window.setInterval(() => setIdx((p) => p + 1), AUTO_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (idx >= n * 2) {
      setIsJumping(true);
      setIdx((p) => p - n);
    } else if (idx < n) {
      setIsJumping(true);
      setIdx((p) => p + n);
    }
  }, [idx, n]);

  useEffect(() => {
    if (!isJumping) return;
    const raf = requestAnimationFrame(() => setIsJumping(false));
    return () => cancelAnimationFrame(raf);
  }, [isJumping]);

  const trackX = center - idx * offset;
  const transition: Transition = isJumping ? JUMP : SPRING;

  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dx = info.offset.x;
    const vx = info.velocity.x;
    const passed = Math.abs(dx) > offset * 0.25 || Math.abs(vx) > 350;
    if (!passed) return;
    if (dx < 0 || vx < -350) setIdx((p) => p + 1);
    else setIdx((p) => p - 1);
  };

  const ready = containerW > 0;
  const dragLeft = ready ? center - (steps.length - 1) * offset : 0;
  const dragRight = ready ? center : 0;

  return (
    <div
      ref={containerRef}
      className="w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
    >
      <motion.div
        className="grid"
        style={{ gridAutoFlow: 'column', gridAutoColumns: `${slideW}px`, gap: GAP }}
        drag="x"
        dragConstraints={{ left: dragLeft, right: dragRight }}
        dragElastic={0.2}
        onDragEnd={onDragEnd}
        initial={false}
        animate={{ x: ready ? trackX : 0 }}
        transition={transition}
      >
        {steps.map((t, i) => {
          const dRaw = Math.abs(i - idx);
          const d = Math.min(dRaw, Math.abs(i - (idx + n)), Math.abs(i - (idx - n)));
          const cls = d === 0 ? 'opacity-100' : d === 1 ? 'opacity-60' : 'opacity-30';
          return (
            <div
              key={`${i}-${t.name}`}
              onClick={() => setIdx(i)}
              className={`h-full cursor-pointer transition-opacity duration-300 ${cls}`}
            >
              <TestimonialCard
                quote={t.quote}
                avatarUrl={t.avatarUrl}
                name={t.name}
                traveledTo={t.traveledTo}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
