'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { lucideIcons, type LucideIconName } from './icon';
import Tooltip from './Tooltip';
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
        icon: 'bg-background border-border hover:bg-muted border backdrop-blur-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border-border bg-background text-foreground hover:bg-muted/60 border shadow-xs',
        featureCard:
          'relative w-full overflow-hidden rounded p-6 text-left transition-[transform,box-shadow,background-color] duration-200 ease-out cursor-default justify-start gap-0 md:cursor-pointer pointer-events-none md:pointer-events-auto before:absolute before:inset-y-0 before:left-0 before:w-[6px] before:bg-primary before:content-[""] before:opacity-100 before:transition-opacity before:duration-200 before:ease-out md:[box-shadow:none] md:before:opacity-0 aria-[pressed=true]:md:[box-shadow:rgba(9,30,66,0.15)_0px_0.5rem_1rem_0px] aria-[pressed=true]:md:before:bg-primary aria-[pressed=true]:md:before:opacity-100',
        featureCarouselDot:
          'h-2 w-2 justify-center rounded-full p-0 transition-[width] duration-200 ease-out gap-0 bg-[var(--card-foreground)] aria-[current=true]:w-[3.75rem] aria-[current=true]:bg-[var(--secondary)]',
        plannerOnboardingDot:
          'h-2 w-2 justify-center rounded-full p-0 transition-transform focus-visible:ring-2 focus-visible:ring-primary/50 gap-0 bg-[rgba(255,255,255,1)] aria-[selected=true]:scale-125 aria-[selected=true]:bg-primary',
        plannerAddCard:
          'flex h-10 w-full items-center justify-start gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition [&_svg:not([class*="size-"])]:size-[18px]',
        plannerInsertCard:
          'group relative z-20 flex h-2 w-full items-center justify-center gap-0 rounded bg-transparent p-0 py-0 transition hover:bg-transparent focus-visible:ring-0',
        listOption:
          'w-full justify-start gap-0 px-2 py-1 text-left transition-colors hover:bg-accent/80 aria-[selected=true]:bg-accent',
        colorSwatch:
          'h-10 w-[31%] justify-center rounded border-2 border-background p-0 shadow-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[selected=true]:ring-2 data-[selected=true]:ring-primary data-[selected=true]:border-transparent',
        plannerModeToggle:
          'relative z-10 flex-1 bg-transparent px-2 py-1 text-sm font-medium transition-colors hover:bg-transparent justify-center gap-2 text-[var(--foreground)] aria-[selected=true]:text-[var(--primary-foreground)]',
        cta: 'w-full justify-center',
      },
      size: {
        default: 'h-9 px-6 py-6 text-base has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 text-sm has-[>svg]:px-2.5',
        icon: 'h-8 w-8 [&_svg:not([class*="size-"])]:size-4',
        'compact-icon': 'size-7 rounded-full p-0 [&_svg:not([class*="size-"])]:size-[18px]',
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
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>['variant'];
}) {
  if (variant?.includes('icon') && React.isValidElement(children) && 'props' in children) {
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
      position?: 'top' | 'bottom';
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
    position = 'top',
    icon,
    iconPosition = 'left',
    iconProps,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : 'button';

  const baseClasses = buttonVariants({ variant, size, className });

  const iconGroup = variant?.includes('icon') ? ' group/icon' : '';

  const finalClasses = disabled
    ? baseClasses
        .replace(/hover:[^\s]+/g, '')
        .concat(' opacity-50 cursor-not-allowed bg-[var(--muted)] text-[var(--muted-foreground)]')
    : baseClasses + iconGroup;

  const IconComponent = icon ? lucideIcons[icon] : undefined;

  const iconElement = IconComponent ? <IconComponent aria-hidden="true" {...iconProps} /> : null;

  const wrappedIcon = iconElement ? (
    <ButtonIconWrapper variant={variant}>{iconElement}</ButtonIconWrapper>
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
    <ButtonIconWrapper variant={variant}>{children}</ButtonIconWrapper>
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

  return variant?.includes('icon') && title ? (
    <Tooltip content={title} position={position}>
      {buttonElement}
    </Tooltip>
  ) : (
    buttonElement
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
