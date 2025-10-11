'use client';

import Link from 'next/link';

export type CtaFinalAction = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

export interface CtaFinalProps {
  title: string;
  description?: string;
  primaryAction: CtaFinalAction;
  secondaryAction?: CtaFinalAction;
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
        <Link
          href={primaryAction.href}
          target={primaryAction.target}
          rel={primaryAction.rel}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors"
        >
          {primaryAction.label}
        </Link>
        {secondaryAction ? (
          <Link
            href={secondaryAction.href}
            target={secondaryAction.target}
            rel={secondaryAction.rel}
            className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition-colors"
          >
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
