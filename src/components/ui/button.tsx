// src/components/ui/button.tsx
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import Tooltip from './buttonTooltip';

/* Button Variants ----------------------------------------------------- */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-all [&_svg]:pointer-events-none  shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        muted: 'w-full bg-card text-foreground shadow-xs hover:bg-muted',
        icon: 'bg-background border border-bg-gray-200 hover:bg-gray-200 backdrop-blur-sm',
        iconrd: 'bg-background rounded-full',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
      },
      size: {
        default: 'h-9 px-6 py-6 has-[>svg]:px-3 text-base',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-sm',
        icon: 'w-8 h-8 [&_svg:not([class*="size-"])]:size-4',
        iconsm: 'w-6 h-6 [&_svg:not([class*="size-"])]:size-3',
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
  title = 'Action',
  children,
  variant,
  position = 'top',
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

    return (
      <Tooltip content={title} position={position}>
        <div className="relative w-full h-full flex items-center justify-center">{icon}</div>
      </Tooltip>
    );
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

  return (
    <Comp
      data-slot="button"
      className={finalClasses}
      disabled={disabled}
      {...(title ? { 'aria-label': title, title } : {})}
      {...props}
    >
      <ButtonIconWrapper variant={variant} title={title} position={position}>
        {children}
      </ButtonIconWrapper>
    </Comp>
  );
}

export { Button, buttonVariants };
