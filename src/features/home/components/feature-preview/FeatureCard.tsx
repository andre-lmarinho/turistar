// src/features/home/components/feature-preview/FeatureCard.tsx

import { cn } from '@/shared/utils';
import type { Feature } from './types';

export default function FeatureCard({
  feature,
  isActive,
  onClick,
  asButton = true,
}: {
  feature: Feature;
  isActive: boolean;
  onClick?: () => void;
  asButton?: boolean;
}) {
  const desktopShadow = isActive
    ? 'md:[box-shadow:rgba(9,30,66,0.15)_0px_0.5rem_1rem_0px]'
    : 'md:[box-shadow:none]';

  const barClasses = cn(
    'before:content-[""] before:w-[6px] before:bg-primary md:before:bg-transparent',
    isActive && 'md:before:bg-primary'
  );

  const classes = cn(
    'feature-card relative w-full rounded p-6 text-left overflow-hidden',
    'before:absolute before:inset-y-0 before:left-0',
    barClasses,
    // keyboard-only focus style
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60 focus-visible:outline-offset-0',
    'transition-[transform,box-shadow,background-color] duration-200 ease-out',
    'cursor-pointer',
    desktopShadow
  );

  const content = (
    <p className="sm:text-15 leading-snug font-light md:leading-[1.2]">
      <span className="font-medium">{feature.title} </span>
      {feature.description}
    </p>
  );

  return asButton ? (
    <button type="button" onClick={onClick} aria-pressed={isActive} className={classes}>
      {content}
    </button>
  ) : (
    <div tabIndex={0} role="button" className={classes}>
      {content}
    </div>
  );
}
