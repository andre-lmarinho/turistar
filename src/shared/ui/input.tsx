// src/shared/ui/input.tsx
'use client';

import React, { useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { lucideIcons, type LucideIconName } from './icon';
import { cn } from '@/shared/utils/cn';

/* Variants ------------------------------------------------------------ */
const inputVariants = cva(
  'inline-flex min-w-0 items-stretch overflow-hidden rounded border transition-colors focus-within:outline-none',
  {
    variants: {
      inputSize: {
        default: 'w-28',
        sm: 'w-22',
        lg: 'w-48',
        full: 'w-full',
        auto: 'w-auto',
      },
      background: {
        default: 'bg-background',
        muted: 'bg-muted/30',
      },
      hasIcon: {
        true: 'pl-0',
        false: '',
      },
      tone: {
        default: '',
        ringed: 'focus-within:ring-primary focus-within:ring-2 focus-within:ring-offset-2',
        search:
          'flex w-full items-center justify-between focus-within:ring-primary focus-within:ring-2',
        plannerTitle:
          'focus-within:border-border focus-within:bg-background cursor-pointer rounded-md border-2 border-transparent bg-transparent transition-colors focus-within:cursor-text',
      },
    },
    defaultVariants: {
      inputSize: 'default',
      background: 'default',
      hasIcon: false,
      tone: 'default',
    },
  }
);

const inputFieldVariants = cva(
  'min-w-0 flex-1 bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  {
    variants: {
      align: {
        left: 'text-left',
        right: 'text-right',
      },
      density: {
        default: 'px-2 py-1 text-base',
        compact: 'px-2 py-1 text-sm',
        relaxed: 'px-3 py-2 text-base',
        search: 'px-4 py-2 text-sm',
        activityTitle: 'px-2 py-2 text-2xl font-bold',
        plannerTitle: 'px-4 py-2 text-3xl font-semibold md:text-5xl',
      },
    },
    defaultVariants: {
      align: 'right',
      density: 'default',
    },
  }
);

/* Input Component -------------------------------------------- */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants> &
  VariantProps<typeof inputFieldVariants> & {
    value?: string;
    onValueChange?: (val: string) => void;
    labelId?: string;
    icon?: LucideIconName;
    iconProps?: React.SVGAttributes<SVGSVGElement>;
    inputClassName?: string;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    value,
    onValueChange,
    labelId,
    id,
    inputSize,
    background,
    className,
    icon,
    iconProps,
    tone,
    density,
    align,
    inputClassName,
    ...rest
  },
  ref
) {
  const { onChange, type = 'text', ...restProps } = rest;

  const generatedId = useId();
  const inputId = labelId ?? (typeof id === 'string' ? id : undefined) ?? generatedId;

  const IconComponent = icon ? lucideIcons[icon] : undefined;
  const hasIcon = Boolean(IconComponent);

  const { className: iconClassName, ...iconRest } = iconProps ?? {};

  return (
    <div
      className={cn(
        inputVariants({ inputSize, background, hasIcon, tone }),
        className
      )}
    >
      {hasIcon && IconComponent ? (
        <label
          htmlFor={inputId}
          className="bg-muted flex items-center border-r border-border px-2"
        >
          <IconComponent
            aria-hidden="true"
            className={cn('size-4 text-muted-foreground', iconClassName)}
            {...iconRest}
          />
        </label>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        type={type}
        value={value ?? (onValueChange ? '' : undefined)}
        onChange={(event) => {
          onValueChange?.(event.target.value);
          onChange?.(event);
        }}
        className={cn(
          inputFieldVariants({ align, density }),
          inputClassName
        )}
        {...restProps}
      />
    </div>
  );
});

export { Input, inputVariants };
