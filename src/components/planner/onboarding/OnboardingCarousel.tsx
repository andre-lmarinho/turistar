// src/components/planner/onboarding/OnboardingCarousel.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import type { Transition, MotionValue } from 'framer-motion';
import Image from 'next/image';
import { ONBOARDING_STEPS } from '@/constants';
import { NavCircleButton } from '@/components';

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

/**
 * Single slide: calls useTransform at its top level
 */
function Slide({
  step,
  idx,
  x,
  trackItemOffset,
  itemWidth,
  itemHeight,
  effectiveTransition,
  round,
}: {
  step: (typeof ONBOARDING_STEPS)[number];
  idx: number;
  x: MotionValue<number>;
  trackItemOffset: number;
  itemWidth: number;
  itemHeight: number;
  effectiveTransition: Transition;
  round: boolean;
}) {
  // Hook call at top level of component
  const rotateY = useTransform(
    x,
    [-(idx + 1) * trackItemOffset, -idx * trackItemOffset, -(idx - 1) * trackItemOffset],
    [90, 0, -90],
    { clamp: false }
  );

  return (
    <motion.div
      className={`bg-card relative flex shrink-0 flex-col border ${
        round
          ? 'items-center justify-center border-0 text-center'
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
      <div className={round ? 'm-0 p-0' : 'mb-4 h-full p-5'}>
        <div className="relative h-[70%] w-full flex-none">
          <Image src={step.image} alt={step.title} fill className="object-cover" />
        </div>
        <div className="mt-2 flex-1">
          <h3 className="text-foreground mb-1 text-3xl font-semibold">{step.title}</h3>
          <p className="text-foreground text-[1.2rem]">{step.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

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
  // explicitly type x as a MotionValue<number>
  const x = useMotionValue<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerHeight = (baseWidth * 16) / 9;
  const itemWidth = baseWidth - GAP * 2;
  const itemHeight = (itemWidth * 16) / 9;
  const trackItemOffset = itemWidth + GAP;
  const steps = loop ? [...ONBOARDING_STEPS, ONBOARDING_STEPS[0]] : ONBOARDING_STEPS;

  // hover to pause autoplay
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

  // autoplay logic
  useEffect(() => {
    if (!autoplay || (pauseOnHover && isHovered)) return;
    const timer = setInterval(() => {
      if (currentIndex === steps.length - 1) {
        loop ? setCurrentIndex((p) => p + 1) : onFinish?.();
      } else {
        setCurrentIndex((p) => p + 1);
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

  // reset loop to start
  const handleAnimationComplete = () => {
    if (loop && currentIndex === steps.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  // drag end behavior
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD) {
      if (currentIndex === steps.length - 1) onFinish?.();
      else setCurrentIndex((p) => p + 1);
    } else if (offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD) {
      setCurrentIndex((p) => Math.max(p - 1, 0));
    }
  };

  // numeric constraints for drag
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
      className="relative overflow-hidden"
      style={{ width: `${baseWidth}px`, height: `${containerHeight}px` }}
    >
      {/* Previous button */}
      {currentIndex !== 0 && (
        <NavCircleButton
          direction="left"
          onClick={() => setCurrentIndex((p) => p - 1)}
          aria-label="Previous step"
          className="absolute top-1/2 left-2 z-20 -translate-y-1/2"
        />
      )}

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
        {steps.map((step, idx) => (
          <Slide
            key={idx}
            step={step}
            idx={idx}
            x={x}
            trackItemOffset={trackItemOffset}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            effectiveTransition={effectiveTransition}
            round={round}
          />
        ))}
      </motion.div>

      {/* Next button */}
      <NavCircleButton
        direction="right"
        onClick={() =>
          currentIndex === steps.length - 1 ? onFinish?.() : setCurrentIndex((p) => p + 1)
        }
        aria-label="Next step"
        className="absolute top-1/2 right-2 z-20 -translate-y-1/2"
      />

      {/* Dots navigation */}
      <div
        role="tablist"
        aria-label="Slide navigation"
        className={`flex w-full justify-center ${
          round ? 'absolute bottom-4 left-1/2 z-20 -translate-x-1/2' : 'mt-4'
        }`}
      >
        {ONBOARDING_STEPS.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={currentIndex % ONBOARDING_STEPS.length === i}
            tabIndex={currentIndex % ONBOARDING_STEPS.length === i ? 0 : -1}
            onClick={() => setCurrentIndex(i)}
            className={`bg-border focus:ring-primary h-2 w-2 rounded-full transition-transform focus:ring-2 focus:outline-none ${
              currentIndex % ONBOARDING_STEPS.length === i
                ? 'bg-primary scale-125'
                : 'bg-[rgba(255,255,255,1)]'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
