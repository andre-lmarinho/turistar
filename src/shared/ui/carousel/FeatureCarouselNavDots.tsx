import { cn } from '@/shared/utils/cn';

type FeatureCarouselNavDotsProps = {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  className?: string;
};

export function FeatureCarouselNavDots({
  total,
  current,
  onSelect,
  className,
}: FeatureCarouselNavDotsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              'h-2 cursor-pointer rounded-full transition-[width] duration-200 ease-out',
              isActive ? 'w-[3.75rem] bg-[var(--secondary)]' : 'w-2 bg-[var(--card-foreground)]'
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={isActive ? 'true' : 'false'}
          />
        );
      })}
    </div>
  );
}
