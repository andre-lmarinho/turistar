// src/components/home/InspirationLink.tsx
'use client';

import Link from 'next/link';

export default function InspirationLink() {
  return (
    <section className="container p-8">
      <h2 className="font-title text-2xl mb-4">Trip Inspiration</h2>
      <Link
        href="/inspiration/rome"
        className="text-primary underline hover:text-primary/80"
      >
        A 4 day trip to Rome
      </Link>
    </section>
  );
}
