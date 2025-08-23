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
    <section className="relative container overflow-hidden px-6 py-20">
      <div className="relative mx-auto flex max-w-4xl flex-col items-center pb-4 text-center">
        <h2 className="text-foreground pb-6 text-[32px] leading-[0.9] font-semibold tracking-tight sm:text-[40px] md:text-[56px] lg:text-[72px] xl:text-[84px]">
          Trip Inspiration
        </h2>
      </div>
      <ul className="mx-auto flex flex-wrap justify-center gap-6">
        {destinations.map((d) => (
          <li key={d.city}>
            <Link
              href={`/inspiration/${d.city}`}
              className="block w-56 rounded-lg border p-6 text-center shadow-sm transition hover:shadow"
            >
              {d.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
