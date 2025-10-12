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
    <MarketingSection variant="card" className="py-16 sm:py-20 lg:py-24">
      <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold text-balance">
        {TITLES[variant]}
      </h2>
      <Link
        href={primaryAction.href}
        target={primaryAction.target}
        rel={primaryAction.rel}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors"
      >
        {primaryAction.label}
      </Link>
    </MarketingSection>
  );
}
