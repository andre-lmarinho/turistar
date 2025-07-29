// src/components/home/InspirationLink.tsx
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
    <section className="container p-8">
      <h2 className="font-title mb-4 text-2xl">Trip Inspiration</h2>
      <ul className="space-y-2">
        {destinations.map((d) => (
          <li key={d.city}>
            <Link
              href={`/inspiration/${d.city}`}
              className="text-primary hover:text-primary/80 underline"
            >
              {d.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
