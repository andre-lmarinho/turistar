// src/components/OnboardingCarousel.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import type { Transition } from 'framer-motion';
import Image from 'next/image';
import { ONBOARDING_STEPS } from '@/constants';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingCarouselProps {
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
  onFinish?: () => void;
}

const GAP = 16;
const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const SPRING_OPTIONS: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export default function OnboardingCarousel({
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
  onFinish,
}: OnboardingCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerHeight = (baseWidth * 16) / 9;
  const itemWidth = baseWidth - 16 * 2;
  const itemHeight = (itemWidth * 16) / 9;
  const trackItemOffset = itemWidth + GAP;
  const steps = loop ? [...ONBOARDING_STEPS, ONBOARDING_STEPS[0]] : ONBOARDING_STEPS;

  // hover to pause
  useEffect(() => {
    if (!pauseOnHover || !containerRef.current) return;
    const el = containerRef.current;
    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [pauseOnHover]);

  // autoplay
  useEffect(() => {
    if (!autoplay || (pauseOnHover && isHovered)) return;
    const timer = setInterval(() => {
      if (currentIndex === steps.length - 1) {
        loop ? setCurrentIndex((prev) => prev + 1) : onFinish?.();
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, autoplayDelay);
    return () => clearInterval(timer);
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    pauseOnHover,
    loop,
    steps.length,
    currentIndex,
    onFinish,
  ]);

  // loop reset
  const handleAnimationComplete = () => {
    if (loop && currentIndex === steps.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  // drag end logic
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD) {
      if (currentIndex === steps.length - 1) {
        onFinish?.();
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } else if (offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  // numeric constraints
  const dragProps = loop
    ? {}
    : { dragConstraints: { left: -trackItemOffset * (steps.length - 1), right: 0 } };

  const effectiveTransition: Transition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Onboarding steps"
      tabIndex={0}
      className={`relative overflow-hidden p-4 ${
        round ? 'rounded-full border border-background' : 'rounded-md border'
      }`}
      style={{ width: `${baseWidth}px`, height: `${containerHeight}px` }}
    >
      {/* Previous */}
      <button
        onClick={() => (currentIndex === 0 ? null : setCurrentIndex((prev) => prev - 1))}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 p-2 rounded-full bg-card hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Previous step"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Draggable track */}
      <motion.div
        className="flex cursor-grab active:cursor-grabbing"
        drag="x"
        {...dragProps}
        style={{
          x,
          gap: GAP,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
        }}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onDragEnd={handleDragEnd}
        onAnimationComplete={handleAnimationComplete}
      >
        {steps.map((step, idx) => {
          const range = [
            -(idx + 1) * trackItemOffset,
            -idx * trackItemOffset,
            -(idx - 1) * trackItemOffset,
          ];
          const rotateY = useTransform(x, range, [90, 0, -90], { clamp: false });
          return (
            <motion.div
              key={idx}
              className={`relative shrink-0 flex flex-col bg-card ${
                round
                  ? 'items-center justify-center text-center border-0'
                  : 'items-start justify-between rounded-lg'
              } overflow-hidden`}
              style={{
                width: `${itemWidth}px`,
                height: `${itemHeight}px`,
                rotateY,
                ...(round ? { borderRadius: '50%' } : {}),
              }}
              transition={effectiveTransition}
            >
              <div className={`${round ? 'p-0 m-0' : 'p-5 mb-4 h-full'}`}>
                <div className="relative w-full h-[70%] flex-none">
                  <Image src={step.image} alt={step.title} fill className="object-cover" />
                </div>
                <div className="flex-1 mt-2">
                  <h3 className="font-semibold mb-1 text-foreground">{step.title}</h3>
                  <p className="text-sm text-foreground">{step.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Next */}
      <button
        onClick={() => {
          if (currentIndex === steps.length - 1) onFinish?.();
          else setCurrentIndex((prev) => prev + 1);
        }}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 p-2 rounded-full bg-card hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Next step"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div
        role="tablist"
        aria-label="Slide navigation"
        className={`flex w-full justify-center ${
          round ? 'absolute bottom-4 left-1/2 -translate-x-1/2 z-20' : 'mt-4'
        }`}
      >
        <div className="flex gap-2">
          {ONBOARDING_STEPS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={currentIndex % ONBOARDING_STEPS.length === i}
              tabIndex={currentIndex % ONBOARDING_STEPS.length === i ? 0 : -1}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 w-2 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-primary ${
                currentIndex % ONBOARDING_STEPS.length === i
                  ? 'scale-125 bg-primary'
                  : 'bg-[rgba(255,255,255,1)]'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
