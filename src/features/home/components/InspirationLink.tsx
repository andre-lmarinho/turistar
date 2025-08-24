// src/features/home/components/InspirationLink.tsx
'use client';

import Link from 'next/link';
import rome from '@/data/rome.json';
import paris from '@/data/paris.json';

export default function InspirationLink() {
  const destinations = [
    { city: 'rome', label: rome.title_inspiration },
    { city: 'paris', label: paris.title_inspiration },
  ];

  return (
    <section className="bg-card w-full">
      <div className="mx-auto max-w-screen-lg p-8 pt-40 sm:pt-16 md:pt-24 lg:pt-32">
        <div className="relative flex flex-col items-center pb-4 text-center">
          <h2 className="pb-6 text-[36px] leading-[1.1] font-semibold tracking-tight md:text-[42px]">
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
              <Link
                href={`/inspiration/${d.city}`}
                className="block w-56 rounded-lg border bg-white p-6 text-center shadow-sm transition hover:shadow"
              >
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
