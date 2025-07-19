// src/components/TutorialCarousel.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { TUTORIAL_STEPS } from '@/constants';

export default function TutorialCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setWidth(container.scrollWidth - container.offsetWidth);
  }, []);

  return (
    <motion.div ref={containerRef} className="overflow-hidden">
      <motion.div
        drag="x"
        dragConstraints={{ right: 0, left: -width }}
        className="flex gap-4 cursor-grab active:cursor-grabbing"
      >
        {TUTORIAL_STEPS.map((step) => (
          <div
            key={step.title}
            className="min-w-[260px] p-4 rounded-lg bg-card flex-shrink-0 text-left"
          >
            <div className="relative w-full h-40 mb-2">
              <Image src={step.image} alt="" fill className="object-cover rounded" />
            </div>
            <h3 className="font-semibold mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
