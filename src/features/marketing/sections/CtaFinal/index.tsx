'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

import { Button } from '@/shared/ui/button';

export type CtaFinalAction = {
  href: string;
  label: string;
  variant?: ComponentProps<typeof Button>['variant'];
  target?: string;
  rel?: string;
};

export interface CtaFinalProps {
  title: string;
  description?: string;
  primaryAction: CtaFinalAction;
  secondaryAction?: CtaFinalAction;
}

function renderAction(
  action: CtaFinalAction,
  fallbackVariant?: ComponentProps<typeof Button>['variant']
) {
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

export default function CtaFinal({
  title,
  description,
  primaryAction,
  secondaryAction,
}: CtaFinalProps) {
  return (
    <section>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      <div>
        {renderAction(primaryAction)}
        {secondaryAction ? renderAction(secondaryAction, 'outline') : null}
      </div>
    </section>
  );
}
