import Link from 'next/link';
import type { ReactNode } from 'react';

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
    <section>
      <div>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {primaryAction || secondaryAction ? (
          <div>
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
      {media ? <div>{media}</div> : null}
    </section>
  );
}
