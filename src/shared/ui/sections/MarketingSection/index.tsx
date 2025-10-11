import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type MarketingSectionVariant = 'transparent' | 'card';

export interface MarketingSectionProps {
  children: ReactNode;
  variant?: MarketingSectionVariant;
  className?: string;
  innerClassName?: string;
}

export default function MarketingSection({
  children,
  variant = 'transparent',
  className,
  innerClassName,
}: MarketingSectionProps) {
  return (
    <section className={cn('mx-2', className)}>
      <div className="after:border-border relative mx-auto w-full max-w-[1200px] px-3 after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:border-x after:border-dotted after:content-['']">
        <div
          className={cn(
            'relative',
            variant === 'card' &&
              'border-border bg-card rounded-xl border shadow-[rgba(36,_36,_36,_0.7)_0px_1px_5px_-4px,rgba(36,_36,_36,_0.05)_0px_4px_8px_0px]'
          )}
        >
          <div className={cn('mx-auto max-w-[1048px]', innerClassName)}>{children}</div>
        </div>
      </div>
    </section>
  );
}
