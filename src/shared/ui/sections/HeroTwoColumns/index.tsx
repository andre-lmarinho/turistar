import Link from 'next/link';
import type { ReactNode } from 'react';

import MarketingSection from '@/shared/ui/sections/MarketingSection';

export type HeroTwoColumnsAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

export interface HeroTwoColumnsProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: HeroTwoColumnsAction;
  secondaryAction?: HeroTwoColumnsAction;
  media?: ReactNode;
  additionalContent?: ReactNode;
}

const PRIMARY_CLASSES =
  'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90';
const SECONDARY_CLASSES =
  'inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60';

export default function HeroTwoColumns({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  media,
  additionalContent,
}: HeroTwoColumnsProps) {
  return (
    <MarketingSection
      className="py-20 sm:py-24 lg:py-28"
      innerClassName="grid gap-12 lg:grid-cols-[minmax(0,0.55fr)_1fr] lg:items-center"
    >
      <div className="space-y-6">
        {eyebrow ? (
          <p className="text-primary bg-primary/10 inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold tracking-wide uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
        ) : null}
        {primaryAction || secondaryAction ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                target={primaryAction.target}
                rel={primaryAction.rel}
                className={PRIMARY_CLASSES}
              >
                {primaryAction.label}
              </Link>
            ) : null}
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                target={secondaryAction.target}
                rel={secondaryAction.rel}
                className={SECONDARY_CLASSES}
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}
        {additionalContent}
      </div>
      {media ? <div className="relative flex justify-center lg:justify-end">{media}</div> : null}
    </MarketingSection>
  );
}
