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
    <section className={cn('py-24 sm:py-28 lg:py-32', className)}>
      <div className="after:border-border relative mx-auto w-full max-w-[1200px] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:border-x after:border-dotted after:content-['']">
        <div
          className={cn(
            'relative z-10 px-3 sm:px-6 lg:px-8',
            variant === 'card' &&
              'border-border bg-background rounded-xl border shadow-[rgba(36,_36,_36,_0.7)_0px_1px_5px_-4px,rgba(36,_36,_36,_0.05)_0px_4px_8px_0px]',
            innerClassName
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
