'use client';

import Link from 'next/link';

import { Button } from '@/shared/ui/button';

export default function FinalCta() {
  return (
    <section className="bg-card w-full py-16">
      <div className="mx-auto w-full px-6 text-center md:w-[60%]">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Start using Turistar today</h2>
        <Button asChild>
          <Link href="/signup">Start Your Planning</Link>
        </Button>
      </div>
    </section>
  );
}
