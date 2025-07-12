// src/components/ui/button.tsx

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

/* Button Variants ----------------------------------------------------- */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-all [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        muted: 'w-full bg-card text-foreground shadow-xs hover:bg-muted',
        icon: 'bg-background border border-bg-gray-200 hover:bg-gray-200 backdrop-blur-sm transition-transform duration-300 hover:scale-110',
        icon2: 'bg-background p-2 opacity-0 group-hover:opacity-100 transition-opacity',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
      },
      size: {
        default: 'h-9 px-6 py-6 has-[>svg]:px-3 text-base',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-sm',
        icon: 'w-8 h-8',
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
}: {
  title?: string;
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>['variant'];
}) {
  if (variant === 'icon' && React.isValidElement(children) && 'props' in children) {
    const child = children as React.ReactElement<{ className?: string }>;

    const icon = React.cloneElement(child, {
      className:
        `${child.props.className ?? ''} transition duration-300 group-hover/icon:scale-105`.trim(),
    });

    return (
      <div className="relative group/icon w-full h-full flex items-center justify-center">
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 text-nowrap group-hover/icon:opacity-100 transition-opacity pointer-events-none">
          {title}
        </div>
        {icon}
      </div>
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
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    title?: string;
  }) {
  const Comp = asChild ? Slot : 'button';

  const baseClasses = buttonVariants({ variant, size, className });

  const finalClasses = disabled
    ? baseClasses
        .replace(/hover:[^\s]+/g, '')
        .concat(
          ' pointer-events-none opacity-50 cursor-not-allowed bg-[var(--muted)] text-[var(--muted-foreground)]'
        )
    : baseClasses;

  return (
    <Comp data-slot="button" className={finalClasses} disabled={disabled} {...props}>
      <ButtonIconWrapper variant={variant} title={title}>
        {children}
      </ButtonIconWrapper>
    </Comp>
  );
}

export { Button, buttonVariants };
