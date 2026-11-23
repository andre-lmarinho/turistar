"use client";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import Link from "next/link";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/ui/utils/cn";

const buttonVariants = cva(
  "inline-flex min-h-11 min-w-6 cursor-pointer items-center justify-center gap-2 rounded px-3 py-2 text-[0.9rem] font-[680] transition-[background-color,border-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-folio-coral focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary:
          "min-h-12.5 border border-folio-citron bg-folio-citron px-4 text-folio-ink hover:border-folio-citron-hover hover:bg-folio-citron-hover",
        accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
        ghost:
          "border border-folio-ink/30 bg-transparent text-folio-ink hover:border-folio-ink/50 hover:bg-folio-ink/5",
      },
    },
    defaultVariants: { variant: "primary" },
  }
);

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

type AnchorButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
};

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
  variant?: ButtonVariant;
};

type ButtonProps = (AnchorButtonProps | NativeButtonProps) & {
  className?: string;
  children?: React.ReactNode;
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ children, className, variant, href, ...props }, ref) => {
    if (href) {
      const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <Link
          {...anchorProps}
          href={href}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          className={cn(buttonVariants({ variant }), className)}>
          {children}
        </Link>
      );
    }

    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        {...buttonProps}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        type={buttonProps.type ?? "button"}
        className={cn(buttonVariants({ variant }), className)}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
