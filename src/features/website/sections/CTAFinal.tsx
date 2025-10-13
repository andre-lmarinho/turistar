'use client';

import Link from 'next/link';

import MarketingSection from '@/features/website/ui/section/Wrapper';

export type CtaFinalAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

export interface CtaFinalProps {
  variant?: 'default' | 'planning';
  primaryAction: CtaFinalAction;
}

const TITLES: Record<'default' | 'planning', string> = {
  default: 'Start planning together',
  planning: 'Plan your next adventure with Turistar now',
};

export default function CtaFinal({ variant = 'default', primaryAction }: CtaFinalProps) {
  return (
    <MarketingSection variant="card">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-center text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
          {TITLES[variant]}
        </h2>
        <Link
          href={primaryAction.href}
          target={primaryAction.target}
          rel={primaryAction.rel}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/60 inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {primaryAction.label}
        </Link>
      </div>
    </MarketingSection>
  );
}
