// src/components/home/FeaturePreview.tsx
'use client';

import React from 'react';
import Image from 'next/image';

type Feature = {
  title: string;
  description: string;
  imgSrc: string;
  layout: 'small-left' | 'large-right' | 'large-left' | 'small-right';
};

const features: Feature[] = [
  {
    title: 'Smart planning.',
    description:
      'Create a complete travel itinerary based on your selected dates\u2014 no templates, just flexibility.',
    imgSrc: '/images/mascot_1_.webp',
    layout: 'small-left',
  },
  {
    title: 'Drag-and-drop scheduling.',
    description: 'Easily move and rearrange activities between days to build your ideal trip.',
    imgSrc: '/images/mascot_1_.webp',
    layout: 'large-right',
  },
  {
    title: 'Budget tracking.',
    description:
      'Edit and manage your expenses in a dedicated panel \u2014 keep it organized, day by day.',
    imgSrc: '/images/mascot_1_.webp',
    layout: 'large-left',
  },
  {
    title: 'Interactive map view.',
    description: 'See all your planned locations mapped out for better spatial awareness.',
    imgSrc: '/images/mascot_1_.webp',
    layout: 'small-right',
  },
];

const layoutStyles: Record<Feature['layout'], { li: string; wrapper: string; width: number }> = {
  'small-left': { li: 'col-span-1', wrapper: 'h-full w-full', width: 252 },
  'large-right': { li: 'col-span-2', wrapper: 'aspect-[1.82857] h-full w-full', width: 475 },
  'large-left': { li: 'col-span-2', wrapper: 'aspect-[1.82857] h-full w-full', width: 475 },
  'small-right': { li: 'col-span-1', wrapper: 'aspect-[1.01904] h-full w-full', width: 252 },
};

export default function FeaturePreview() {
  return (
    <section className="featured-preview relative z-10 pt-40 lg:pt-32 md:pt-24 sm:pt-16">
      <div className="container relative z-10 lg:max-w-[960px] md:max-w-3xl xs:max-w-md">
        <h2 className="font-title font-semibold leading-[0.9] tracking-tight text-foreground text-[32px] sm:text-[40px] md:text-[56px] lg:text-[72px] xl:text-[84px] pb-6">
          What can you do?
        </h2>
        <p className="mt-6 max-w-[705px] text-18 leading-tight tracking-tight lg:mt-5 sm:mt-3 sm:max-w-lg sm:text-15">
          Turistar is a personal project focused on clean architecture, drag-and-drop logic, and
          real-world UX — all wrapped in something genuinely helpful.
        </p>
        <ul className="mt-10 grid grid-cols-1 gap-y-5 gap-x-0 sm:gap-y-5 sm:gap-x-5 auto-rows-[200px] sm:grid-cols-3 sm:auto-rows-[300px]">
          {features.map(({ title, description, imgSrc, layout }) => {
            const styles = layoutStyles[layout];
            return (
              <li
                key={title}
                className={`relative bg-black ${styles.li} w-full h-full overflow-hidden rounded-xl bg-grey-2 ring-[6px] ring-white/40`}
              >
                <div className="absolute bottom-0 z-10 col-span-full flex w-full items-end px-6 pb-6 lg:px-5 lg:pb-5 md:px-4 md:pb-4 sm:px-5 sm:pb-5">
                  <p className="relative z-10 font-light leading-snug tracking-snugger text-white/65 md:leading-[1.2] sm:text-15">
                    <span className="font-medium text-white">{title} </span>
                    {description}
                  </p>
                </div>
                <div className="relative col-span-full row-span-full">
                  <span className="absolute left-1/2 top-0 -z-10 h-full w-px"></span>
                  <div
                    className={`absolute left-1/2 ${styles.wrapper} -translate-x-1/2 overflow-hidden sm:-top-12 sm:h-auto xs:-top-8`}
                  >
                    <Image
                      src={imgSrc}
                      alt=""
                      role="presentation"
                      width={styles.width}
                      height={260}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
