import type { ReactNode } from 'react';

import { MarketingSection } from '@/features/website/ui/section/Wrapper';
import { Button } from '@/shared/ui/button';

export type HeroCentralizedAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

export interface HeroCentralizedProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: HeroCentralizedAction;
  secondaryAction?: HeroCentralizedAction;
  media?: ReactNode;
}

export default function HeroCentralized({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  media,
}: HeroCentralizedProps) {
  return (
    <MarketingSection variant="card" className="py-20 sm:py-24 lg:py-28">
      <div className="flex flex-col items-center gap-4 text-center">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] leading-[1.1] font-bold text-balance">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-[clamp(1rem,2.4vw,1.125rem)] leading-[1.5] text-balance">
            {description}
          </p>
        ) : null}
        {primaryAction || secondaryAction ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
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
      </div>
      {media ? <div className="w-full">{media}</div> : null}
    </MarketingSection>
  );
}
