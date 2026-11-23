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

export const FloatingInputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function FloatingInputField(props, ref) {
    const generatedId = useId();
    const { id, label, name, className, placeholder, addOnSuffix, ...passThrough } = props;
    const inputId = typeof id === "string" && id.trim().length > 0 ? id : generatedId;
    const resolvedLabel = label ?? name;
    const hasSuffix = Boolean(addOnSuffix);

    return (
      <div
        className={cn(
          "group/field relative",
          hasSuffix &&
            "min-w-0 [&>div>div]:min-h-11 [&>div>div]:gap-1 [&>div>div]:rounded [&>div>div]:border-folio-input [&>div>div]:bg-folio-white [&>div>div]:pl-0 [&>div>div]:pr-[0.55rem] [&>div>div:focus-within]:border-folio-coral [&>div>div:focus-within]:shadow-[0_0_0_1px_var(--folio-coral)]"
        )}>
        <InputField
          {...passThrough}
          ref={ref}
          id={inputId}
          label=""
          name={name}
          placeholder={placeholder ?? " "}
          addOnSuffix={addOnSuffix}
          className={cn(
            hasSuffix
              ? "peer h-11 min-h-0 w-0 flex-1 border-0 bg-transparent px-[0.9rem] pb-[0.6rem] pt-[0.8rem] text-[0.95rem] text-folio-ink placeholder:text-transparent focus:border-transparent focus:ring-0 aria-invalid:border-folio-error-border"
              : "peer min-h-11 rounded border-folio-input bg-folio-white px-[0.9rem] pb-[0.6rem] pt-[0.8rem] text-[0.95rem] text-folio-ink placeholder:text-transparent hover:border-folio-input-hover focus:border-folio-coral focus:ring-folio-coral aria-invalid:border-folio-error-border",
            className
          )}
        />
        {resolvedLabel ? (
          <Label
            htmlFor={inputId}
            className="pointer-events-none absolute left-3 top-[-0.38rem] z-10 m-0 bg-folio-white px-1 text-xs font-semibold leading-none text-folio-ink-soft transition-all duration-150 group-has-[input:placeholder-shown:not(:focus)]/field:left-[0.9rem] group-has-[input:placeholder-shown:not(:focus)]/field:top-[0.87rem] group-has-[input:placeholder-shown:not(:focus)]/field:bg-transparent group-has-[input:placeholder-shown:not(:focus)]/field:px-0 group-has-[input:placeholder-shown:not(:focus)]/field:text-sm group-has-[input:placeholder-shown:not(:focus)]/field:text-folio-placeholder group-focus-within/field:text-folio-coral motion-reduce:transition-none">
            {resolvedLabel}
          </Label>
        ) : null}
      </div>
    );
  }
);

export const TextField = forwardRef<HTMLInputElement, InputFieldProps>(function TextField(props, ref) {
  return <FloatingInputField ref={ref} {...props} />;
});
