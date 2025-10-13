'use client';

import Link from 'next/link';
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  'focus-visible:ring-primary/60 inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'bg-background text-foreground hover:bg-background/90',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];

type AnchorButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
};

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
  variant?: ButtonVariant;
};

export type ButtonProps = (AnchorButtonProps | NativeButtonProps) & {
  className?: string;
};

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant, href, ...props }, ref) => {
    if (href) {
      const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;

      return (
        <Link
          {...anchorProps}
          href={href}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          className={cn(buttonVariants({ variant }), className)}
        />
      );
    }

    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        {...buttonProps}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        type={buttonProps.type ?? 'button'}
        className={cn(buttonVariants({ variant }), className)}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
