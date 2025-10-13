import type { ReactNode } from 'react';

import { MarketingSection } from '@/features/website/ui/section/Wrapper';
import { Button } from '@/shared/ui/button';

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

const EYEBROW_CLASSES =
  'text-primary bg-primary/10 pointer-events-none inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none';

export function HeroTwoColumns({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  media,
  additionalContent,
}: HeroTwoColumnsProps) {
  return (
    <MarketingSection variant="card" className="py-20 sm:py-24 lg:py-28">
      <div className="flex flex-col items-start gap-4">
        {eyebrow ? <label className={EYEBROW_CLASSES}>{eyebrow}</label> : null}
        <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] leading-[1.1] font-bold text-balance">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-[clamp(1rem,2.4vw,1.125rem)] leading-[1.5] text-balance">
            {description}
          </p>
        ) : null}
        {primaryAction || secondaryAction ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
            {primaryAction ? (
              <Button
                href={primaryAction.href}
                target={primaryAction.target}
                rel={primaryAction.rel}
              >
                {primaryAction.label}
              </Button>
            ) : null}
            {secondaryAction ? (
              <Button
                href={secondaryAction.href}
                target={secondaryAction.target}
                rel={secondaryAction.rel}
                variant="ghost"
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}
        {additionalContent}
      </div>
      {media ? <div className="relative flex justify-center lg:justify-end">{media}</div> : null}
    </MarketingSection>
  );
}
