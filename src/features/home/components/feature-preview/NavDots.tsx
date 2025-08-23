// src/features/home/components/feature-preview/NavDots.tsx

import { cn } from '@/shared/utils';

export default function NavDots({
  total,
  current,
  onSelect,
  className,
}: {
  total: number;
  current: number;
  onSelect: (idx: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              'h-2 cursor-pointer rounded-full transition-[width] duration-200 ease-out',
              active ? 'w-[3.75rem] bg-[var(--secondary)]' : 'w-2 bg-[var(--card-foreground)]'
            )}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active ? 'true' : 'false'}
          />
        );
      })}
    </div>
  );
}
