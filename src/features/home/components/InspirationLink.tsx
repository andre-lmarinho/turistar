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
    <section className="bg-card container max-w-3xl p-8 pt-40 sm:max-w-lg sm:pt-16 md:max-w-[960px] md:pt-24 lg:pt-32">
      <div className="relative mx-auto flex max-w-4xl flex-col items-center pb-4 text-center">
        <h2 className="section-title">Be inspired by fellow travellers</h2>
        <p className="section-description">
          Explore a curated list of other travellers trip itineraries and get inspired for your next
          trip. If you like a trip, you can clone it and make it your own.
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
    </section>
  );
}
