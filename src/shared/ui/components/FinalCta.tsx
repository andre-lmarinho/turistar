'use client';

import Link from 'next/link';

export default function FinalCta() {
  return (
    <section className="bg-card w-full py-16">
      <div className="mx-auto w-full px-6 text-center md:w-[60%]">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Start using Turistar today</h2>
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors"
        >
          Start Your Planning
        </Link>
      </div>
    </section>
  );
}
