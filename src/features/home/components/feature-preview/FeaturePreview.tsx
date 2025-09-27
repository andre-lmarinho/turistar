// src/features/home/components/feature-preview/FeaturePreview.tsx
'use client';

import FeatureCarousel from '../../ui/feature-preview/FeatureCarousel';
import type { FeatureCarouselFeature } from '../../ui/feature-preview/FeatureCarousel';

const features: FeatureCarouselFeature[] = [
  {
    title: 'Drag. Drop. Done.',
    description:
      'Design each day in minutes. Add what matters, reorder quickly, and swap ideas in place. The board stays clean and fast, so the plan feels like yours.',
    imgSrc: '/images/home/feature_01.webp',
  },
  {
    title: 'See your trip on the map',
    description:
      'Preview stops by day and see distance at a glance. Routes are clear and reordering keeps context. Jump between pins and cards without losing your place.',
    imgSrc: '/images/home/feature_02.webp',
  },
  {
    title: 'Built in budget',
    description:
      'Track costs as you plan. See running totals by day and for the whole trip. Adjust with confidence and stay within what you set.',
    imgSrc: '/images/home/feature_03.webp',
  },
];

export default function FeaturePreview() {
  return (
    <section className="mx-auto w-full max-w-screen-lg p-8 py-40 sm:py-16 md:py-24 lg:py-32">
      <div className="mb-10 md:max-w-[60%]">
        <h2 className="pb-6 text-2xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
          Planner. Map. Budget.
        </h2>
        <p className="pb-4 text-xl">
          Great trips start with a plan you can see, a map that makes sense, and a budget that keeps
          choices real. Turistar brings these together so decisions are faster and planning feels
          simple.
        </p>
      </div>

      <FeatureCarousel features={features} />
    </section>
  );
}
