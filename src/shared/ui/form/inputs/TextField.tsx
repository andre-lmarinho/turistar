"use client";

import { cva } from "class-variance-authority";
import { forwardRef, useId } from "react";

import { cn } from "@/shared/utils/cn";

import { HintsOrErrors } from "./HintOrErrors";
import { Label } from "./Label";
import type { InputFieldProps, InputProps } from "./types";

export const inputStyles = cva(
  [
    "rounded-md border",
    "bg-background",
    "border-input",
    "text-foreground",
    "placeholder:text-muted-foreground",
    "focus:border-foreground",
    "focus:ring-2",
    "focus:ring-ring",
    "disabled:bg-muted",
    "disabled:cursor-not-allowed",
    "transition",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-2 text-sm",
        md: "h-10 px-3 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { isFullWidth = true, size = "md", className, ...props },
  ref
) {
  return (
    <input {...props} ref={ref} className={cn(inputStyles({ size }), isFullWidth && "w-full", className)} />
  );
});

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(props, ref) {
  const id = useId();
  const fieldName = props.name ?? "";
  const label = props.label ?? fieldName;
  const {
    labelProps,
    labelClassName,
    labelSrOnly,
    noLabel,
    className,
    containerClassName,
    hint,
    hintErrors,
    inputIsFullWidth,
    showAsteriskIndicator,
    addOnSuffix,
    dataTestid,
    size = "md",
    type = "text",
    readOnly,
    LockedIcon,
    ...passThrough
  } = props;

  const disabled = readOnly || passThrough.disabled;
  const sharedInputProps = {
    id,
    name: fieldName || undefined,
    type,
    "data-testid": dataTestid,
    readOnly,
    ...passThrough,
    disabled,
  };
  const shouldRenderLabel = !noLabel && Boolean(label);

  return (
    <div className={containerClassName}>
      {shouldRenderLabel ? (
        <Label
          {...labelProps}
          htmlFor={labelProps?.htmlFor ?? id}
          className={cn(labelProps?.className, labelClassName, labelSrOnly && "sr-only")}>
          {label}
          {showAsteriskIndicator && passThrough.required && !readOnly ? (
            <span className="text-destructive ml-1">*</span>
          ) : null}
          {LockedIcon ?? null}
        </Label>
      ) : null}
      {addOnSuffix ? (
        <div
          className={cn(
            inputStyles({ size }),
            "flex items-center gap-2",
            inputIsFullWidth !== false && "w-full"
          )}>
          <input
            {...sharedInputProps}
            className={cn("min-w-0 flex-1 bg-transparent outline-none", className)}
            ref={ref}
          />
          <div className="flex items-center text-sm font-medium">{addOnSuffix}</div>
        </div>
      ) : (
        <Input
          {...sharedInputProps}
          ref={ref}
          size={size}
          className={className}
          isFullWidth={inputIsFullWidth !== false}
        />
      )}
      {fieldName ? <HintsOrErrors hintErrors={hintErrors} fieldName={fieldName} /> : null}
      {hint ? <div className="text-muted-foreground mt-2 text-sm">{hint}</div> : null}
    </div>
  );
});

export const TextField = forwardRef<HTMLInputElement, InputFieldProps>(function TextField(props, ref) {
  return <InputField ref={ref} {...props} />;
});
