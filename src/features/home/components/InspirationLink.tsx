// src/features/home/components/InspirationLink.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import InspirationCard from './InspirationCard';
import rome from '@/data/rome.json';
import paris from '@/data/paris.json';
import boipeba from '@/data/boipeba.json';

export default function InspirationLink() {
  const destinations = [
    {
      city: 'rome',
      label: rome.title_inspiration,
      images: rome.itinerary.flatMap((day) => day.activities.map((activity) => activity.imageUrl)),
    },
    {
      city: 'paris',
      label: paris.title_inspiration,
      images: paris.itinerary.flatMap((day) => day.activities.map((activity) => activity.imageUrl)),
    },
    {
      city: 'boipeba',
      label: boipeba.title_inspiration,
      images: boipeba.itinerary.flatMap((day) =>
        day.activities.map((activity) => activity.imageUrl)
      ),
    },
  ];

  return (
    <section className="bg-card w-full">
      <div className="mx-auto max-w-screen-lg p-8 py-40 sm:py-16 md:py-24 lg:py-32">
        <div className="relative flex flex-col items-center pb-4 text-center">
          <h2 className="pb-6 text-2xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
            Be inspired by fellow travellers
          </h2>
          <p className="pb-4 text-xl">
            Explore a curated list of other travellers trip itineraries and get inspired for your
            next trip. If you like a trip, you can clone it and make it your own.
          </p>
        </div>
        <ul className="mx-auto flex flex-wrap justify-center gap-6">
          {destinations.map((d) => (
            <li key={d.city}>
              <Link href={`/inspiration/${d.city}`} className="block">
                <InspirationCard title={d.label} imageUrls={d.images} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
