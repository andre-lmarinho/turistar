import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { PlusDivider } from './Divider';

type MarketingSectionVariant = 'transparent' | 'card';

export interface MarketingSectionProps {
  children: ReactNode;
  variant?: MarketingSectionVariant;
  className?: string;
}

export default function MarketingSection({
  children,
  variant = 'transparent',
}: MarketingSectionProps) {
  return (
    <>
      <div className="mx-3 mx-auto w-full max-w-[1200px] border-x px-3 first:pt-[96px]">
        <div
          className={cn(
            'relative',
            variant === 'card' &&
              'border-border bg-card rounded-xl border py-14 shadow-[rgba(36,_36,_36,_0.7)_0px_1px_5px_-4px,rgba(36,_36,_36,_0.05)_0px_4px_8px_0px]'
          )}
        >
          <section className="mx-auto w-full max-w-[1048px] py-[clamp(48px,5vw,96px)]">
            {children}
          </section>
        </div>
      </div>

      <PlusDivider />
    </>
  );
}
