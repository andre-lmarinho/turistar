'use client';

import Link from 'next/link';

import { Map } from '@/shared/ui/icon';
import MarketingSection from '@/shared/ui/sections/MarketingSection';

export type CtaMidPageAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

const DEFAULT_ACTION: CtaMidPageAction = {
  href: '/signup',
  label: 'Access the app',
};

export interface CtaMidPageProps {
  action?: CtaMidPageAction;
}

export default function CtaMidPage({ action }: CtaMidPageProps) {
  const { href, label, target, rel } = action ?? DEFAULT_ACTION;

  return (
    <MarketingSection
      variant="card"
      innerClassName="mx-auto flex max-w-3xl flex-col items-center text-center"
    >
      <label className="text-primary bg-primary/10 pointer-events-none inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none">
        <Map className="size-4" aria-hidden="true" />
        Web app
      </label>
      <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Start planning now</h2>
      <p className="text-muted-foreground mt-4 text-lg">Access our app to build your trip today.</p>
      <Link
        href={href}
        target={target}
        rel={rel}
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors"
      >
        {label}
      </Link>
    </MarketingSection>
  );
}
