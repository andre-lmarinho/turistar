"use client";

import { useTranslations } from "next-intl";
import { forwardRef, useState } from "react";

import { Eye, EyeOff } from "@/ui/components/icon/lucide-icons";
import { Tooltip } from "@/ui/components/tooltip/Tooltip";

import { FloatingInputField } from "./TextField";
import type { InputFieldProps } from "./types";

export const EmailField = forwardRef<HTMLInputElement, InputFieldProps>(function EmailField(props, ref) {
  return (
    <FloatingInputField
      ref={ref}
      type="email"
      autoCapitalize="none"
      autoComplete="email"
      autoCorrect="off"
      inputMode="email"
      {...props}
    />
  );
});

export const PasswordField = forwardRef<HTMLInputElement, InputFieldProps>(
  function PasswordField(props, ref) {
    const t = useTranslations();
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible((prev) => !prev);

    const toggleLabel = t(isVisible ? "hidePassword" : "showPassword");

    return (
      <FloatingInputField
        ref={ref}
        type={isVisible ? "text" : "password"}
        addOnSuffix={
          <Tooltip content={toggleLabel}>
            <button
              type="button"
              onClick={toggleVisibility}
              aria-label={toggleLabel}
              aria-pressed={isVisible}
              disabled={props.disabled}
              className="text-folio-ink-soft hover:text-folio-coral focus-visible:ring-folio-coral flex size-11 min-w-11 items-center justify-center rounded-sm focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60">
              {isVisible ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </Tooltip>
        }
        {...props}
      />
    );
  }
);
