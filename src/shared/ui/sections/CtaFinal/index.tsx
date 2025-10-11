'use client';

import Link from 'next/link';

import MarketingSection from '@/shared/ui/sections/MarketingSection';

export type CtaFinalAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

export interface CtaFinalProps {
  variant?: 'default' | 'planning';
  primaryAction: CtaFinalAction;
  secondaryAction?: CtaFinalAction;
}

const TITLES: Record<'default' | 'planning', string> = {
  default: 'Start planning together',
  planning: 'Plan your next adventure with Turistar now',
};

export default function CtaFinal({
  variant = 'default',
  primaryAction,
  secondaryAction,
}: CtaFinalProps) {
  return (
    <MarketingSection
      variant="card"
      className="py-16 sm:py-20 lg:py-24"
      innerClassName="mx-auto py-16 flex max-w-3xl flex-col items-center gap-6 text-center"
    >
      <h2 className="text-3xl font-semibold tracking-tight">{TITLES[variant]}</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <Link
          href={primaryAction.href}
          target={primaryAction.target}
          rel={primaryAction.rel}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors"
        >
          {primaryAction.label}
        </Link>
        {secondaryAction ? (
          <Link
            href={secondaryAction.href}
            target={secondaryAction.target}
            rel={secondaryAction.rel}
            className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center justify-center rounded-md border px-6 py-3 text-base font-semibold transition-colors"
          >
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    </MarketingSection>
  );
}
