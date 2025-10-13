'use client';

import Link from 'next/link';

import { Map } from '@/shared/ui/icon';
import MarketingSection from '@/features/website/ui/section/Wrapper';

export type CtaMidPageAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

const DEFAULT_PRIMARY: CtaMidPageAction = {
  href: '/signup',
  label: 'Get started',
};

const DEFAULT_SECONDARY: CtaMidPageAction = {
  href: '/pricing',
  label: 'View pricing',
};

export interface CtaMidPageProps {
  primaryAction?: CtaMidPageAction;
  secondaryAction?: CtaMidPageAction;
}

export default function CtaMidPage({ primaryAction, secondaryAction }: CtaMidPageProps) {
  const primary = primaryAction ?? DEFAULT_PRIMARY;
  const secondary = secondaryAction ?? DEFAULT_SECONDARY;

  return (
    <MarketingSection variant="card">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="eyebrow">
          <Map className="size-4" aria-hidden="true" />
          Web app
        </p>
        <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
          Start planning now
        </h2>
        <p className="text-muted-foreground text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5] text-balance">
          Access our app to build your trip today.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href={primary.href}
            target={primary.target}
            rel={primary.rel}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/60 inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {primary.label}
          </Link>
          <Link
            href={secondary.href}
            target={secondary.target}
            rel={secondary.rel}
            className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            {secondary.label}
          </Link>
        </div>
      </div>
    </MarketingSection>
  );
}
