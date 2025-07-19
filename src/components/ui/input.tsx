// src/components/ui/input.tsx
'use client';

import React, { useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* Variants ------------------------------------------------------------ */
const inputVariants = cva('grid grid-cols-[auto_1fr] items-center overflow-hidden border rounded', {
  variants: {
    inputSize: {
      default: 'w-28',
      sm: 'w-22',
      lg: 'w-48',
    },
    background: {
      default: 'bg-background',
      muted: 'bg-muted/30',
    },
  },
  defaultVariants: {
    inputSize: 'default',
    background: 'default',
  },
});

/* Input Component -------------------------------------------- */
interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  value: string;
  onValueChange: (val: string) => void;
  labelId?: string;
  icon?: React.ReactNode;
}

function Input({
  value,
  onValueChange,
  labelId,
  inputSize,
  background,
  className,
  icon,
  ...props
}: InputProps) {
  const inputId = labelId ?? useId();

  return (
    <div className={cn(inputVariants({ inputSize, background }), className)}>
      <label htmlFor={inputId} className="bg-gray-100 border-r-1">
        {icon && <div className="m-2 text-muted-foreground">{icon}</div>}
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        className="px-2 py-1 w-full text-right bg-transparent [appearance:textfield] outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...props}
      />
    </div>
  );
}

export { Input, inputVariants };
