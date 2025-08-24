// src/shared/ui/button.tsx
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import Tooltip from './Tooltip';

/* Button Variants ----------------------------------------------------- */
const buttonVariants = cva(
  'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs',
        muted: 'bg-card text-foreground hover:bg-muted w-full shadow-xs',
        icon: 'bg-background border-bg-gray-200 border backdrop-blur-sm hover:bg-gray-200',
        iconrd: 'bg-background rounded-full',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
      },
      size: {
        default: 'h-9 px-6 py-6 text-base has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 text-sm has-[>svg]:px-2.5',
        icon: 'h-8 w-8 [&_svg:not([class*="size-"])]:size-4',
        iconsm: 'h-6 w-6 [&_svg:not([class*="size-"])]:size-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/* Wrapper for Icon Variant ------------------------------------------- */
function ButtonIconWrapper({
  children,
  variant,
}: {
  title?: string;
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  position?: 'top' | 'bottom';
}) {
  if (variant?.includes('icon') && React.isValidElement(children) && 'props' in children) {
    const child = children as React.ReactElement<{ className?: string }>;

    const icon = React.cloneElement(child, {
      className:
        `${child.props.className ?? ''} transition duration-300 group-hover/icon:scale-105`.trim(),
    });

    return <div className="relative flex h-full w-full items-center justify-center">{icon}</div>;
  }

  return <>{children}</>;
}

/* Button Component --------------------------------------------------- */
function Button({
  className,
  variant,
  size,
  asChild = false,
  disabled,
  title,
  children,
  position = 'top',
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    title?: string;
    position?: 'top' | 'bottom';
  }) {
  const Comp = asChild ? Slot : 'button';

  const baseClasses = buttonVariants({ variant, size, className });

  const iconGroup = variant?.includes('icon') ? ' group/icon' : '';

  const finalClasses = disabled
    ? baseClasses
        .replace(/hover:[^\s]+/g, '')
        .concat(' opacity-50 cursor-not-allowed bg-[var(--muted)] text-[var(--muted-foreground)]')
    : baseClasses + iconGroup;

  const buttonElement = (
    <Comp
      data-slot="button"
      className={finalClasses}
      disabled={disabled}
      {...(title ? { 'aria-label': title } : {})}
      {...props}
    >
      <ButtonIconWrapper variant={variant}>{children}</ButtonIconWrapper>
    </Comp>
  );

  return variant?.includes('icon') && title ? (
    <Tooltip content={title} position={position}>
      {buttonElement}
    </Tooltip>
  ) : (
    buttonElement
  );
}

export { Button, buttonVariants };
