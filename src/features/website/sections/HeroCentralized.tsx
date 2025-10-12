import Link from 'next/link';
import type { ReactNode } from 'react';

import MarketingSection from '@/features/website/ui/section/Wrapper';

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

const EYEBROW_CLASSES =
  'text-primary bg-primary/10 pointer-events-none inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none';
const PRIMARY_CLASSES =
  'inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90';
const SECONDARY_CLASSES =
  'inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60';

export default function HeroCentralized({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  media,
}: HeroCentralizedProps) {
  return (
    <MarketingSection
      variant="card"
      className="py-20 sm:py-24 lg:py-28"
      innerClassName="flex flex-col items-center gap-6 text-center"
    >
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
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
      {media ? <div className="w-full">{media}</div> : null}
    </MarketingSection>
  );
}
