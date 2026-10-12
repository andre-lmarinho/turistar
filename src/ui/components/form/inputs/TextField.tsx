"use client";

import { cva } from "class-variance-authority";
import { forwardRef, useId } from "react";
import { useFormContext } from "react-hook-form";

import { cn } from "@/ui/utils/cn";

import { HintsOrErrors } from "./HintOrErrors";
import { Label } from "./Label";
import type { InputFieldProps, InputProps } from "./types";

export const inputStyles = cva(
  [
    "rounded-md border",
    "w-full",
    "bg-background",
    "border-input",
    "text-foreground",
    "placeholder:text-muted-foreground",
    "hover:border-primary",
    "focus:border-primary",
    "focus:ring-1",
    "focus:ring-ring",
    "disabled:bg-muted",
    "disabled:cursor-not-allowed",
    "transition-colors",
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
  { size = "md", className, ...props },
  ref
) {
  return <input {...props} ref={ref} className={cn(inputStyles({ size }), className)} />;
});

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(props, ref) {
  const generatedId = useId();
  const form = useFormContext();
  const {
    id,
    name,
    label,
    className,
    addOnSuffix,
    size = "md",
    type = "text",
    readOnly,
    ...passThrough
  } = props;
  const fieldName = name ?? "";
  const resolvedLabel = label ?? fieldName;

  const inputId = typeof id === "string" && id.trim().length > 0 ? id : generatedId;
  const error = fieldName ? form?.getFieldState(fieldName, form.formState).error : undefined;
  const errorId = `${inputId}-error`;
  const describedBy =
    [passThrough["aria-describedby"], error ? errorId : undefined].filter(Boolean).join(" ") || undefined;
  const sharedInputProps = {
    ...passThrough,
    id: inputId,
    name: fieldName || undefined,
    type,
    readOnly,
    "aria-invalid": error ? true : passThrough["aria-invalid"],
    "aria-describedby": describedBy,
  };
  const shouldRenderLabel = Boolean(resolvedLabel);

  return (
    <div>
      {shouldRenderLabel ? <Label htmlFor={inputId}>{resolvedLabel}</Label> : null}
      {addOnSuffix ? (
        <div
          className={cn(
            inputStyles({ size }),
            "focus-within:border-ring focus-within:ring-ring flex items-center gap-2 focus-within:ring-2"
          )}>
          <input
            {...sharedInputProps}
            className={cn("min-w-0 flex-1 bg-transparent outline-none", className)}
            ref={ref}
          />
          <div className="flex items-center text-sm font-medium">{addOnSuffix}</div>
        </div>
      ) : (
        <Input {...sharedInputProps} ref={ref} size={size} className={className} />
      )}
      {fieldName ? <HintsOrErrors fieldName={fieldName} id={errorId} /> : null}
    </div>
  );
});

export const TextField = forwardRef<HTMLInputElement, InputFieldProps>(function TextField(props, ref) {
  return <InputField ref={ref} {...props} />;
});
