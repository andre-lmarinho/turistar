'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { Button } from '@/shared/ui/button';

export type HeroCentralizedAction = {
  href: string;
  label: string;
  variant?: ComponentProps<typeof Button>['variant'];
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

function HeroActionButton({
  action,
  fallbackVariant,
}: {
  action: HeroCentralizedAction;
  fallbackVariant?: ComponentProps<typeof Button>['variant'];
}) {
  const { href, label, variant, target, rel } = action;
  const resolvedVariant = variant ?? fallbackVariant ?? 'default';
  const isExternal = !href.startsWith('/');
  const relValue = rel ?? (isExternal && target === '_blank' ? 'noopener noreferrer' : undefined);

  if (isExternal) {
    return (
      <Button asChild variant={resolvedVariant}>
        <a href={href} target={target} rel={relValue}>
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild variant={resolvedVariant}>
      <Link href={href} target={target} rel={relValue}>
        {label}
      </Link>
    </Button>
  );
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
    <section>
      <div>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {primaryAction || secondaryAction ? (
          <div>
            {primaryAction ? <HeroActionButton action={primaryAction} /> : null}
            {secondaryAction ? (
              <HeroActionButton action={secondaryAction} fallbackVariant="outline" />
            ) : null}
          </div>
        ) : null}
      </div>
      {media ? <div>{media}</div> : null}
    </section>
  );
}
