// src/components/home/InspirationLink.tsx
'use client';

import Link from 'next/link';

export default function InspirationLink() {
  return (
    <section className="container p-8">
      <h2 className="font-title mb-4 text-2xl">Trip Inspiration</h2>
      <Link href="/inspiration/rome" className="text-primary hover:text-primary/80 underline">
        A 4 day trip to Rome
      </Link>
    </section>
  );
}
