"use client";

import type React from "react";
import { forwardRef } from "react";

import { cn } from "@/ui/utils/cn";

export interface ToggleButtonProps<T extends string = string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  getOptionTestId?: (option: T) => string;
  renderOption?: (option: T) => {
    label: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  };
}

function ToggleButtonInner<T extends string = string>(
  {
    options,
    value,
    onChange,
    disabled = false,
    className,
    renderOption,
    getOptionTestId,
    ...props
  }: ToggleButtonProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const handleOptionClick = (option: T) => {
    if (!disabled) {
      onChange(option);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "bg-background border-border relative flex h-10 rounded-md border p-1",
        disabled && "opacity-50",
        className
      )}
      {...props}>
      {options.map((option) => {
        const isSelected = option === value;
        const optionConfig = renderOption?.(option);
        const label = optionConfig?.label ?? String(option);
        const Icon = optionConfig?.icon;

        return (
          <button
            key={String(option)}
            type="button"
            onClick={() => handleOptionClick(option)}
            disabled={disabled}
            data-testid={getOptionTestId?.(option)}
            aria-pressed={isSelected}
            className={cn(
              "relative flex-1 cursor-pointer rounded-sm px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-not-allowed",
              isSelected
                ? "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary-foreground"
                : "text-foreground hover:bg-interactive-hover"
            )}>
            <div className="flex h-full w-full items-center justify-center gap-2 p-2">
              {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
              {label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export const ToggleButton = forwardRef(ToggleButtonInner);
