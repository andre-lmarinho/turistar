'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { lucideIcons, type LucideIconName } from '../icon';
import { Tooltip } from '../tooltip';
import { cn } from '@/shared/utils/cn';

/* Button Variants ----------------------------------------------------- */
const buttonVariants = cva(
  'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs',
        muted: 'bg-card text-foreground hover:bg-muted w-full shadow-xs',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border-border bg-background text-foreground hover:bg-muted/60 border shadow-xs',
      },
      size: {
        default: 'h-9 px-6 py-6 text-base has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 text-sm has-[>svg]:px-2.5',
        icon:
          'group/icon relative h-8 w-8 rounded-md border border-border bg-background p-0 hover:bg-muted/80 [&_svg:not([class*="size-"])]:size-4 backdrop-blur-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
    compoundVariants: [
      {
        variant: 'ghost',
        size: 'icon',
        className:
          'border-transparent bg-transparent hover:bg-accent/60 hover:text-accent-foreground',
      },
      {
        variant: 'muted',
        size: 'icon',
        className: 'w-auto px-2 py-1',
      },
    ],
  }
);

/* Wrapper for Icon Variant ------------------------------------------- */
function ButtonIconWrapper({
  children,
  size,
}: {
  children: React.ReactNode;
  size?: VariantProps<typeof buttonVariants>['size'];
}) {
  if (size === 'icon' && React.isValidElement(children) && 'props' in children) {
    const child = children as React.ReactElement<{ className?: string }>;

    const icon = React.cloneElement(child, {
      className: cn(
        child.props.className,
        'transition-transform duration-300 transform-gpu group-hover/icon:scale-105'
      ),
    });

    return <div className="relative flex h-full w-full items-center justify-center">{icon}</div>;
  }

  return <>{children}</>;
}

/* Button Component --------------------------------------------------- */
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
      title?: string;
      tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
      tooltipAlign?: 'start' | 'center' | 'end';
      tooltipSideOffset?: number;
      tooltipDelayDuration?: number;
      icon?: LucideIconName;
      iconPosition?: 'left' | 'right';
      iconProps?: React.SVGAttributes<SVGSVGElement>;
    }
>(function Button(
  {
    className,
    variant,
    size,
    asChild = false,
    disabled,
    title,
    children,
    tooltipSide = 'top',
    tooltipAlign,
    tooltipSideOffset,
    tooltipDelayDuration,
    icon,
    iconPosition = 'left',
    iconProps,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : 'button';

  const baseClasses = buttonVariants({ variant, size, className });

  const finalClasses = disabled
    ? baseClasses
        .replace(/hover:[^\s]+/g, '')
        .concat(' opacity-50 cursor-not-allowed bg-[var(--muted)] text-[var(--muted-foreground)]')
    : baseClasses;

  const IconComponent = icon ? lucideIcons[icon] : undefined;

  const iconElement = IconComponent ? <IconComponent aria-hidden="true" {...iconProps} /> : null;

  const wrappedIcon = iconElement ? (
    <ButtonIconWrapper size={size}>{iconElement}</ButtonIconWrapper>
  ) : null;

  const content = iconElement ? (
    iconPosition === 'right' ? (
      <>
        {children}
        {wrappedIcon}
      </>
    ) : (
      <>
        {wrappedIcon}
        {children}
      </>
    )
  ) : (
    <ButtonIconWrapper size={size}>{children}</ButtonIconWrapper>
  );

  const buttonElement = (
    <Comp
      ref={ref}
      data-slot="button"
      className={finalClasses}
      disabled={disabled}
      {...(title ? { 'aria-label': title } : {})}
      {...props}
    >
      {content}
    </Comp>
  );

  return title ? (
    <Tooltip
      content={title}
      side={tooltipSide}
      align={tooltipAlign}
      sideOffset={tooltipSideOffset}
      delayDuration={tooltipDelayDuration}
    >
      {buttonElement}
    </Tooltip>
  ) : (
    buttonElement
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
